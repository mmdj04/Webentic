'use client'

import { useEffect, useState } from 'react'

const STAGES = [
  { text: 'WEBENTIC', plus: false, a: false },
  { text: 'WEB+ENTIC', plus: true, a: false },
  { text: 'WEB+AGENTIC', plus: true, a: true },
]

export function AnimatedTitle() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= STAGES.length - 1) return
    const delay = stage === 0 ? 2000 : 1500
    const id = setTimeout(() => setStage((s) => s + 1), delay)
    return () => clearTimeout(id)
  }, [stage])

  return (
    <>
      <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase">
        <span>{STAGES[stage].text}</span>
      </span>
      <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase whitespace-nowrap">
        <span className="text-foreground-muted">OPEN</span>-SOURCE
      </span>
    </>
  )
}
