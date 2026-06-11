'use client'

import { useState, Suspense, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Star,
  GitFork,
  FileText,
  BookOpen,
  ChevronDown,
} from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Button,
  Badge,
} from 'ui'
import { createClient } from '@/lib/supabase/client'

interface AnalysisDoc {
  id: string
  repo_owner: string
  repo_name: string
  repo_url: string
  documentation: string | null
  analysis_data: Record<string, unknown> | null
  created_at: string
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="block rounded-xl border border-default p-5 bg-surface-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 rounded shimmer" />
                <div className="h-4 w-32 rounded shimmer" />
              </div>
              <div className="h-4 w-full rounded shimmer" />
              <div className="flex items-center gap-4">
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-3 w-12 rounded shimmer" />
                <div className="h-3 w-12 rounded shimmer" />
              </div>
            </div>
            <div className="h-8 w-24 rounded shimmer shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

function RepoCard({
  analysis,
  onSelect,
  liveStars,
}: {
  analysis: AnalysisDoc
  onSelect: (analysis: AnalysisDoc) => void
  liveStars?: number
}) {
  const [hovered, setHovered] = useState(false)
  const data = analysis.analysis_data || {}
  const stars = liveStars ?? data.stargazers_count as number | undefined

  return (
    <div
      className={`block rounded-xl border p-5 transition-colors cursor-pointer ${
        hovered ? 'bg-surface-200 border-strong' : 'bg-surface-100 border-default'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(analysis)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-foreground-muted">{analysis.repo_owner}/</span>
            <span className="text-sm font-semibold text-foreground">{analysis.repo_name}</span>
          </div>
          <p className="text-sm leading-relaxed mb-3 line-clamp-2 text-foreground-light">
            {(data.description as string) || 'No description'}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {data.language && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <span className="size-2.5 rounded-full inline-block bg-foreground-muted" />
                {data.language as string}
              </span>
            )}
            {stars != null && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <Star className="size-3.5" />
                {stars.toLocaleString()}
              </span>
            )}
            {data.forks_count != null && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <GitFork className="size-3.5" />
                {(data.forks_count as number).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end shrink-0">
          <Button
            size="tiny"
            type="primary"
            icon={<BookOpen className="size-3" />}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(analysis)
            }}
          >
            View Docs
          </Button>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 30

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [results, setResults] = useState<AnalysisDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [liveStars, setLiveStars] = useState<Record<string, number>>({})

  const supabase = useMemo(() => createClient(), [])

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    setResults([])
    setHasMore(false)
    try {
      let query = supabase
        .from('repository_analyses')
        .select('id, repo_owner, repo_name, repo_url, documentation, analysis_data, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)

      if (q.trim()) {
        query = query.or(`repo_name.ilike.%${q}%,repo_owner.ilike.%${q}%`)
      }

      const { data, error } = await query
      if (error) throw error
      const items = (data || []) as unknown as AnalysisDoc[]
      setResults(items)
      setHasMore(items.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const from = results.length
      const to = from + PAGE_SIZE - 1
      let supaQuery = supabase
        .from('repository_analyses')
        .select('id, repo_owner, repo_name, repo_url, documentation, analysis_data, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (query.trim()) {
        supaQuery = supaQuery.or(`repo_name.ilike.%${query}%,repo_owner.ilike.%${query}%`)
      }

      const { data, error } = await supaQuery
      if (error) throw error
      const items = (data || []) as unknown as AnalysisDoc[]
      setResults(prev => [...prev, ...items])
      setHasMore(items.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setLoadingMore(false)
    }
  }, [supabase, query, results.length, hasMore, loadingMore])

  useEffect(() => {
    doSearch(query)
  }, [query, doSearch])

  useEffect(() => {
    if (results.length === 0) return
    const keys = results.map(r => `${r.repo_owner}/${r.repo_name}`)
    keys.forEach(key => {
      const [owner, repo] = key.split('/')
      fetch(`https://api.github.com/repos/${owner}/${repo}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.stargazers_count != null) {
            setLiveStars(prev => ({ ...prev, [key]: data.stargazers_count }))
          }
        })
        .catch(() => {})
    })
  }, [results])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const navigateToDocs = (analysis: AnalysisDoc) => {
    router.push(`/docs/${analysis.repo_owner}/${analysis.repo_name}`)
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
                placeholder="Search documented repositories..."
                className="font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </InputGroup>
          </form>
        </div>
      </header>

      <main className="mx-auto px-6 py-8" style={{ maxWidth: 960 }}>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-lg font-semibold" style={{ color: 'var(--foreground-default)' }}>
            {loading
              ? 'Loading...'
              : query
                ? `Results for "${query}"`
                : 'All Documented Repositories'}
          </span>
          {!loading && (
            <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {results.length}{hasMore ? '+' : ''} repositories
            </span>
          )}
        </div>

        {loading && <SearchSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-foreground-light">{error}</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="flex flex-col gap-3">
            {results.map((analysis) => (
              <RepoCard
                key={analysis.id}
                analysis={analysis}
                onSelect={navigateToDocs}
                liveStars={liveStars[`${analysis.repo_owner}/${analysis.repo_name}`]}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  type="default"
                  size="medium"
                  icon={<ChevronDown className="size-4" />}
                  loading={loadingMore}
                  onClick={loadMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-20">
            <FileText className="size-8 text-foreground-muted mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
              {searched
                ? (query
                  ? `No documented repositories found for "${query}"`
                  : 'No documented repositories yet')
                : 'Browse Documented Repositories'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
              {searched
                ? (query ? 'Try a different search term' : 'Documentation is generated automatically for popular repositories')
                : 'Search for repositories to view AI-generated documentation.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-background">
          <SearchSkeleton />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
