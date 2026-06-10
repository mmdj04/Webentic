'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Star, GitFork, ExternalLink } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from 'ui'

interface MockRepo {
  owner: string
  name: string
  description: string
  language: string
  languageColor: string
  stars: number
  forks: number
}

const MOCK_REPOS: MockRepo[] = [
  { owner: 'supabase', name: 'supabase', description: 'The open source Firebase alternative. Follow to stay updated about our public Beta.', language: 'TypeScript', languageColor: '#3178c6', stars: 76200, forks: 7200 },
  { owner: 'vercel', name: 'next.js', description: 'The React Framework for Production. Built for server-rendered React applications with hybrid static generation.', language: 'JavaScript', languageColor: '#f1e05a', stars: 128000, forks: 27000 },
  { owner: 'tailwindlabs', name: 'tailwindcss', description: 'A utility-first CSS framework for rapid UI development. Highly customizable and low-level.', language: 'CSS', languageColor: '#563d7c', stars: 85000, forks: 4300 },
  { owner: 'shadcn-ui', name: 'ui', description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.', language: 'TypeScript', languageColor: '#3178c6', stars: 82000, forks: 4400 },
  { owner: 'TanStack', name: 'query', description: 'Powerful asynchronous state management for TS/JS, React, Solid, Vue, Svelte and Angular.', language: 'TypeScript', languageColor: '#3178c6', stars: 43000, forks: 3100 },
  { owner: 'esm-dev', name: 'esm.sh', description: 'A fast, global content delivery network for NPM packages with ES module format.', language: 'Go', languageColor: '#00ADD8', stars: 4500, forks: 320 },
  { owner: 'facebook', name: 'react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', language: 'JavaScript', languageColor: '#f1e05a', stars: 232000, forks: 47000 },
  { owner: 'npm', name: 'cli', description: 'The package manager for JavaScript. A CLI tool for installing, publishing, and managing packages.', language: 'JavaScript', languageColor: '#f1e05a', stars: 8700, forks: 3200 },
  { owner: 'biomejs', name: 'biome', description: 'A toolchain for web projects: formatter, linter, and more. Aimed to replace ESLint and Prettier.', language: 'Rust', languageColor: '#dea584', stars: 18000, forks: 560 },
  { owner: 'oven-sh', name: 'bun', description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager - all in one.', language: 'Zig', languageColor: '#ec915c', stars: 76000, forks: 2800 },
]

function RepoCard({ repo }: { repo: MockRepo }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`https://github.com/${repo.owner}/${repo.name}`}
      className={`block no-underline rounded-xl border p-5 transition-colors ${hovered ? 'bg-surface-200 border-strong' : 'bg-surface-100 border-default'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-foreground-muted">{repo.owner}/</span>
            <span className="text-sm font-semibold text-foreground">{repo.name}</span>
          </div>
          <p className="text-sm leading-relaxed mb-3 line-clamp-2 text-foreground-light">
            {repo.description}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <span className="size-2.5 rounded-full inline-block" style={{ backgroundColor: repo.languageColor }} />
              {repo.language}
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <Star className="size-3.5" />
              {repo.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <GitFork className="size-3.5" />
              {repo.forks.toLocaleString()}
            </span>
          </div>
        </div>
        <ExternalLink className="size-4 shrink-0 mt-1 text-foreground-muted" />
      </div>
    </Link>
  )
}

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
      <header style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="mx-auto flex items-center gap-4 px-6 py-4" style={{ maxWidth: 780 }}>
          <Link href="/" className="flex items-center gap-2 no-underline text-sm shrink-0" style={{ color: 'var(--foreground-light)' }}>
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
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-lg font-semibold" style={{ color: 'var(--foreground-default)' }}>
                Results for &ldquo;{query}&rdquo;
              </span>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {MOCK_REPOS.length} repositories
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_REPOS.map((repo) => (
                <RepoCard key={`${repo.owner}/${repo.name}`} repo={repo} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground-default)' }}>
              Search Webentic
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Enter a query above to search open-source repositories.
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
