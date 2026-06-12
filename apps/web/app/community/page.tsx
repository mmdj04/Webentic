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
  TrendingUp,
  Clock,
  Pin,
  Eye,
} from 'lucide-react'
import { Badge, Button, Card, CardContent, InputGroup, InputGroupInput } from 'ui'
import { PageContainer } from 'ui-patterns/PageContainer'

const topics = [
  { label: 'Discovery', icon: TrendingUp, href: '/community/discovery' },
  { label: 'Getting Started', icon: BookOpen, href: '/community/getting-started' },
  { label: 'API & Integration', icon: Sparkles, href: '/community/api' },
  { label: 'Troubleshooting', icon: Bug, href: '/community/troubleshooting' },
  { label: 'Feature Requests', icon: Lightbulb, href: '/community/feature-requests' },
  { label: 'Show & Tell', icon: Share2, href: '/community/show-and-tell' },
]

const news = [
  {
    source: 'COMMUNITY HIGHLIGHT',
    icon: TrendingUp,
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    time: '2h ago',
    title: 'Gemini 1.5 Pro: A Revolução da Janela de Contexto e o Futuro do Processamento Massivo',
    views: '4.5k',
    replies: '320',
    href: '/community/getting-started/1',
  },
  {
    source: 'GETTING STARTED',
    icon: BookOpen,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    time: '5h ago',
    title: 'Gemini Nano no Android: A Era da IA Local, Privada e Sempre Ativa',
    views: '2.1k',
    replies: '150',
    href: '/community/getting-started/2',
  },
  {
    source: 'API & INTEGRATION',
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    time: '1d ago',
    title: 'Transformação Digital: A Integração Profunda do Gemini no Google Workspace',
    views: '1.8k',
    replies: '89',
    href: '/community/api/3',
  },
  {
    source: 'TROUBLESHOOTING',
    icon: Bug,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    time: '1d ago',
    title: 'Gemini 1.5 Flash: Redefinindo a Eficiência e Velocidade na IA em Larga Escala',
    views: '3.2k',
    replies: '210',
    href: '/community/troubleshooting/4',
  },
  {
    source: 'SHOW & TELL',
    icon: Share2,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    time: '2d ago',
    title: 'IA Generativa e o Renascimento da Arte Digital: O Papel Transformador do Gemini',
    views: '950',
    replies: '0',
    href: '/community/show-and-tell/5',
  },
  {
    source: 'FEATURE REQUESTS',
    icon: Lightbulb,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    time: '2d ago',
    title: 'Gemini Ultra vs GPT-4o: O Novo Benchmark da Inteligência Artificial Geral',
    views: '5.6k',
    replies: '560',
    href: '/community/feature-requests/6',
  },
  {
    source: 'API & INTEGRATION',
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    time: '3d ago',
    title: 'A Revolução do Desenvolvimento de Software: Programação de Alta Precisão com Gemini Code Assist',
    views: '2.4k',
    replies: '130',
    href: '/community/api/7',
  },
  {
    source: 'DEEP RESEARCH',
    icon: TrendingUp,
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    time: '3d ago',
    title: 'A Revolução da Multimodalidade: Como o Gemini está Aprendendo a Perceber e Entender o Mundo Real',
    views: '3.7k',
    replies: '190',
    href: '/community/getting-started/8',
  },
  {
    source: 'SHOW & TELL',
    icon: Share2,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    time: '4d ago',
    title: 'O Renascimento da Busca: Como o Gemini está Reinventando o Google Search para uma Nova Era de Descoberta',
    views: '4.2k',
    replies: '280',
    href: '/community/show-and-tell/9',
  },
  {
    source: 'GETTING STARTED',
    icon: BookOpen,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    time: '5d ago',
    title: 'Educação 4.0: Como o Gemini está Democratizando o Ensino Personalizado em Escala Global',
    views: '1.5k',
    replies: '65',
    href: '/community/getting-started/10',
  },
  {
    source: 'TROUBLESHOOTING',
    icon: Bug,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    time: '5d ago',
    title: 'Quebrando as Barreiras de Babel: A Luta do Gemini pela Preservação e Interconexão Linguística Global',
    views: '2.8k',
    replies: '110',
    href: '/community/troubleshooting/11',
  },
]

const topStories = news.slice(0, 5)

