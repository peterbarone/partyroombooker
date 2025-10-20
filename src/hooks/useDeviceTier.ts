'use client'
import { useEffect, useState } from 'react'

type Tier = 'mobile' | 'tablet' | 'desktop'

export default function useDeviceTier(): Tier {
  const [tier, setTier] = useState<Tier>('desktop')
  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth
      setTier(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  return tier
}
