import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface BookingContextType {
  selectedArtist: string
  scrollRequest: number
  setSelectedArtist: (artist: string) => void
  clearSelectedArtist: () => void
  requestBookingScroll: () => void
}

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedArtist, setSelectedArtistState] = useState('')
  const [scrollRequest, setScrollRequest] = useState(0)

  const setSelectedArtist = useCallback((artist: string) => {
    setSelectedArtistState(artist)
  }, [])

  const clearSelectedArtist = useCallback(() => {
    setSelectedArtistState('')
  }, [])

  const requestBookingScroll = useCallback(() => {
    setScrollRequest(r => r + 1)
  }, [])

  const value: BookingContextType = {
    selectedArtist,
    scrollRequest,
    setSelectedArtist,
    clearSelectedArtist,
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