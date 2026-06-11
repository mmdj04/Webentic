'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Users,
  BookOpen,
  Sparkles,
  Bug,
  Lightbulb,
  Share2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { Button, Card, CardContent, Badge, InputGroup, InputGroupInput } from 'ui'
import { PageContainer } from 'ui-patterns/PageContainer'

const topics = [
  {
    title: 'Getting Started',
    description: 'New to the platform? Find guides, tutorials, and onboarding resources.',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    href: '/community/getting-started',
    articles: 24,
  },
  {
    title: 'API & Integration',
    description: 'Integrate your tools, build custom solutions, and use our APIs.',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    href: '/community/api',
    articles: 56,
  },
  {
    title: 'Troubleshooting',
    description: 'Solutions to common issues, error messages, and debugging tips.',
    icon: Bug,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    href: '/community/troubleshooting',
    articles: 38,
  },
  {
    title: 'Feature Requests',
    description: 'Suggest and vote on new features, share your ideas with the team.',
    icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    href: '/community/feature-requests',
    articles: 12,
  },
  {
    title: 'Show & Tell',
    description: 'Share what you have built, get feedback, and inspire others.',
    icon: Share2,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    href: '/community/show-and-tell',
    articles: 47,
  },
]

const recentPosts = [
  {
    title: 'How to set up custom authentication providers?',
    category: 'API & Integration',
    replies: 14,
    views: 342,
    author: 'Maria S.',
    time: '2h ago',
    pinned: true,
  },
  {
    title: 'Database connection timeout after migration',
    category: 'Troubleshooting',
    replies: 8,
    views: 156,
    author: 'Alex K.',
    time: '5h ago',
    pinned: false,
  },
  {
    title: 'Introducing our new dashboard template',
    category: 'Show & Tell',
    replies: 23,
    views: 891,
    author: 'James W.',
    time: '1d ago',
    pinned: false,
  },
  {
    title: 'Support for GraphQL subscriptions?',
    category: 'Feature Requests',
    replies: 31,
    views: 567,
    author: 'Priya M.',
    time: '2d ago',
    pinned: true,
  },
  {
    title: 'Deploy to Kubernetes: step-by-step guide',
    category: 'Getting Started',
    replies: 5,
    views: 203,
    author: 'Tom H.',
    time: '3d ago',
    pinned: false,
  },
]

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-full p-2 bg-foreground/5">
          <Icon className="size-5 text-foreground-lighter" />
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-sm text-foreground-lighter">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CommunityPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-dvh flex flex-col bg-background">

      {/* ── Hero ── */}
      <section className="border-b border-muted">
        <PageContainer>
          <div className="py-16 sm:py-24 flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
              How can we help you?
            </h1>
            <p className="text-lg text-foreground-lighter mb-8 max-w-lg">
              Search the community for answers, or browse topics below.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); /* navigate to search */ }}
              className="w-full max-w-lg"
            >
              <InputGroup className="w-full">
                <InputGroupInput
                  placeholder="Search the community..."
                  className="font-mono text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </form>
          </div>
        </PageContainer>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-muted bg-muted/20">
        <PageContainer>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
            <StatCard icon={Users} label="Community Members" value="12.4k" />
            <StatCard icon={MessageCircle} label="Discussions" value="3.2k" />
            <StatCard icon={BookOpen} label="Articles" value="187" />
            <StatCard icon={Users} label="Online Now" value="42" />
          </div>
        </PageContainer>
      </section>

      {/* ── Browse Topics ── */}
      <section className="border-b border-muted">
        <PageContainer>
          <div className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Browse help topics</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link key={topic.title} href={topic.href} className="group block">
                  <Card className="h-full transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2.5 ${topic.bg} shrink-0`}>
                          <topic.icon className={`size-5 ${topic.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground text-sm">
                              {topic.title}
                            </h3>
                            <ChevronRight className="size-3.5 text-foreground-lighter group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className="text-sm text-foreground-lighter leading-relaxed mb-2">
                            {topic.description}
                          </p>
                          <span className="text-xs text-foreground-light">
                            {topic.articles} articles
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Recent Discussions ── */}
      <section className="border-b border-muted">
        <PageContainer>
          <div className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent discussions</h2>
              <Button asChild type="text" size="small">
                <Link href="/community/discussions">
                  View all
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <Link key={post.title} href="#" className="group block">
                  <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {post.pinned && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                                Pinned
                              </Badge>
                            )}
                            <h3 className="text-sm font-medium text-foreground group-hover:text-foreground-light transition-colors truncate">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-foreground-lighter mt-1">
                            <span>{post.category}</span>
                            <span>·</span>
                            <span>{post.author}</span>
                            <span>·</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-foreground-lighter shrink-0">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="size-3" />
                            {post.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

    </div>
  )
}
