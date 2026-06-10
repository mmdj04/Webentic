'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Moon, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { InputGroup, InputGroupInput } from 'ui'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="fixed top-4 right-4 flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-center size-9 rounded-full text-foreground-lighter hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <Link
          href="/settings"
          className="flex items-center justify-center size-9 rounded-full text-foreground-lighter hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-center font-bold tracking-tight select-none mb-14 leading-none">
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase">
            WEBENTIC
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground uppercase whitespace-nowrap">
            <span className="text-foreground-muted">OPEN</span>-SOURCE
          </span>
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-lg">
          <InputGroup className="w-full">
            <InputGroupInput
              placeholder="Search..."
              className="font-mono text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </form>
      </div>
    </div>
  )
}
