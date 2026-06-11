'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLink, BookOpen } from 'lucide-react'
import { Badge, Button } from 'ui'
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
  const router = useRouter()
  const owner = params.owner as string
  const repo = params.repo as string
  const [doc, setDoc] = useState<AnalysisDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const start = Date.now()
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
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 3000 - elapsed)
        setTimeout(() => setReady(true), remaining)
      }).catch(() => {
        setError('Failed to load')
        setLoading(false)
        setTimeout(() => setReady(true), 3000)
      })
  }, [owner, repo])

  if (!ready) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-md shimmer" />
                <div className="h-7 w-48 rounded-md shimmer" />
                <div className="h-5 w-28 rounded-full shimmer" />
              </div>
              <div className="h-4 w-72 rounded-md shimmer" />
              <div className="flex items-center gap-3 mt-1">
                <div className="h-4 w-40 rounded-md shimmer" />
                <div className="h-4 w-16 rounded-md shimmer" />
                <div className="h-4 w-12 rounded-md shimmer" />
              </div>
            </div>
            <div className="h-7 w-28 rounded-md shimmer shrink-0" />
          </div>
          <div className="w-full min-h-[400px] rounded-xl p-6 shimmer" />
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">{error || 'Documentation not found'}</p>
          <Button size="tiny" type="default" onClick={() => router.push('/search')}>
            Back to search
          </Button>
        </div>
      </div>
    )
  }

  const data = doc.analysis_data as Record<string, unknown> | null
  const sha = data?.indexed_commit_sha as string | undefined
  const branch = data?.default_branch as string | undefined

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="size-5 text-foreground shrink-0" />
              <h1 className="text-xl font-bold text-foreground">
                {doc.repo_owner}/{doc.repo_name}
              </h1>
              <Badge color="green">Documentation</Badge>
            </div>
            <a
              href={doc.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground-lighter hover:text-foreground transition-colors break-all"
            >
              {doc.repo_url} <ExternalLink className="size-3 inline shrink-0" />
            </a>
            {sha ? (
              <div className="mt-1 flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                <span>
                  Indexed at{' '}
                  <time dateTime={doc.created_at}>
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
            ) : null}
          </div>
          <Button size="tiny" type="default" onClick={() => router.push('/search')} className="self-start sm:self-auto">
            Back to Results
          </Button>
        </div>

        <div className="prose prose-sm max-w-none border rounded-xl p-6 bg-surface-100 overflow-x-auto">
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
  )
}
