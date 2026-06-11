'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { InputGroup, InputGroupInput } from 'ui'
import { GitHubStars } from './github-stars'
import { AnimatedTitle } from './animated-title'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="fixed top-4 right-4 flex items-center gap-1">
        <GitHubStars />
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
          <AnimatedTitle />
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