export default function CommunityPage() {
  const [query, setQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  const filtered = activeTopic
    ? news.filter((item) => {
        const topicLabel = activeTopic.toLowerCase()
        return item.source.toLowerCase().includes(topicLabel) ||
          topics.some((t) => t.label.toLowerCase() === topicLabel && item.source.toLowerCase().includes(t.label.toLowerCase()))
      })
    : news

  return (
    <div className="min-h-dvh bg-background">
      <PageContainer size="full">
        {/* ── Header + Sidebar layout ── */}
        <div className="flex gap-8 py-6">
          {/* ── Sidebar ── */}
          <aside className="hidden md:flex flex-col w-48 shrink-0">
            <div className="mb-6">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search..."
                  className="font-mono text-xs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </div>

            <nav className="space-y-0.5">
              {topics.map((topic) => {
                const Icon = topic.icon
                const isActive = activeTopic === topic.label
                return (
                  <button
                    key={topic.label}
                    onClick={() => setActiveTopic(isActive ? null : topic.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                      isActive
                        ? 'bg-surface-200 text-foreground font-medium'
                        : 'text-foreground-lighter hover:text-foreground hover:bg-surface-100'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{topic.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-auto pt-6 space-y-1">
              <Link
                href="/community/discussions"
                className="flex items-center gap-2 px-3 py-2 text-xs text-foreground-lighter hover:text-foreground transition-colors rounded-md"
              >
                <Users className="size-3.5" />
                View all discussions
              </Link>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Community</h1>
                <p className="text-sm text-foreground-lighter mt-0.5">
                  Discussions, guides, and help from the community
                </p>
              </div>
              <Button asChild type="default" size="tiny">
                <Link href="/community/discussions">
                  <MessageCircle className="size-3.5" />
                  New discussion
                </Link>
              </Button>
            </div>

            {/* ── Mobile category tabs ── */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
              {topics.map((topic) => {
                const Icon = topic.icon
                const isActive = activeTopic === topic.label
                return (
                  <button
                    key={topic.label}
                    onClick={() => setActiveTopic(isActive ? null : topic.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border whitespace-nowrap snap-start transition-colors ${
                      isActive
                        ? 'bg-foreground text-background border-foreground font-medium'
                        : 'bg-surface-100 text-foreground-lighter border-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-3" />
                    {topic.label}
                  </button>
                )
              })}
            </div>

            {/* ── Top Stories ── */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="size-4 text-foreground-lighter" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-lighter">
                  Top stories
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topStories.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.title} href={item.href} className="group block">
                      <Card className="h-full transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`rounded-md p-1 ${item.iconBg}`}>
                              <Icon className={`size-3 ${item.iconColor}`} />
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-lighter">
                              {item.source}
                            </span>
                            <span className="text-[10px] text-foreground-muted ml-auto">{item.time}</span>
                          </div>
                          <h3 className="text-sm font-medium text-foreground group-hover:text-foreground-light transition-colors leading-snug mb-3 line-clamp-3">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-foreground-lighter mt-auto">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="size-3" />
                              {item.replies}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* ── All News Feed ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="size-4 text-foreground-lighter" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-lighter">
                  {activeTopic ? `${activeTopic} discussions` : 'Latest discussions'}
                </h2>
              </div>
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="size-8 text-foreground-lighter mb-2" />
                    <p className="text-sm text-foreground-lighter">No discussions found in this topic.</p>
                  </div>
                ) : (
                  filtered.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.title} href={item.href} className="group block">
                        <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                          <CardContent className="py-3.5">
                            <div className="flex items-start gap-3">
                              <span className={`rounded-md p-1.5 ${item.iconBg} mt-0.5 shrink-0`}>
                                <Icon className={`size-3.5 ${item.iconColor}`} />
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-lighter">
                                    {item.source}
                                  </span>
                                  <span className="text-[10px] text-foreground-muted">{item.time}</span>
                                </div>
                                <h3 className="text-sm font-medium text-foreground group-hover:text-foreground-light transition-colors leading-snug">
                                  {item.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-foreground-lighter shrink-0 mt-5">
                                <span className="flex items-center gap-1">
                                  <Eye className="size-3" />
                                  {item.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="size-3" />
                                  {item.replies}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })
                )}
              </div>
            </section>
          </main>
        </div>
      </PageContainer>
    </div>
  )
}
