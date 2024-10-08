import { useState, useCallback, useRef, useEffect } from "react"

type Callback<T> = (state: T) => void
type UpdateState<T> = (newState: T | ((prevState: T) => T), cb?: Callback<T>) => void

export const useStateWithCallback = <T>(initialState: T): [T, UpdateState<T>] => {
  const [state, setState] = useState<T>(initialState)
  const cbRef = useRef<Callback<T> | null>(null)

  const updateState: UpdateState<T> = useCallback((newState, cb) => {
    cbRef.current = cb || null

    setState((prevState) => {
      if (typeof newState === "function") {
        return (newState as (prevState: T) => T)(prevState)
      } else {
        return newState
      }
    })
  }, [])

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = null
    }
  }, [state])

  return [state, updateState]
}
