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
  Search,
  Pin,
} from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from 'ui'
import { PageContainer } from 'ui-patterns/PageContainer'
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from 'ui-patterns/PageHeader'
import {
  PageSection,
  PageSectionContent,
  PageSectionDescription,
  PageSectionMeta,
  PageSectionSummary,
  PageSectionTitle,
} from 'ui-patterns/PageSection'
import { InputGroup, InputGroupInput } from 'ui'

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
    <Card className="border-0 shadow-none bg-surface-100">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="rounded-full p-2 bg-foreground/5">
          <Icon className="size-5 text-foreground-lighter" />
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
          <div className="text-sm text-foreground-lighter">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CommunityPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-dvh bg-background">
      {/* ── Hero ── */}
      <PageHeader size="small">
        <PageHeaderMeta>
          <PageHeaderSummary>
            <PageHeaderTitle>How can we help you?</PageHeaderTitle>
            <PageHeaderDescription>
              Search the community for answers, or browse topics below.
            </PageHeaderDescription>
          </PageHeaderSummary>
        </PageHeaderMeta>
      </PageHeader>

      <PageContainer size="small">
        {/* ── Search ── */}
        <div className="pb-8 -mt-4">
          <form onSubmit={(e) => { e.preventDefault() }} className="w-full">
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

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-8">
          <StatCard icon={Users} label="Community Members" value="12.4k" />
          <StatCard icon={MessageCircle} label="Discussions" value="3.2k" />
          <StatCard icon={BookOpen} label="Articles" value="187" />
          <StatCard icon={Users} label="Online Now" value="42" />
        </div>
      </PageContainer>

      {/* ── Browse Topics ── */}
      <div className="border-t border-muted">
        <PageContainer size="small">
          <PageSection>
            <PageSectionMeta>
              <PageSectionSummary>
                <PageSectionTitle>Browse help topics</PageSectionTitle>
                <PageSectionDescription>
                  Explore community discussions organized by category.
                </PageSectionDescription>
              </PageSectionSummary>
            </PageSectionMeta>
            <PageSectionContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <Link key={topic.title} href={topic.href} className="group block">
                    <Card className="h-full transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-2 ${topic.bg} shrink-0`}>
                            <topic.icon className={`size-4 ${topic.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="text-sm font-medium text-foreground">
                                {topic.title}
                              </h3>
                              <ArrowRight className="size-3 text-foreground-lighter group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </div>
                            <p className="text-xs text-foreground-lighter leading-relaxed mb-1.5">
                              {topic.description}
                            </p>
                            <span className="text-[11px] text-foreground-muted uppercase tracking-wider">
                              {topic.articles} articles
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </PageSectionContent>
          </PageSection>
        </PageContainer>
      </div>

      {/* ── Recent Discussions ── */}
      <div className="border-t border-muted">
        <PageContainer size="small">
          <PageSection>
            <PageSectionMeta>
              <PageSectionSummary>
                <PageSectionTitle>Recent discussions</PageSectionTitle>
                <PageSectionDescription>
                  Latest conversations from the community.
                </PageSectionDescription>
              </PageSectionSummary>
              <Button asChild type="text" size="tiny">
                <Link href="/community/discussions">
                  View all
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </PageSectionMeta>
            <PageSectionContent>
              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <Link key={post.title} href="#" className="group block">
                    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                      <CardContent className="py-3.5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {post.pinned && (
                                <Badge variant="default" className="gap-1 text-[10px] px-1.5 py-0 leading-none">
                                  <Pin className="size-2.5" />
                                  Pinned
                                </Badge>
                              )}
                              <h3 className="text-sm font-medium text-foreground group-hover:text-foreground-light transition-colors truncate">
                                {post.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground-lighter mt-1">
                              <span>{post.category}</span>
                              <span className="text-foreground-muted">·</span>
                              <span>{post.author}</span>
                              <span className="text-foreground-muted">·</span>
                              <span>{post.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-foreground-lighter shrink-0">
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
            </PageSectionContent>
          </PageSection>
        </PageContainer>
      </div>
    </div>
  )
}
