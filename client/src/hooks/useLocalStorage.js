import { useState, useEffect } from 'react'

// a custom hook that works exactly like useState
// but also saves to localStorage automatically
// and restores from localStorage on page load
//
// key      — the name used to store in localStorage (e.g. "studentInfo")
// initial  — the default value if nothing is saved yet
const useLocalStorage = (key, initial) => {

  // useState with a function as argument — the function only runs once on mount
  // we check localStorage first; if something is saved, use that
  // otherwise use the initial value
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      // localStorage only stores strings, so we JSON.parse to get back the object/array
      return saved ? JSON.parse(saved) : initial
    } catch {
      // if parsing fails for any reason, fall back to initial
      return initial
    }
  })

  // useEffect runs after every render where `value` changed
  // it saves the latest value to localStorage
  useEffect(() => {
    try {
      // JSON.stringify converts objects/arrays to a string for storage
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage can fail if the browser is in private mode or storage is full
      console.warn(`Could not save ${key} to localStorage`)
    }
  }, [key, value])

  // return exactly like useState — [currentValue, setter]
  return [value, setValue]
}

export default useLocalStorage
