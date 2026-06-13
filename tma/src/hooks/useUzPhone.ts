import { useState, useCallback } from 'react'

function format(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  else if (d.startsWith('0')) d = d.slice(1)
  d = d.slice(0, 9)
  let r = '+998'
  if (d.length > 0) r += ' ' + d.slice(0, 2)
  if (d.length > 2) r += ' ' + d.slice(2, 5)
  if (d.length > 5) r += ' ' + d.slice(5, 7)
  if (d.length > 7) r += ' ' + d.slice(7, 9)
  return r
}

export function isValidUzPhone(v: string) {
  const d = v.replace(/\D/g, '')
  return d.length === 12 && d.startsWith('998')
}

export function useUzPhone(initial = '') {
  const [value, setValue] = useState(initial ? format(initial) : '')
  const [touched, setTouched] = useState(false)
  const onChange = useCallback((raw: string) => setValue(format(raw)), [])
  const onBlur = useCallback(() => setTouched(true), [])
  const isValid = isValidUzPhone(value)
  const showError = touched && !isValid && value.length > 4
  return { value, onChange, onBlur, isValid, showError }
}
