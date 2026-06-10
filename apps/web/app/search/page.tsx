'use client'

import { useState, Suspense, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Star,
  GitFork,
  ExternalLink,
  Loader2,
  FileText,
  BookOpen,
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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AnalysisDoc {
  id: string
  repo_owner: string
  repo_name: string
  repo_url: string
  documentation: string | null
  analysis_data: Record<string, unknown> | null
  created_at: string
}

function RepoCard({
  analysis,
  onSelect,
}: {
  analysis: AnalysisDoc
  onSelect: (analysis: AnalysisDoc) => void
}) {
  const [hovered, setHovered] = useState(false)
  const data = analysis.analysis_data || {}

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
            {data.stargazers_count != null && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <Star className="size-3.5" />
                {(data.stargazers_count as number).toLocaleString()}
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
          <a
            href={analysis.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-lighter hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-4" />
          </a>
          <Button size="tiny" type="primary" icon={<BookOpen className="size-3" />}>
            View Docs
          </Button>
        </div>
      </div>
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [results, setResults] = useState<AnalysisDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [selectedDoc, setSelectedDoc] = useState<AnalysisDoc | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedDoc(null)
    try {
      let query = supabase
        .from('repository_analyses')
        .select('id, repo_owner, repo_name, repo_url, documentation, analysis_data, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)

      if (q.trim()) {
        query = query.or(`repo_name.ilike.%${q}%,repo_owner.ilike.%${q}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setResults((data || []) as unknown as AnalysisDoc[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    doSearch(query)
  }, [query, doSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    router.push(`/search?q=${encodeURIComponent(q)}`)
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
        {selectedDoc && selectedDoc.documentation && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="size-5 text-foreground" />
                  <h1 className="text-xl font-bold text-foreground">
                    {selectedDoc.repo_owner}/{selectedDoc.repo_name}
                  </h1>
                  <Badge color="green">Documentation</Badge>
                </div>
                <a
                  href={selectedDoc.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground-lighter hover:text-foreground transition-colors"
                >
                  {selectedDoc.repo_url} <ExternalLink className="size-3 inline" />
                </a>
              </div>
              <div className="flex gap-2">
                <Button size="tiny" type="default" onClick={() => setSelectedDoc(null)}>
                  Back to Results
                </Button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none border rounded-xl p-6 bg-surface-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedDoc.documentation}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {!selectedDoc && (
          <>
            {searched && (
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
                    {results.length} repositories
                  </span>
                )}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-foreground-muted" />
              </div>
            )}

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
                    onSelect={(a) => setSelectedDoc(a)}
                  />
                ))}
              </div>
            )}

            {!loading && !error && searched && results.length === 0 && (
              <div className="text-center py-20">
                <FileText className="size-8 text-foreground-muted mx-auto mb-3" />
                <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
                  {query
                    ? `No documented repositories found for "${query}"`
                    : 'No documented repositories yet'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {query
                    ? 'Try a different search term'
                    : 'Documentation is generated automatically for popular repositories'}
                </p>
              </div>
            )}

            {!searched && (
              <div className="text-center py-20">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground-default)' }}>
                  Browse Documented Repositories
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Search for repositories to view AI-generated documentation.
                </div>
              </div>
            )}
          </>
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
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Loading...
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
