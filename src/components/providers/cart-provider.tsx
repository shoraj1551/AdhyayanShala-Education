"use client"

import { createContext, useContext, useReducer, useEffect } from 'react'

export interface CartItem {
  id: string
  type: 'course' | 'workshop' | 'test'
  name: string
  description?: string
  price: number
  image?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      let newItems
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        total,
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        total,
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        total,
      }
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
      }
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    
    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      }
    
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  isOpen: false,
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Persist cart to localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (parsedCart.items) {
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: 'ADD_ITEM', payload: item })
          })
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }))
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open })
  }

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}