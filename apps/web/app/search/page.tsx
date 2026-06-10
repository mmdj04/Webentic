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
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
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
import { searchRepos, getRepo, getRepoReadme, getRepoTree, type GitHubRepo } from '@/lib/github'
import { generateGemini } from '@/lib/gemini'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'failed'

const DOCS_SAMPLE = false

function RepoCard({
  repo,
  onAnalyze,
  analyzingId,
  analysisStatus,
}: {
  repo: GitHubRepo
  onAnalyze: (repo: GitHubRepo) => void
  analyzingId: string | null
  analysisStatus: AnalysisStatus
}) {
  const [hovered, setHovered] = useState(false)
  const isAnalyzing = analyzingId === String(repo.id) && analysisStatus === 'analyzing'

  return (
    <div
      className={`block rounded-xl border p-5 transition-colors ${
        hovered ? 'bg-surface-200 border-strong' : 'bg-surface-100 border-default'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-foreground-muted">{repo.owner.login}/</span>
            <span className="text-sm font-semibold text-foreground">{repo.name}</span>
          </div>
          <p className="text-sm leading-relaxed mb-3 line-clamp-2 text-foreground-light">
            {repo.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {repo.language && (
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <span className="size-2.5 rounded-full inline-block bg-foreground-muted" />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <Star className="size-3.5" />
              {repo.stargazers_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <GitFork className="size-3.5" />
              {repo.forks_count.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end shrink-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-lighter hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-4" />
          </a>
          <Button
            size="tiny"
            type={isAnalyzing ? 'secondary' : 'primary'}
            loading={isAnalyzing}
            disabled={analyzingId === String(repo.id) && analysisStatus !== 'idle' && analysisStatus !== 'completed'}
            onClick={() => onAnalyze(repo)}
            icon={isAnalyzing ? <Loader2 className="size-3 animate-spin" /> : <BookOpen className="size-3" />}
          >
            {isAnalyzing ? 'Analyzing...' : 'Generate Docs'}
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
  const [results, setResults] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [documentation, setDocumentation] = useState<string | null>(null)
  const [analyzedRepo, setAnalyzedRepo] = useState<{ name: string; owner: string; url: string } | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    setDocumentation(null)
    setAnalyzedRepo(null)
    try {
      const repos = await searchRepos(q)
      setResults(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search repositories')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) doSearch(query)
  }, [query, doSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleAnalyze = async (repo: GitHubRepo) => {
    setAnalyzingId(String(repo.id))
    setAnalysisStatus('analyzing')
    setDocumentation(null)
    setAnalyzedRepo({ name: repo.name, owner: repo.owner.login, url: repo.html_url })
    setAnalysisError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to generate documentation')

      const { data: configs } = await supabase
        .from('agent_configs')
        .select('gemini_api_key, github_token')
        .eq('user_id', user.id)
        .maybeSingle()

      const geminiApiKey = configs?.gemini_api_key
      const githubToken = configs?.github_token

      const { data: analysis, error: insertError } = await supabase
        .from('repository_analyses')
        .insert({
          user_id: user.id,
          repo_owner: repo.owner.login,
          repo_name: repo.name,
          repo_url: repo.html_url,
          status: 'analyzing',
        })
        .select()
        .single()

      if (insertError) throw insertError

      const [readme, treeStructure] = await Promise.all([
        getRepoReadme(repo.owner.login, repo.name, githubToken),
        getRepoTree(repo.owner.login, repo.name, repo.default_branch, githubToken).catch(() => 'Unable to fetch tree'),
      ])

      const repoInfo = `
Repository: ${repo.full_name}
Description: ${repo.description || 'N/A'}
Language: ${repo.language || 'N/A'}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Topics: ${repo.topics?.join(', ') || 'N/A'}
Default Branch: ${repo.default_branch}

## README Content:
${readme || 'No README found'}

## File Structure:
${treeStructure}
`

      const prompt = `You are a technical documentation expert. Generate a comprehensive, well-structured documentation page for the following GitHub repository. The documentation should be similar to DeepWiki style - thorough, well-organized, and developer-friendly.

Include the following sections:
1. **Overview** - What the project is about
2. **Quick Start** - How to get started with the project
3. **Architecture** - How the project is structured (based on the file tree)
4. **Key Features** - Main features and capabilities
5. **API / Usage** - How to use the project (from README and structure)
6. **Configuration** - Any configuration options
7. **Contributing** - Guidelines for contributors (if any)
8. **Troubleshooting / FAQ** - Common issues

Format the output in GitHub-flavored Markdown. Be thorough and accurate.

Here is the repository data:
${repoInfo}`

      const docs = await generateGemini(prompt, geminiApiKey)

      await supabase
        .from('repository_analyses')
        .update({
          documentation: docs,
          status: 'completed',
        })
        .eq('id', analysis.id)

      setDocumentation(docs ?? null)
      setAnalysisStatus('completed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setAnalysisError(message)
      setAnalysisStatus('failed')
    } finally {
      setAnalyzingId(null)
    }
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
                placeholder="Search GitHub repositories..."
                className="font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </InputGroup>
          </form>
        </div>
      </header>

      <main className="mx-auto px-6 py-8" style={{ maxWidth: 960 }}>
        {/* Documentation View */}
        {documentation && analyzedRepo && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="size-5 text-foreground" />
                  <h1 className="text-xl font-bold text-foreground">
                    {analyzedRepo.owner}/{analyzedRepo.name}
                  </h1>
                  <Badge color="green">
                    <CheckCircle2 className="size-3 mr-1" />
                    Documentation Generated
                  </Badge>
                </div>
                <a
                  href={analyzedRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground-lighter hover:text-foreground transition-colors"
                >
                  {analyzedRepo.url} <ExternalLink className="size-3 inline" />
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  size="tiny"
                  type="default"
                  icon={<RefreshCw className="size-3" />}
                  onClick={() => {
                    setDocumentation(null)
                    setAnalyzedRepo(null)
                    setAnalysisStatus('idle')
                  }}
                >
                  New Search
                </Button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert border rounded-xl p-6 bg-surface-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {documentation}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!documentation && (
          <>
            {searched && (
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-lg font-semibold" style={{ color: 'var(--foreground-default)' }}>
                  {loading ? 'Searching...' : `Results for "${query}"`}
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
                <XCircle className="size-8 text-red-500 mb-3" />
                <p className="text-sm text-foreground-light mb-2">{error}</p>
                <p className="text-xs text-foreground-muted">Configure your GitHub token in Settings for higher API limits</p>
              </div>
            )}

            {analysisError && (
              <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Analysis Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">{analysisError}</p>
                </div>
              </div>
            )}

            {analysisStatus === 'analyzing' && (
              <div className="mb-6 p-4 border border-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center gap-3">
                <Loader2 className="size-5 text-amber-500 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Generating Documentation</p>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                    Fetching repository data and generating AI documentation...
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && searched && results.length > 0 && (
              <div className="flex flex-col gap-3">
                {results.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onAnalyze={handleAnalyze}
                    analyzingId={analyzingId}
                    analysisStatus={analysisStatus}
                  />
                ))}
              </div>
            )}

            {!loading && !error && searched && results.length === 0 && (
              <div className="text-center py-20">
                <FileText className="size-8 text-foreground-muted mx-auto mb-3" />
                <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
                  No repositories found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  Try a different search term
                </p>
              </div>
            )}

            {!searched && (
              <div className="text-center py-20">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground-default)' }}>
                  Search & Document Repositories
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Enter a query above to search GitHub repositories, then generate AI-powered documentation.
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
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
