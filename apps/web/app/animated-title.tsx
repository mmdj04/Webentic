'use client'

import { useEffect, useState } from 'react'

interface Stage {
  chars: string[]
  visible: boolean[]
}

const STAGES: Stage[] = [
  {
    chars: ['W', 'E', 'B', '+', 'A', 'E', 'N', 'T', 'I', 'C'],
    visible: [true, true, true, false, false, true, true, true, true, true],
  },
  {
    chars: ['W', 'E', 'B', '+', 'A', 'E', 'N', 'T', 'I', 'C'],
    visible: [true, true, true, true, false, true, true, true, true, true],
  },
  {
    chars: ['W', 'E', 'B', '+', 'A', 'E', 'N', 'T', 'I', 'C'],
    visible: [true, true, true, true, true, true, true, true, true, true],
  },
]

export function AnimatedTitle() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= STAGES.length - 1) return
    const delay = stage === 0 ? 2200 : 1800
    const id = setTimeout(() => setStage((s) => s + 1), delay)
    return () => clearTimeout(id)
  }, [stage])

  const { chars, visible } = STAGES[stage]

  return (
    <>
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
        }
        .char-new {
          animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .char-plus {
          color: #facc15;
        }
        .char-b-glow {
          animation: glow 0.6s ease-in-out 3;
        }
      `}</style>
      <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase tracking-wide">
        {chars.map((ch, i) => {
          const isNewlyVisible =
            stage > 0 && visible[i] && !STAGES[0].visible[i]
          const isPlus = ch === '+' && visible[i]
          const bGlow = ch === 'B' && stage === 0
          return (
            <span
              key={i}
              className={`inline-block transition-all duration-500 ${
                isNewlyVisible ? 'char-new' : ''
              } ${isPlus ? 'char-plus' : ''} ${bGlow ? 'char-b-glow' : ''}`}
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? 'scale(1)' : 'scale(0.5)',
                width: visible[i] ? 'auto' : '0',
                maxWidth: visible[i] ? '2ch' : '0',
                overflow: 'hidden',
                transition: 'opacity 0.4s, transform 0.4s, width 0.4s, max-width 0.4s',
              }}
            >
              {ch}
            </span>
          )
        })}
      </span>
      <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase whitespace-nowrap">
        <span className="text-foreground-muted">OPEN</span>-SOURCE
      </span>
    </>
  )
}
