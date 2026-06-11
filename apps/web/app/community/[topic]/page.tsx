'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Sparkles,
  Bug,
  Lightbulb,
  Share2,
  MessageCircle,
  Users,
  ArrowUp,
  ArrowDown,
  Clock,
  Pin,
  Plus,
  ChevronLeft,
  Search,
} from 'lucide-react'
import { Button, Card, CardContent, Badge, InputGroup, InputGroupInput } from 'ui'
import { PageContainer } from 'ui-patterns/PageContainer'

const topicData: Record<string, {
  title: string
  description: string
  icon: any
  color: string
  bg: string
  total: number
  solved: number
}> = {
  'getting-started': {
    title: 'Getting Started',
    description: 'New to the platform? Find guides, tutorials, and onboarding resources.',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    total: 24,
    solved: 18,
  },
  api: {
    title: 'API & Integration',
    description: 'Integrate your tools, build custom solutions, and use our APIs.',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    total: 56,
    solved: 42,
  },
  troubleshooting: {
    title: 'Troubleshooting',
    description: 'Solutions to common issues, error messages, and debugging tips.',
    icon: Bug,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    total: 38,
    solved: 29,
  },
  'feature-requests': {
    title: 'Feature Requests',
    description: 'Suggest and vote on new features, share your ideas with the team.',
    icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    total: 12,
    solved: 4,
  },
  'show-and-tell': {
    title: 'Show & Tell',
    description: 'Share what you have built, get feedback, and inspire others.',
    icon: Share2,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    total: 47,
    solved: 0,
  },
}

const discussions = [
  {
    id: 1,
    title: 'How to set up custom authentication providers?',
    author: 'Maria S.',
    avatar: 'M',
    replies: 14,
    views: 342,
    votes: 23,
    lastActivity: '2h ago',
    pinned: true,
    solved: true,
  },
  {
    id: 2,
    title: 'Database connection timeout after migration',
    author: 'Alex K.',
    avatar: 'A',
    replies: 8,
    views: 156,
    votes: 12,
    lastActivity: '5h ago',
    pinned: false,
    solved: false,
  },
  {
    id: 3,
    title: 'Environment variables not loading in production',
    author: 'Sarah L.',
    avatar: 'S',
    replies: 21,
    views: 403,
    votes: 31,
    lastActivity: '1d ago',
    pinned: false,
    solved: true,
  },
  {
    id: 4,
    title: 'WebSocket connection keeps dropping after 30 seconds',
    author: 'David C.',
    avatar: 'D',
    replies: 6,
    views: 89,
    votes: 8,
    lastActivity: '2d ago',
    pinned: false,
    solved: false,
  },
  {
    id: 5,
    title: 'How to implement role-based access control?',
    author: 'Priya M.',
    avatar: 'P',
    replies: 33,
    views: 712,
    votes: 45,
    lastActivity: '3d ago',
    pinned: true,
    solved: true,
  },
  {
    id: 6,
    title: 'API rate limiting: best practices and implementation',
    author: 'Tom H.',
    avatar: 'T',
    replies: 11,
    views: 267,
    votes: 19,
    lastActivity: '4d ago',
    pinned: false,
    solved: false,
  },
  {
    id: 7,
    title: 'Cannot deploy to Vercel — build fails with cryptic error',
    author: 'Emma R.',
    avatar: 'E',
    replies: 17,
    views: 534,
    votes: 27,
    lastActivity: '5d ago',
    pinned: false,
    solved: true,
  },
  {
    id: 8,
    title: 'Support for custom domains with SSL?',
    author: 'James W.',
    avatar: 'J',
    replies: 9,
    views: 198,
    votes: 14,
    lastActivity: '6d ago',
    pinned: false,
    solved: false,
  },
]

function SortTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        active
          ? 'bg-foreground/10 text-foreground font-medium'
          : 'text-foreground-lighter hover:text-foreground hover:bg-foreground/5'
      }`}
    >
      {label}
    </button>
  )
}

export default function TopicPage() {
  const params = useParams()
  const topic = topicData[params.topic as string]
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'latest' | 'top' | 'unanswered'>('latest')

  if (!topic) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground">Topic not found</h1>
        <p className="text-foreground-lighter">The topic you are looking for does not exist.</p>
        <Button asChild type="default">
          <Link href="/community">Back to Community</Link>
        </Button>
      </div>
    )
  }

  const Icon = topic.icon
  const solvedPct = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0

  const sorted = [...discussions].sort((a, b) => {
    if (sort === 'top') return b.votes - a.votes
    if (sort === 'unanswered') return a.replies - b.replies
    return 0
  })

  const filtered = sorted.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.author.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-muted">
        <PageContainer>
          <div className="flex items-center gap-2 h-12 text-sm text-foreground-lighter">
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
            <span>/</span>
            <span className="text-foreground">{topic.title}</span>
          </div>
        </PageContainer>
      </div>

      {/* ── Topic Header ── */}
      <section className="border-b border-muted">
        <PageContainer>
          <div className="py-10 sm:py-14">
            <div className="flex items-start gap-5">
              <div className={`rounded-xl p-3.5 ${topic.bg} shrink-0 hidden sm:block`}>
                <Icon className={`size-7 ${topic.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
                      {topic.title}
                    </h1>
                    <p className="text-base text-foreground-lighter max-w-lg">
                      {topic.description}
                    </p>
                  </div>
                  <Button type="default" className="shrink-0 gap-1.5">
                    <Plus className="size-4" />
                    New discussion
                  </Button>
                </div>
                <div className="flex items-center gap-6 mt-5 text-sm text-foreground-lighter">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" />
                    {topic.total} discussions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    {solvedPct}% solved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Search & Sort ── */}
      <section className="border-b border-muted bg-muted/20">
        <PageContainer>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-1">
              <SortTab label="Latest" active={sort === 'latest'} onClick={() => setSort('latest')} />
              <SortTab label="Top" active={sort === 'top'} onClick={() => setSort('top')} />
              <SortTab label="Unanswered" active={sort === 'unanswered'} onClick={() => setSort('unanswered')} />
            </div>
            <InputGroup className="w-full sm:w-64">
              <InputGroupInput
                placeholder="Search discussions..."
                className="font-mono text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </div>
        </PageContainer>
      </section>

      {/* ── Discussions List ── */}
      <section className="flex-1">
        <PageContainer>
          <div className="py-8 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="size-10 text-foreground-lighter mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-1">No discussions found</h3>
                <p className="text-sm text-foreground-lighter">
                  {query ? 'Try a different search term.' : 'Be the first to start a discussion.'}
                </p>
              </div>
            ) : (
              filtered.map((discussion) => (
                <Link key={discussion.id} href={`/community/${params.topic}/${discussion.id}`} className="group block">
                  <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Vote count */}
                        <div className="flex flex-col items-center gap-0.5 min-w-[40px] shrink-0 pt-0.5">
                          <ArrowUp className="size-4 text-foreground-lighter group-hover:text-foreground transition-colors" />
                          <span className="text-sm font-medium text-foreground-lighter">{discussion.votes}</span>
                          <ArrowDown className="size-4 text-foreground-lighter" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {discussion.pinned && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none gap-1">
                                <Pin className="size-2.5" />
                                Pinned
                              </Badge>
                            )}
                            {discussion.solved && (
                              <Badge variant="success" className="text-[10px] px-1.5 py-0 leading-none">
                                Solved
                              </Badge>
                            )}
                            <h3 className="text-sm font-medium text-foreground group-hover:text-foreground-light transition-colors truncate">
                              {discussion.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-foreground-lighter mt-1.5">
                            <span className="flex items-center gap-1.5">
                              <span className="inline-flex items-center justify-center size-5 rounded-full bg-foreground/10 text-[10px] font-medium text-foreground-light">
                                {discussion.avatar}
                              </span>
                              {discussion.author}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="size-3" />
                              {discussion.replies} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {discussion.views} views
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {discussion.lastActivity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
