import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const BookingStateContext = createContext(null)
const BookingActionsContext = createContext(null)

export function BookingProvider({ children }) {
  const [selectedArtist, setSelectedArtist] = useState('')
  const [scrollRequest, setScrollRequest] = useState(0)

  const requestBookingScroll = useCallback(() => {
    setScrollRequest((value) => value + 1)
  }, [])

  const clearSelectedArtist = useCallback(() => {
    setSelectedArtist('')
  }, [])

  const stateValue = useMemo(
    () => ({
      selectedArtist,
      scrollRequest,
    }),
    [selectedArtist, scrollRequest]
  )

  const actionsValue = useMemo(
    () => ({
      setSelectedArtist,
      clearSelectedArtist,
      requestBookingScroll,
    }),
    [clearSelectedArtist, requestBookingScroll]
  )

  return (
    <BookingStateContext.Provider value={stateValue}>
      <BookingActionsContext.Provider value={actionsValue}>{children}</BookingActionsContext.Provider>
    </BookingStateContext.Provider>
  )
}

export function useBookingState() {
  const context = useContext(BookingStateContext)
  if (!context) {
    throw new Error('useBookingState must be used within a BookingProvider')
  }
  return context
}

export function useBookingActions() {
  const context = useContext(BookingActionsContext)
  if (!context) {
    throw new Error('useBookingActions must be used within a BookingProvider')
  }
  return context
}
