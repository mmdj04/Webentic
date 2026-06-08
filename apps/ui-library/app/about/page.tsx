'use client'

import Link from 'next/link'

const NAV_LINKS = [
  { label: 'GitHub', href: 'https://github.com/mmdj04' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Email', href: 'mailto:hello@webentic.dev' },
]

const SKILLS = [
  { category: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind, Vue' },
  { category: 'Backend', items: 'Node.js, Python, Postgres, Supabase' },
  { category: 'Tools', items: 'Docker, Vercel, Turborepo, Git' },
]

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-default text-foreground">
      <header className="sticky top-0 z-50 bg-default/80 backdrop-blur-sm border-b border-default">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm tracking-tight hover:text-brand-link transition-colors">
            WEBENTIC
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground-light hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <div className="flex flex-col items-start gap-1 mb-12">
            <p className="text-sm text-foreground-lighter font-mono">// about.me</p>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              <span className="font-light">Full-Stack</span>
              <br />
              <span className="font-extrabold">Developer</span>
            </h1>
            <p className="text-lg text-foreground-light mt-4 max-w-xl">
              Building developer tools, design systems, and open-source projects.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-16">
            {[
              { value: '10+', label: 'years building' },
              { value: '50+', label: 'projects shipped' },
              { value: '100%', label: 'open source' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-sm text-foreground-lighter mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="border border-default rounded-lg bg-surface-100 overflow-hidden mb-16">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-default bg-surface-200">
              <span className="size-2.5 rounded-full bg-destructive" />
              <span className="size-2.5 rounded-full bg-warning" />
              <span className="size-2.5 rounded-full bg-brand" />
              <span className="text-xs text-foreground-lighter font-mono ml-2">~/webentic</span>
            </div>
            <pre className="p-4 sm:p-6 text-sm font-mono text-foreground-light leading-relaxed overflow-x-auto">
              <span className="text-foreground-lighter"># about.json</span>
              {`
{`}
              <span className="text-brand-link">  "name"</span>: <span className="text-foreground">"Marco"</span>,
              <span className="text-brand-link">  "role"</span>: <span className="text-foreground">"Full-Stack Developer"</span>,
              <span className="text-brand-link">  "location"</span>: <span className="text-foreground">"Remote"</span>,
              <span className="text-brand-link">  "stack"</span>: [
              <span className="text-foreground">    "React", "Next.js", "TypeScript", "Node.js"</span>
              <span className="text-foreground">    "Postgres", "Docker", "Tailwind"</span>
              ],
              <span className="text-brand-link">  "openSource"</span>: <span className="text-foreground">true</span>
              {`}`}
            </pre>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-2">About</h2>
            <p className="text-foreground-light leading-relaxed max-w-2xl">
              I build developer tools, component libraries, and full-stack applications.
              Focused on creating polished, accessible user experiences with modern
              web technologies. Open-source enthusiast and design system builder.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Skills</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {SKILLS.map((skill) => (
                <div
                  key={skill.category}
                  className="border border-default rounded-lg p-4 bg-surface-100"
                >
                  <h3 className="text-sm font-medium text-foreground mb-1.5">{skill.category}</h3>
                  <p className="text-sm text-foreground-light leading-relaxed">{skill.items}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-default pt-8 pb-16">
            <p className="text-sm text-foreground-lighter font-mono mb-2"># contact</p>
            <p className="text-foreground">
              <a href="mailto:hello@webentic.dev" className="text-brand-link hover:underline">
                hello@webentic.dev
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
