'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface YearContextType {
  selectedYear: string
  setSelectedYear: (year: string) => void
  availableYears: string[]
  addYear: (newYear: string) => void
  updateYear: (oldYear: string, newYear: string) => void
  deleteYear: (yearToDelete: string) => void
}

const DEFAULT_YEARS = ['2026', '2025', '2024', '2027']

const YearContext = createContext<YearContextType>({
  selectedYear: '2026',
  setSelectedYear: () => {},
  availableYears: DEFAULT_YEARS,
  addYear: () => {},
  updateYear: () => {},
  deleteYear: () => {},
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

  const updateYear = (oldYear: string, newYear: string) => {
    const cleanNewYear = newYear.trim()
    if (!cleanNewYear || cleanNewYear === oldYear) return

    const updated = availableYears.map(y => y === oldYear ? cleanNewYear : y).sort((a, b) => Number(b) - Number(a))
    setAvailableYears(updated)
    if (selectedYear === oldYear) {
      setSelectedYear(cleanNewYear)
    }

    try {
      localStorage.setItem('systemmk_available_years', JSON.stringify(updated))
    } catch {}
  }

  const deleteYear = (yearToDelete: string) => {
    if (availableYears.length <= 1) {
      alert('ត្រូវរក្សាទុកយ៉ាងហោចណាស់ឆ្នាំមួយ!')
      return
    }

    const updated = availableYears.filter(y => y !== yearToDelete)
    setAvailableYears(updated)
    if (selectedYear === yearToDelete) {
      const nextYear = updated[0] || '2026'
      setSelectedYear(nextYear)
    }

    try {
      localStorage.setItem('systemmk_available_years', JSON.stringify(updated))
    } catch {}
  }

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears, addYear, updateYear, deleteYear }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}
