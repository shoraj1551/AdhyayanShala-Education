"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/providers/cart-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { getStripe } from '@/lib/stripe-client'
import { ShoppingCart, X, Plus, Minus, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddToCartButton({ 
  item 
}: { 
  item: { 
    id: string
    type: 'course' | 'workshop' | 'test'
    name: string
    description?: string
    price: number
    image?: string
  }
}) {
  const { addItem, items } = useCart()
  const isInCart = items.some(cartItem => cartItem.id === item.id)

  return (
    <Button
      onClick={() => addItem(item)}
      disabled={isInCart}
      className="w-full"
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isInCart ? 'In Cart' : 'Add to Cart'}
    </Button>
  )
}

export function CartSummary() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!user) {
      router.push('/signin?redirect=/checkout')
      return
    }

    if (items.length === 0) return

    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            images: item.image ? [item.image] : [],
          })),
          metadata: {
            cart_items: JSON.stringify(items.map(item => ({ id: item.id, type: item.type })))
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await getStripe()

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">Your cart is empty</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </div>
          <Badge variant="secondary">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-gray-600 capitalize">{item.type}</p>
              <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-8 text-center">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold text-green-600">
              ${total.toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={handleCheckout}
              disabled={loading || !user}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Checkout'}
            </Button>
            
            {!user && (
              <p className="text-xs text-gray-600 text-center">
                Please sign in to checkout
              </p>
            )}
            
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}