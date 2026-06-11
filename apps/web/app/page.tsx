'use client'

import { Search, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, InputGroup, InputGroupInput } from 'ui'
import { AnimatedTitle } from './animated-title'
import { GitHubStars } from './github-stars'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <div />
        <div className="flex items-center gap-1">
          <GitHubStars />
          <Button asChild type="text" size="small" className="rounded-full">
            <Link href="/settings" aria-label="Settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-center font-bold tracking-tight select-none mb-14 leading-none">
            <AnimatedTitle />
          </h1>

          <form onSubmit={handleSearch} className="w-full max-w-lg">
            <InputGroup className="w-full">
              <InputGroupInput
                placeholder="Search repositories..."
                className="font-mono text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </form>
        </div>
      </div>
    </div>
  )
}
