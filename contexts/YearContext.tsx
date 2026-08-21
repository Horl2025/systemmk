'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface YearContextType {
  selectedYear: string
  setSelectedYear: (year: string) => void
  availableYears: string[]
  addYear: (newYear: string) => void
}

const DEFAULT_YEARS = ['2026', '2025', '2024', '2027']

const YearContext = createContext<YearContextType>({
  selectedYear: '2026',
  setSelectedYear: () => {},
  availableYears: DEFAULT_YEARS,
  addYear: () => {},
})

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<string>('2026')
  const [availableYears, setAvailableYears] = useState<string[]>(DEFAULT_YEARS)

  // Load saved year and years list from localStorage
  useEffect(() => {
    try {
      const savedYear = localStorage.getItem('systemmk_selected_year')
      if (savedYear) {
        setSelectedYearState(savedYear)
      }

      const savedYearsList = localStorage.getItem('systemmk_available_years')
      if (savedYearsList) {
        const parsed = JSON.parse(savedYearsList)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableYears(parsed)
        }
      }
    } catch {}
  }, [])

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year)
    try {
      localStorage.setItem('systemmk_selected_year', year)
    } catch {}
  }

  const addYear = (newYear: string) => {
    const cleanYear = newYear.trim()
    if (!cleanYear || availableYears.includes(cleanYear)) return

    const updated = [cleanYear, ...availableYears].sort((a, b) => Number(b) - Number(a))
    setAvailableYears(updated)
    setSelectedYear(cleanYear)

    try {
      localStorage.setItem('systemmk_available_years', JSON.stringify(updated))
    } catch {}
  }

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears, addYear }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}
