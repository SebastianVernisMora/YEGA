import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('yega_cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem('yega_cart', JSON.stringify(items)) } catch {}
  }, [items])

  const storeId = useMemo(() => (items[0]?.tiendaId || null), [items])

  const addItem = (product, cantidad = 1) => {
    // Enforzar un solo store por carrito
    const p = product
    if (!p?.tiendaId?._id) return
    if (storeId && storeId !== p.tiendaId._id) {
      // Resetear carrito si cambia de tienda
      setItems([{ producto: p, cantidad, tiendaId: p.tiendaId._id }])
      return
    }
    setItems(prev => {
      const idx = prev.findIndex(it => it.producto._id === p._id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + cantidad }
        return next
      }
      return [...prev, { producto: p, cantidad, tiendaId: p.tiendaId._id }]
    })
  }

  const removeItem = (productId) => {
    setItems(prev => prev.filter(it => it.producto._id !== productId))
  }

  const clear = () => setItems([])

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + (it.producto.precio * it.cantidad), 0), [items])

  const value = { items, addItem, removeItem, clear, subtotal, storeId }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

