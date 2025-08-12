import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: unknown) {
    console.error(`Webhook signature verification failed.`, err instanceof Error ? err.message : 'Unknown error')
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await createClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session

      // Update enrollment status to completed
      if (session.metadata?.user_id && session.payment_status === 'paid') {
        const { error } = await supabase
          .from('enrollments')
          .update({
            payment_status: 'completed',
            enrolled_at: new Date().toISOString(),
          })
          .eq('payment_id', session.id)
          .eq('user_id', session.metadata.user_id)

        if (error) {
          console.error('Error updating enrollment:', error)
        } else {
          console.log('Successfully updated enrollment for session:', session.id)
        }
      }
      break

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent was successful!', paymentIntent.id)
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      
      // Update enrollment status to failed
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ payment_status: 'failed' })
        .eq('payment_id', failedPayment.id)

      if (updateError) {
        console.error('Error updating failed payment:', updateError)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}