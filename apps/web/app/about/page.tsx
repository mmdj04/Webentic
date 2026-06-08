'use client'

import Link from 'next/link'
import { ArrowUpRight, Heart, Github } from 'lucide-react'
import { cn } from 'ui'

const SKILLS = [
  { name: 'React / Next.js', label: 'Frontend' },
  { name: 'TypeScript', label: 'Language' },
  { name: 'Node.js', label: 'Backend' },
  { name: 'Postgres', label: 'Database' },
  { name: 'Docker', label: 'DevOps' },
  { name: 'Tailwind CSS', label: 'Styling' },
  { name: 'Supabase', label: 'Backend as a Service' },
  { name: 'Python', label: 'Language' },
]

const PROJECTS = [
  { name: 'Webentic UI', description: 'Open-source component library', href: '/docs/getting-started/introduction' },
  { name: 'Webentic DS', description: 'Design system & patterns', href: '/design-system' },
  { name: 'GitHub', description: 'Open-source contributions', href: 'https://github.com/mmdj04' },
]

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-site mx-auto px-6 md:px-16 py-20">
        {/* Hero */}
        <section className="mb-24">
          <div className="max-w-3xl">
            <div className="font-mono uppercase text-xs text-foreground-lighter/75 tracking-widest mb-4">
              About
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl text-foreground font-bold tracking-tight leading-none mb-6">
              Full-Stack{' '}
              <span className="text-foreground-light">Developer</span>
            </h1>
            <p className="text-lg text-foreground-light max-w-2xl leading-relaxed">
              Building developer tools, design systems, and full-stack applications.
              Open-source enthusiast with 10+ years of experience shipping products.
            </p>
          </div>
        </section>

        {/* Stats + Bio */}
        <section className="mb-24">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 lg:gap-16">
            <div className="border rounded-lg p-6 bg-surface-75 flex flex-col gap-6">
              <Heart className="size-5 text-foreground-muted" />
              <div>
                <div className="text-4xl font-bold text-foreground tracking-tight">50+</div>
                <div className="text-sm text-foreground-muted mt-1">projects shipped</div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-foreground-light leading-relaxed">
                I&apos;m a full-stack developer passionate about crafting intuitive user interfaces,
                scalable backends, and developer tools that make building software a delight.
              </p>
              <p className="text-foreground-light leading-relaxed">
                I believe in open-source, clean design, and building systems that last.
              </p>

              <Link
                href="https://github.com/mmdj04"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground-light hover:text-foreground transition-colors border border-muted rounded-md px-4 py-2 hover:border-foreground-muted"
              >
                <Github className="size-4" />
                See my work
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-24">
          <div className="space-y-6">
            <div>
              <div className="font-mono uppercase text-xs text-foreground-lighter/75 tracking-widest mb-2">
                Skills
              </div>
              <h2 className="text-2xl lg:text-3xl text-foreground font-medium tracking-tight">
                Technologies I work with
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SKILLS.map((skill) => (
                <div
                  key={skill.name}
                  className="border rounded-md p-4 bg-surface-75 hover:bg-overlay/50 transition-colors"
                >
                  <div className="font-medium text-foreground text-sm">{skill.name}</div>
                  <div className="text-xs text-foreground-muted mt-1">{skill.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="mb-24">
          <div className="space-y-6">
            <div>
              <div className="font-mono uppercase text-xs text-foreground-lighter/75 tracking-widest mb-2">
                Projects
              </div>
              <h2 className="text-2xl lg:text-3xl text-foreground font-medium tracking-tight">
                What I&apos;m building
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PROJECTS.map((project) => (
                <Link
                  key={project.name}
                  href={project.href}
                  className="border rounded-md p-6 flex flex-col gap-3 hover:bg-overlay/50 hover:border-foreground-muted transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <ArrowUpRight className="size-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-sm text-foreground-light">{project.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="border-t pt-12 flex flex-col items-center text-center gap-4">
            <p className="text-foreground-muted text-sm">
              Want to work together? Let&apos;s talk.
            </p>
            <a
              href="mailto:hello@webentic.dev"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-foreground/5 hover:bg-foreground/10 border border-muted rounded-md px-5 py-2 transition-colors"
            >
              Contact me
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </section>
      </div>

      <footer className="py-6 px-6 md:px-16 mx-auto w-full max-w-site">
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-balance text-sm leading-loose text-foreground-muted">
            &copy; {new Date().getFullYear()} Webentic. Built with Next.js.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="https://github.com/mmdj04" target="_blank" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
