import React, { createContext, useContext, useState, useCallback } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [selectedArtist, setSelectedArtist] = useState('')
  const [scrollRequest, setScrollRequest] = useState(0)

  const requestBookingScroll = useCallback(() => {
    setScrollRequest(r => r + 1)
  }, [])

  const clearSelectedArtist = useCallback(() => {
    setSelectedArtist('')
  }, [])

  const value = {
    selectedArtist,
    setSelectedArtist,
    clearSelectedArtist,
    scrollRequest,
    requestBookingScroll,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBookingState() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingState must be used within BookingProvider')
  return ctx
}

export function useBookingActions() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookingActions must be used within BookingProvider')
  return ctx
}
