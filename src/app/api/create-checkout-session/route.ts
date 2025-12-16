import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createCheckoutSessionSchema } from '@/lib/validations/checkout.schema'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars)
      return NextResponse.json({
        error: 'Server configuration error',
        missingVars: missingEnvVars
      }, { status: 500 })
    }

    // Initialize Stripe
    const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })

    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

    // Check if user is authenticated
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new AppError(401, 'Unauthorized')
    }

    // Validate request body
    const body = await validateRequest(request, createCheckoutSessionSchema) as any

    const { items, metadata } = body

    // Verify prices against database
    for (const item of items) {
      let dbPrice: number | null = null

      // Fetch actual price from database based on item type
      if (item.type === 'course') {
        const { data } = await supabase
          .from('courses')
          .select('price')
          .eq('id', item.id)
          .single()
        dbPrice = data?.price
      } else if (item.type === 'workshop') {
        const { data } = await supabase
          .from('workshops')
          .select('price')
          .eq('id', item.id)
          .single()
        dbPrice = data?.price
      } else if (item.type === 'test') {
        const { data } = await supabase
          .from('tests')
          .select('price')
          .eq('id', item.id)
          .single()
        dbPrice = data?.price
      }

      // Verify price matches
      if (dbPrice === null) {
        throw new AppError(404, `Item not found: ${item.id}`)
      }

      if (Math.abs(dbPrice - item.price) > 0.01) {
        throw new AppError(400, `Price mismatch for item ${item.id}. Expected ${dbPrice}, got ${item.price}`)
      }
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images || [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        ...metadata,
      },
    })

    // Store the pending enrollment in the database
    for (const item of items) {
      await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          item_type: item.type,
          item_id: item.id,
          payment_status: 'pending',
          payment_id: session.id,
          amount_paid: item.price,
        })
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    return handleApiError(error)
  }
}