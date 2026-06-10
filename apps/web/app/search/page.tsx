'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from 'ui'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-default" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="mx-auto flex items-center gap-4 px-6 py-4" style={{ maxWidth: 780 }}>
          <Link href="/" className="flex items-center gap-2 no-underline text-sm" style={{ color: 'var(--foreground-light)' }}>
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <form onSubmit={handleSearch} className="flex-1">
            <InputGroup className="w-full">
              <InputGroupAddon align="inline-start">
                <InputGroupButton size="tiny" disabled className="bg-transparent border-none cursor-default">
                  <Search className="size-4" style={{ color: 'var(--foreground-muted)' }} />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search..."
                className="font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </InputGroup>
          </form>
        </div>
      </header>

      <main className="mx-auto px-6 py-8" style={{ maxWidth: 780 }}>
        {query ? (
          <div>
            <div className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground-default)' }}>
              Results for &ldquo;{query}&rdquo;
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              No results found.
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground-default)' }}>
              Search Webentic
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Enter a query above to search the documentation.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
