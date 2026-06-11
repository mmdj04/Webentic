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
  Check,
  Heart,
  Share,
  Flag,
  ChevronLeft,
} from 'lucide-react'
import { Button, Card, CardContent, Badge, InputGroup, InputGroupInput } from 'ui'
import { PageContainer } from 'ui-patterns/PageContainer'

const topicData: Record<string, { title: string; icon: any; color: string; bg: string }> = {
  'getting-started': { title: 'Getting Started', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  api: { title: 'API & Integration', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  troubleshooting: { title: 'Troubleshooting', icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  'feature-requests': { title: 'Feature Requests', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  'show-and-tell': { title: 'Show & Tell', icon: Share2, color: 'text-green-500', bg: 'bg-green-500/10' },
}

const discussions: Record<number, {
  id: number
  title: string
  content: string
  author: string
  avatar: string
  role: string
  votes: number
  replies: number
  views: number
  createdAt: string
  pinned: boolean
  solved: boolean
  tags: string[]
}> = {
  1: {
    id: 1,
    title: 'How to set up custom authentication providers?',
    content:
      'I am trying to integrate Auth0 as a custom authentication provider for our Webentic project. I have followed the official docs but keep getting a 401 error when verifying the JWT token on the callback endpoint.\n\nHere is my current configuration:\n\n```ts\nconst authProvider = new AuthProvider({\n  domain: process.env.AUTH0_DOMAIN,\n  clientId: process.env.AUTH0_CLIENT_ID,\n  clientSecret: process.env.AUTH0_CLIENT_SECRET,\n})\n```\n\nHas anyone successfully set this up? Any help would be appreciated.',
    author: 'Maria S.',
    avatar: 'M',
    role: 'Developer',
    votes: 23,
    replies: 14,
    views: 342,
    createdAt: '2 days ago',
    pinned: true,
    solved: true,
    tags: ['authentication', 'auth0', 'jwt'],
  },
  2: {
    id: 2,
    title: 'Database connection timeout after migration',
    content:
      'After migrating our database from PostgreSQL 14 to 16, we are experiencing intermittent connection timeouts. The error message is:\n\n`Error: Connection terminated unexpectedly`\n\nThis happens randomly during peak hours. We have tried increasing the connection pool size and tuning the max_connections parameter, but the issue persists.\n\nOur current pool config:\n\n```json\n{\n  "poolSize": 20,\n  "connectionTimeoutMs": 10000,\n  "idleTimeoutMs": 30000\n}\n```\n\nAny ideas on what might be causing this?',
    author: 'Alex K.',
    avatar: 'A',
    role: 'Backend Engineer',
    votes: 12,
    replies: 8,
    views: 156,
    createdAt: '5 hours ago',
    pinned: false,
    solved: false,
    tags: ['database', 'postgresql', 'migration'],
  },
  3: {
    id: 3,
    title: 'Environment variables not loading in production',
    content:
      'Our environment variables work fine in development but return undefined in the production build. We are using Next.js 16 with Turbopack.\n\nI have checked that the variables are set in the Vercel dashboard under Environment Variables. They are marked as "Production" scope.\n\nHere is how I access them:\n\n```ts\nconst apiUrl = process.env.NEXT_PUBLIC_API_URL\n```\n\nThis works locally with .env.local but returns undefined on Vercel.',
    author: 'Sarah L.',
    avatar: 'S',
    role: 'Full Stack Dev',
    votes: 31,
    replies: 21,
    views: 403,
    createdAt: '1 day ago',
    pinned: false,
    solved: true,
    tags: ['environment-variables', 'vercel', 'nextjs'],
  },
  5: {
    id: 5,
    title: 'How to implement role-based access control?',
    content:
      'We need to implement RBAC for our multi-tenant SaaS application. The requirements are:\n\n- Admin, Editor, Viewer roles per workspace\n- Custom role creation for enterprise customers\n- Permission inheritance from workspace to project level\n\nI am considering using Supabase RLS policies combined with a custom permissions table. Has anyone implemented something similar?\n\nHere is my draft schema:\n\n```sql\nCREATE TABLE roles (\n  id UUID PRIMARY KEY,\n  name TEXT NOT NULL,\n  permissions JSONB\n);\n```',
    author: 'Priya M.',
    avatar: 'P',
    role: 'Tech Lead',
    votes: 45,
    replies: 33,
    views: 712,
    createdAt: '3 days ago',
    pinned: true,
    solved: true,
    tags: ['rbac', 'authorization', 'supabase'],
  },
  7: {
    id: 7,
    title: 'Cannot deploy to Vercel — build fails with cryptic error',
    content:
      'Our build was working fine yesterday, but today it fails with this error:\n\n```\nError: ./app/page.tsx\nModule not found: Can\'t resolve \'some-module\'\n```\n\nI have not changed any dependencies. I tried:\n- Deleting node_modules and reinstalling\n- Clearing pnpm store\n- Using --force flag\n\nNothing works. Has anyone seen this before?',
    author: 'Emma R.',
    avatar: 'E',
    role: 'DevOps Engineer',
    votes: 27,
    replies: 17,
    views: 534,
    createdAt: '5 days ago',
    pinned: false,
    solved: true,
    tags: ['vercel', 'build-error', 'deploy'],
  },
}

const repliesData: Record<number, {
  id: number
  discussionId: number
  author: string
  avatar: string
  role: string
  content: string
  votes: number
  createdAt: string
  isSolution: boolean
}[]> = {
  1: [
    {
      id: 101,
      discussionId: 1,
      author: 'Tom H.',
      avatar: 'T',
      role: 'Community Manager',
      content:
        'Make sure you are using the correct callback URL. Auth0 requires the exact URL registered in your Auth0 application settings. Also, check that your JWT secret matches between Auth0 and your app.\n\n```ts\n// The callback URL must match exactly\nconst callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`\n```',
      votes: 15,
      createdAt: '1 day ago',
      isSolution: true,
    },
    {
      id: 102,
      discussionId: 1,
      author: 'Maria S.',
      avatar: 'M',
      role: 'Developer',
      content:
        'That was it! The callback URL had a trailing slash that did not match. Thank you so much!',
      votes: 8,
      createdAt: '22 hours ago',
      isSolution: false,
    },
  ],
  3: [
    {
      id: 301,
      discussionId: 3,
      author: 'David C.',
      avatar: 'D',
      role: 'Solutions Architect',
      content:
        'The `NEXT_PUBLIC_` prefix only exposes the variable to the browser bundle. Make sure you have actually set the variable in the Vercel dashboard under your project Settings → Environment Variables, and that "Production" is checked.\n\nAlso try redeploying after adding the variable — environment variables are baked in at build time, not at runtime.',
      votes: 22,
      createdAt: '22 hours ago',
      isSolution: true,
    },
    {
      id: 302,
      discussionId: 3,
      author: 'Sarah L.',
      avatar: 'S',
      role: 'Full Stack Dev',
      content:
        'Redeploying fixed it! I had added the variables but they were not picked up until a fresh build. Thanks David!',
      votes: 5,
      createdAt: '20 hours ago',
      isSolution: false,
    },
  ],
  5: [
    {
      id: 501,
      discussionId: 5,
      author: 'James W.',
      avatar: 'J',
      role: 'Security Engineer',
      content:
        'We built something similar. A few recommendations:\n\n1. Use Supabase\'s built-in `auth.users()` and `auth.role()` functions in your RLS policies\n2. Store permissions as a flat array of strings for easier querying\n3. Cache the user\'s permissions in the session token to avoid extra DB queries\n\nHere is an example RLS policy:\n\n```sql\nCREATE POLICY "workspace_access" ON projects\nFOR SELECT USING (\n  auth.has_permission(\'workspace:read\')\n);\n```',
      votes: 34,
      createdAt: '2 days ago',
      isSolution: true,
    },
  ],
  7: [
    {
      id: 701,
      discussionId: 7,
      author: 'Priya M.',
      avatar: 'P',
      role: 'Tech Lead',
      content:
        'This is usually a pnpm cache issue. Try:\n\n```bash\npnpm store prune\nrm -rf node_modules\npnpm install --frozen-lockfile\n```\n\nIf that does not work, check your pnpm-lock.yaml for any conflicts.',
      votes: 18,
      createdAt: '4 days ago',
      isSolution: true,
    },
    {
      id: 702,
      discussionId: 7,
      author: 'Emma R.',
      avatar: 'E',
      role: 'DevOps Engineer',
      content:
        'That worked! The lockfile was corrupted after a merge conflict. I regenerated it and the build passed. Thank you!',
      votes: 6,
      createdAt: '4 days ago',
      isSolution: false,
    },
  ],
}

export default function DiscussionPage() {
  const params = useParams()
  const topicSlug = params.topic as string
  const discussionId = Number(params.discussion)
  const [replyText, setReplyText] = useState('')

  const topic = topicData[topicSlug]
  const discussion = discussions[discussionId]
  const replies = repliesData[discussionId] || []

  if (!topic || !discussion) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground">Discussion not found</h1>
        <p className="text-foreground-lighter">This discussion does not exist or may have been removed.</p>
        <Button asChild type="default">
          <Link href={topicSlug && topicData[topicSlug] ? `/community/${topicSlug}` : '/community'}>
            Back to {topic?.title || 'Community'}
          </Link>
        </Button>
      </div>
    )
  }

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
            <Link href={`/community/${topicSlug}`} className="hover:text-foreground transition-colors">
              {topic.title}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px] sm:max-w-md">
              {discussion.title}
            </span>
          </div>
        </PageContainer>
      </div>

      {/* ── Original Post ── */}
      <section className="border-b border-muted">
        <PageContainer>
          <div className="py-8">
            <div className="flex items-start gap-4">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 min-w-[44px] shrink-0 pt-1">
                <button className="rounded-full p-1.5 text-foreground-lighter hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <ArrowUp className="size-5" />
                </button>
                <span className="text-base font-semibold text-foreground">{discussion.votes}</span>
                <button className="rounded-full p-1.5 text-foreground-lighter hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <ArrowDown className="size-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {discussion.pinned && (
                    <Badge variant="default" className="gap-1 text-[10px] px-1.5 py-0">
                      <Pin className="size-2.5" />
                      Pinned
                    </Badge>
                  )}
                  {discussion.solved && (
                    <Badge variant="success" className="gap-1 text-[10px] px-1.5 py-0">
                      <Check className="size-2.5" />
                      Solved
                    </Badge>
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {discussion.title}
                  </h1>
                </div>

                {/* Author info */}
                <div className="flex items-center gap-2 text-sm mb-5">
                  <span className="inline-flex items-center justify-center size-7 rounded-full bg-foreground/10 text-xs font-medium text-foreground-light">
                    {discussion.avatar}
                  </span>
                  <span className="font-medium text-foreground">{discussion.author}</span>
                  <span className="text-foreground-lighter text-xs">{discussion.role}</span>
                  <span className="text-foreground-lighter">·</span>
                  <span className="text-foreground-lighter text-xs flex items-center gap-1">
                    <Clock className="size-3" />
                    {discussion.createdAt}
                  </span>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground-light mb-5 whitespace-pre-wrap">
                  {discussion.content}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-foreground-lighter"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-muted">
                  <div className="flex items-center gap-4 text-xs text-foreground-lighter">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-3.5" />
                      {discussion.replies} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {discussion.views} views
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="text" size="tiny" className="gap-1">
                      <Heart className="size-3.5" />
                    </Button>
                    <Button type="text" size="tiny" className="gap-1">
                      <Share className="size-3.5" />
                    </Button>
                    <Button type="text" size="tiny" className="gap-1">
                      <Flag className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Replies ── */}
      <section className="flex-1">
        <PageContainer>
          <div className="py-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h2>

            <div className="space-y-4">
              {replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="size-10 text-foreground-lighter mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No replies yet</h3>
                  <p className="text-sm text-foreground-lighter mb-4">
                    Be the first to respond to this discussion.
                  </p>
                </div>
              ) : (
                replies.map((reply) => (
                  <Card
                    key={reply.id}
                    className={`transition-all duration-200 ${
                      reply.isSolution ? 'border-green-500/30 bg-green-500/5' : 'hover:border-foreground/20'
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 min-w-[36px] shrink-0 pt-1">
                          <button className="rounded-full p-1 text-foreground-lighter hover:text-foreground hover:bg-foreground/5 transition-colors">
                            <ArrowUp className="size-4" />
                          </button>
                          <span className="text-sm font-medium text-foreground-lighter">{reply.votes}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center size-6 rounded-full bg-foreground/10 text-[10px] font-medium text-foreground-light">
                              {reply.avatar}
                            </span>
                            <span className="text-sm font-medium text-foreground">{reply.author}</span>
                            <span className="text-xs text-foreground-lighter">{reply.role}</span>
                            <span className="text-foreground-lighter">·</span>
                            <span className="text-xs text-foreground-lighter">{reply.createdAt}</span>
                            {reply.isSolution && (
                              <Badge variant="success" className="gap-1 text-[10px] px-1.5 py-0 ml-auto">
                                <Check className="size-2.5" />
                                Solution
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-foreground-light whitespace-pre-wrap mt-2">
                            {reply.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* ── Reply Box ── */}
            <div className="mt-8 border-t border-muted pt-6">
              <h3 className="text-base font-medium text-foreground mb-3">Post a reply</h3>
              <div className="space-y-3">
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-muted bg-background p-3 text-sm text-foreground placeholder:text-foreground-lighter focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-y"
                  placeholder="Share your thoughts or solution..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button type="default" size="small" onClick={() => setReplyText('')}>
                    Clear
                  </Button>
                  <Button type="primary" size="small" disabled={!replyText.trim()}>
                    <MessageCircle className="size-3.5" />
                    Post reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
