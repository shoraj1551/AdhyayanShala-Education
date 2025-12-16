import Stripe from 'stripe'

// Create a function to get Stripe instance - only called when needed
export function createStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-07-30.basil',
    typescript: true,
  })
}

// Note: Don't export a default instance to avoid module-level initialization