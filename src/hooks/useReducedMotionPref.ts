'use client'
import { useEffect, useState } from 'react'

export default function useReducedMotionPref() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(m.matches)
    handler()
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])
  return reduced
}
