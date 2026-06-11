'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, GitFork, ExternalLink } from 'lucide-react'
import { Badge } from 'ui'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid
        .render('mermaid-' + Math.random().toString(36).slice(2), chart)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg
        })
        .catch(() => {})
    }
  }, [chart])

  return <div ref={ref} className="my-4 flex justify-center" />
}

interface AnalysisDoc {
  id: string
  repo_owner: string
  repo_name: string
  repo_url: string
  documentation: string | null
  analysis_data: Record<string, unknown> | null
  created_at: string
}

export default function DocsPage() {
  const params = useParams()
  const owner = params.owner as string
  const repo = params.repo as string
  const [doc, setDoc] = useState<AnalysisDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('repository_analyses')
      .select('id, repo_owner, repo_name, repo_url, documentation, analysis_data, created_at')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .eq('status', 'completed')
      .limit(1)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else if (!data || data.length === 0) {
          setError('Documentation not found')
        } else {
          setDoc(data[0] as AnalysisDoc)
        }
        setLoading(false)
      })
  }, [owner, repo])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <svg className="animate-spin size-6 text-foreground-muted" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">{error || 'Documentation not found'}</p>
          <Link href="/search" className="text-foreground-light hover:text-foreground underline">
            Back to search
          </Link>
        </div>
      </div>
    )
  }

  const analysisData = doc.analysis_data as Record<string, unknown> | null
  const sha = analysisData?.indexed_commit_sha as string | undefined
  const branch = analysisData?.default_branch as string | undefined
  const stars = analysisData?.stars as number | null
  const forks = analysisData?.forks as number | null
  const description = analysisData?.description as string | null
  const language = analysisData?.language as string | null
  const topics = analysisData?.topics as string[] | null

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-light hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Search
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold mb-1">
              {doc.repo_owner}/{doc.repo_name}
            </h1>
            {description && (
              <p className="text-sm text-foreground-muted">{description}</p>
            )}
          </div>
          <a
            href={doc.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground-lighter hover:text-foreground transition-colors shrink-0"
          >
            {doc.repo_url}
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {stars != null && (
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <Star className="size-3.5" />
              {(stars as number).toLocaleString()}
            </span>
          )}
          {forks != null && (
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <GitFork className="size-3.5" />
              {(forks as number).toLocaleString()}
            </span>
          )}
          {language && (
            <span className="text-xs text-foreground-muted">{language}</span>
          )}
          {topics && topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topics.slice(0, 5).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {sha && (
          <div className="flex items-center gap-3 text-xs text-foreground-muted mb-6">
            <span>
              Indexed at <time dateTime={doc.created_at}>
                {new Date(doc.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </time>
            </span>
            <a
              href={`${doc.repo_url}/tree/${sha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-foreground transition-colors"
            >
              {sha.slice(0, 7)}
            </a>
            {branch && <span>{branch}</span>}
          </div>
        )}

        <div className="border rounded-xl p-6 bg-surface-100">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const isMermaid = className === 'language-mermaid'
                  if (isMermaid) {
                    return <Mermaid chart={String(children)} />
                  }
                  return <code className={className} {...props}>{children}</code>
                },
                pre({ children }) {
                  return <pre className="bg-muted rounded-md p-4 overflow-x-auto text-sm">{children}</pre>
                },
              }}
            >
              {doc.documentation || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
