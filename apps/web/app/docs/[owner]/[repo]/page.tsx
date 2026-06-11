'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, GitFork, ExternalLink, BookOpen } from 'lucide-react'
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

function slug(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return getTextContent((node as any).props.children)
  }
  return ''
}

type HeadingLevel = 'h1' | 'h2' | 'h3'

function HeadingTag({ level, children }: { level: HeadingLevel; children: React.ReactNode }) {
  const id = slug(getTextContent(children))
  const Tag = level
  return <Tag id={id}>{children}</Tag>
}

function extractTOC(markdown: string) {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: { level: number; text: string; id: string }[] = []
  let match
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    headings.push({ level, text, id: slug(text) })
  }
  return headings
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

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!owner || !repo) return

    supabase
      .from('repository_analyses')
      .select('id, repo_owner, repo_name, repo_url, documentation, analysis_data, created_at')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .eq('status', 'completed')
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError('Documentation not found')
          setLoading(false)
          return
        }
        setDoc(data as unknown as AnalysisDoc)
        setLoading(false)
      })
  }, [owner, repo, supabase])

  const toc = useMemo(() => {
    if (!doc?.documentation) return []
    return extractTOC(doc.documentation)
  }, [doc])

  const data = doc?.analysis_data || {}
  const sha = data.indexed_commit_sha as string | undefined

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <p className="text-sm text-foreground-muted">Loading documentation...</p>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-foreground-light">{error || 'Documentation not found'}</p>
          <Link href="/search" className="text-sm text-foreground-muted hover:text-foreground mt-3 inline-block">
            &larr; Back to search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <header style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="mx-auto flex items-center gap-4 px-6 py-3" style={{ maxWidth: 1280 }}>
          <Link
            href="/search"
            className="flex items-center gap-2 no-underline text-sm shrink-0 text-foreground-lighter hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Search
          </Link>
          <div className="flex-1" />
          <a
            href={doc.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground-lighter hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ExternalLink className="size-3" />
            GitHub
          </a>
        </div>
      </header>

      <div className="mx-auto flex" style={{ maxWidth: 1280 }}>
        {toc.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0 border-r sticky top-0 h-screen overflow-y-auto" style={{ borderColor: 'var(--border-default)' }}>
            <nav className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                On this page
              </div>
              <ul className="space-y-0.5">
                {toc.map((heading, i) => (
                  <li key={i}>
                    <a
                      href={`#${heading.id}`}
                      className={`block text-xs py-1 px-2 rounded hover:bg-surface-200 transition-colors ${
                        heading.level === 1
                          ? 'font-semibold text-foreground'
                          : heading.level === 2
                            ? 'text-foreground-light'
                            : 'text-foreground-muted pl-6'
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t text-xs text-foreground-muted space-y-1" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-3">
                  {data.stargazers_count != null && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3" /> {(data.stargazers_count as number).toLocaleString()}
                    </span>
                  )}
                  {data.forks_count != null && (
                    <span className="flex items-center gap-1">
                      <GitFork className="size-3" /> {(data.forks_count as number).toLocaleString()}
                    </span>
                  )}
                </div>
                {data.language && <div>{data.language as string}</div>}
                {sha && (
                  <div>
                    Commit:{' '}
                    <a href={`${doc.repo_url}/tree/${sha}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-foreground">
                      {sha.slice(0, 7)}
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="size-5 text-foreground" />
                <h1 className="text-xl font-bold text-foreground">
                  {doc.repo_owner}/{doc.repo_name}
                </h1>
                <Badge color="green">Documentation</Badge>
              </div>
              {data.description && (
                <p className="text-sm text-foreground-light mt-1">{data.description as string}</p>
              )}
            </div>

            {doc.documentation && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1({ children }) {
                      return <HeadingTag level="h1">{children}</HeadingTag>
                    },
                    h2({ children }) {
                      return <HeadingTag level="h2">{children}</HeadingTag>
                    },
                    h3({ children }) {
                      return <HeadingTag level="h3">{children}</HeadingTag>
                    },
                    code({ className, children, ...props }) {
                      const isMermaid = className === 'language-mermaid'
                      if (isMermaid) {
                        return <Mermaid chart={String(children)} />
                      }
                      return <code className={className} {...props}>{children}</code>
                    },
                    pre({ children }) {
                      return <pre>{children}</pre>
                    },
                  }}
                >
                  {doc.documentation}
                </ReactMarkdown>
              </div>
            )}

            <div className="mt-12 pt-6 border-t text-xs text-foreground-muted" style={{ borderColor: 'var(--border-default)' }}>
              <p>
                Last indexed{' '}
                <time dateTime={doc.created_at}>
                  {new Date(doc.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                {sha && (
                  <>
                    {' '}at{' '}
                    <a href={`${doc.repo_url}/tree/${sha}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-foreground">
                      {sha.slice(0, 7)}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
