import type { FormulaFile, FormulaListResponse } from '@beads-ide/shared'
import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export interface UseFormulasReturn {
  formulas: FormulaFile[]
  searchPaths: string[]
  count: number
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useFormulas(): UseFormulasReturn {
  const [formulas, setFormulas] = useState<FormulaFile[]>([])
  const [searchPaths, setSearchPaths] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const doFetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: apiError } = await apiFetch<FormulaListResponse>('/api/formulas')

    if (apiError) {
      setError(new Error(apiError.details || apiError.message))
      setFormulas([])
      setSearchPaths([])
      setCount(0)
    } else if (data) {
      setFormulas(data.formulas)
      setSearchPaths(data.searchPaths)
      setCount(data.count)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    doFetch()
  }, [doFetch])

  return {
    formulas,
    searchPaths,
    count,
    isLoading,
    error,
    refresh: doFetch,
  }
}
