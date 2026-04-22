import React, { createContext, useContext, useState, useRef, useCallback } from 'react'

const BookingContext = createContext(null)

/**
 * BookingProvider manages the state flow between Roster and Booking components
 */
export function BookingProvider({ children }) {
  const [selectedArtist, setSelectedArtist] = useState('')
  const bookingSectionRef = useRef(null)

  const scrollToBooking = useCallback(() => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const value = {
    selectedArtist,
    setSelectedArtist,
    bookingSectionRef,
    scrollToBooking,
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

/**
 * Hook to access booking state
 */
export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
