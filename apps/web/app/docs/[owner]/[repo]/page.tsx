'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLink, BookOpen, ArrowLeft } from 'lucide-react'
import { Badge, Button, Card, CardContent } from 'ui'
import { CodeBlock } from 'ui-patterns/CodeBlock'
import { Mermaid } from 'ui-patterns/Mermaid'
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
          <Card>
            <CardContent>
              <div className="space-y-3">
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
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardContent>
              <div className="w-full min-h-[400px] shimmer" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="size-8 text-foreground-muted mx-auto mb-3" />
                <p className="text-foreground-muted mb-4">{error || 'Documentation not found'}</p>
                <Button type="default" onClick={() => router.push('/search')}>
                  Back to search
                </Button>
              </div>
            </CardContent>
          </Card>
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <BookOpen className="size-5 text-foreground shrink-0" />
              <h1 className="text-xl font-bold text-foreground min-w-0">
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
                  className="font-mono hover:text-foreground transition-colors break-all"
                >
                  {sha.slice(0, 7)}
                </a>
                {branch && <span className="break-all">{branch}</span>}
              </div>
            ) : null}
          </div>
          <Button type="default" onClick={() => router.push('/search')} className="self-start sm:self-auto gap-2">
            <ArrowLeft className="size-4" />
            Back to Results
          </Button>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children }) {
                  const isMermaid = className === 'language-mermaid'
                  if (isMermaid) {
                    return <Mermaid chart={String(children)} />
                  }
                  const match = /language-(\w+)/.exec(className || '')
                  if (match) {
                    return (
                      <CodeBlock className={className} language={match[1] as any}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    )
                  }
                  return (
                    <code className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono text-foreground">
                      {children}
                    </code>
                  )
                },
                pre({ children }) {
                  return <>{children}</>
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto">
                      <table>{children}</table>
                    </div>
                  )
                },
              }}
            >
              {doc.documentation || ''}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
