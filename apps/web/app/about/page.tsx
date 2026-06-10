'use client'

import Link from 'next/link'
import { CodeBlock } from 'ui'

const NAV_LINKS = [
  { label: 'GitHub', href: 'https://github.com/mmdj04' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Email', href: 'mailto:hello@webentic.dev' },
]

export default function AboutPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <header className="fixed top-0 left-0 z-50 w-full h-[100px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex items-center justify-between h-full px-[5%]" style={{ maxWidth: 1200 }}>
          <Link
            href="/"
            className="inline-flex items-center justify-center shrink-0 text-2xl text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-flex w-[1em] h-[1em]">
              <path d="M11.4286 2.3158H5.74576C3.41404 2.3158 1.52381 4.0124 1.52381 6.10527C1.52381 8.19814 3.41404 9.89474 5.74576 9.89474H10.6667" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M5.33334 6.10526H10.2542C12.586 6.10526 14.4762 7.80187 14.4762 9.89474C14.4762 11.9876 12.586 13.6842 10.2542 13.6842H4.84034" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </Link>
          <nav className="flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted hover:text-foreground transition-colors inline-flex items-center"
                style={{ lineHeight: '36px', height: 36 }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="flex flex-col justify-center items-center w-full h-dvh min-h-[680px]">
        <h2 className="pt-[60px] text-center">
          <strong className="text-[52px] sm:text-[72px] md:text-[105px] leading-none font-bold text-foreground uppercase">
            Full-Stack
          </strong>
          <br />
          <strong className="text-[52px] sm:text-[72px] md:text-[105px] leading-none font-bold text-foreground uppercase">
            Developer
          </strong>
          <br />
          <strong className="text-[52px] sm:text-[72px] md:text-[105px] leading-none font-bold text-foreground uppercase">
            <em className="not-italic text-foreground-muted">Open</em>Source
          </strong>
        </h2>
      </section>

      <section className="pb-[100px]">
        <div className="mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 w-[90%]" style={{ maxWidth: 1000 }}>
          <div
            className="w-full md:w-auto flex flex-col items-start justify-between border-2 border-muted bg-background relative p-9"
            style={{
              maxWidth: 300,
              minHeight: 300,
              borderRadius: 20,
              aspectRatio: '3/4',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground-muted" style={{ fontSize: 20, width: '1em', height: '1em' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M0 5.25143C0 4.3552 0.356318 3.58403 1.06897 2.93791C1.75863 2.31263 2.62069 2 3.65517 2C4.71265 2 5.5862 2.31263 6.27586 2.93791L7.34483 3.87582C7.41379 3.93835 7.41379 4.00088 7.34483 4.06341L6.65517 4.65742C6.58621 4.71994 6.52874 4.71994 6.48276 4.65742L5.41379 3.7195C4.90804 3.30265 4.32184 3.09423 3.65517 3.09423C3.01149 3.09423 2.43678 3.30265 1.93104 3.7195C1.47126 4.13636 1.24138 4.64699 1.24138 5.25143C1.24138 5.85586 1.47126 6.3665 1.93104 6.78335C2.43678 7.2002 3.01149 7.40862 3.65517 7.40862C4.32184 7.40862 4.90804 7.2002 5.41379 6.78335L9.72414 2.93791C10.4138 2.31263 11.2874 2 12.3448 2C13.3793 2 14.2414 2.31263 14.931 2.93791C15.6437 3.58403 16 4.3552 16 5.25143C16 6.14766 15.6437 6.91882 14.931 7.56494C14.7464 7.73238 14.5493 7.8774 14.3399 8C14.5493 8.1226 14.7464 8.26762 14.931 8.43506C15.6437 9.08118 16 9.85234 16 10.7486C16 11.6448 15.6437 12.416 14.931 13.0621C14.2414 13.6874 13.3793 14 12.3448 14C11.2874 14 10.4138 13.6874 9.72414 13.0621L8.65517 12.1242C8.58621 12.0616 8.58621 11.9991 8.65517 11.9366L9.34483 11.3426C9.41379 11.2801 9.47126 11.2801 9.51724 11.3426L10.5862 12.2805C11.092 12.6973 11.6782 12.9058 12.3448 12.9058C12.9885 12.9058 13.5632 12.6973 14.069 12.2805C14.5517 11.8428 14.7931 11.3322 14.7931 10.7486C14.7931 10.165 14.5517 9.65435 14.069 9.21665C13.5632 8.7998 12.9885 8.59138 12.3448 8.59138C11.6782 8.59138 11.092 8.7998 10.5862 9.21665L6.27586 13.0621C5.5862 13.6874 4.72414 14 3.68966 14C2.65517 14 1.79311 13.6874 1.10345 13.0621C0.367812 12.3951 0 11.624 0 10.7486C0 9.85234 0.356318 9.08118 1.06897 8.43506C1.25874 8.263 1.46157 8.11462 1.67745 7.98991C1.47442 7.86946 1.28309 7.72781 1.10345 7.56494C0.367814 6.89798 0 6.12681 0 5.25143Z" fill="currentColor"/>
            </svg>
            <div className="flex flex-col gap-2 text-xl font-medium leading-tight text-foreground-muted">
              <div>over</div>
              <div className="font-bold text-[38px] leading-none text-foreground">50+</div>
              <div>projects shipped</div>
            </div>
          </div>

          <div className="w-full md:flex-1">
            <h3 className="text-2xl sm:text-3xl md:text-[32px] font-semibold leading-snug text-foreground max-w-[620px]">
              Building developer tools, design systems, and full-stack apps.
            </h3>
            <h4 className="text-2xl sm:text-3xl md:text-[32px] font-medium leading-snug text-foreground-muted max-w-[620px] mt-4">
              Open-source enthusiast.
            </h4>
            <CodeBlock
              language="js"
              className="language-js"
              value={`import about from "https://webentic.dev/about"`}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="https://github.com/mmdj04"
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 relative inline-block px-6 py-2 rounded-lg overflow-hidden cursor-pointer no-underline"
              >
                <span
                  className="group-hover:scale-100 absolute inset-0 transition-transform duration-300 ease-in-out"
                  style={{
                    background: 'linear-gradient(300deg,#9933FF 33.26%,#FF6666 46.51%,#FACA30 59.77%,#00CD99 73.03%,#00CCFF 86.29%)',
                    transform: 'scale(1.2)',
                  }}
                />
                <strong className="relative text-background text-base font-semibold select-none">
                  See my work
                </strong>
              </a>
              <code className="text-sm font-medium text-foreground-muted font-mono">
                <strong className="font-medium text-foreground-light">10+</strong> years building
              </code>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 pb-[120px]">
        <div className="mx-auto w-[90%]" style={{ maxWidth: 1200 }}>
          <div className="flex flex-col items-center justify-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6875 3.24951C14.7542 3.24951 13.0592 4.25201 12 5.77451C10.9408 4.25201 9.24583 3.24951 7.3125 3.24951C4.6075 3.24951 2 5.54451 2 8.87451C2 12.437 4.55667 15.4137 6.85667 17.397C8.30137 18.6318 9.86968 19.7142 11.5367 20.627L11.56 20.6412L11.5667 20.6437L11.5658 20.6462C11.7017 20.717 11.8508 20.7512 12 20.7503C12.1492 20.7512 12.2983 20.7162 12.4342 20.6462L12.4333 20.6437L12.44 20.6412L12.4633 20.627C14.1303 19.7142 15.6986 18.6318 17.1433 17.397C19.4433 15.4137 22 12.437 22 8.87451C22 5.54451 19.3925 3.24951 16.6875 3.24951ZM15.9217 15.9787C14.7045 17.0202 13.3924 17.9454 12.0025 18.742L11.9992 18.7403L11.9958 18.742C10.6065 17.9446 9.29442 17.0195 8.07667 15.9787C5.84583 14.0562 3.87083 11.5637 3.87083 8.87618C3.87083 6.58118 5.63833 5.12618 7.30833 5.12618C9.025 5.12618 10.57 6.35868 11.095 8.19618C11.2142 8.60868 11.5917 8.86035 12 8.85951C12.4083 8.86035 12.7858 8.60785 12.9042 8.19618C13.4292 6.35868 14.9742 5.12618 16.6908 5.12618C18.3608 5.12618 20.1283 6.58118 20.1283 8.87618C20.1283 11.5637 18.1533 14.0562 15.9217 15.9787Z" fill="currentColor" className="text-brand"/>
            </svg>
            <h2 className="text-center text-[27px] font-bold leading-none text-foreground">
              Skills
            </h2>
            <h3 className="text-center leading-none text-lg font-normal text-foreground-muted">
              Technologies I work with.
            </h3>
          </div>
          <div className="flex flex-wrap gap-9 justify-center items-center pt-[45px]">
            {[
              { name: 'React / Next.js', desc: 'Frontend' },
              { name: 'TypeScript', desc: 'Language' },
              { name: 'Node.js', desc: 'Backend' },
              { name: 'Postgres', desc: 'Database' },
              { name: 'Docker', desc: 'DevOps' },
              { name: 'Tailwind CSS', desc: 'Styling' },
            ].map((skill) => (
              <div key={skill.name} className="w-[140px] flex flex-col items-center justify-center gap-2.5 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                  {skill.name.charAt(0)}
                </div>
                <h4 className="text-base font-medium text-foreground m-0">{skill.name}</h4>
                <p className="text-sm text-foreground-muted m-0">{skill.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-2.5 pt-[45px]">
            <a
              href="mailto:hello@webentic.dev"
              className="inline-flex items-center gap-2 px-5 rounded-lg h-9 leading-none font-medium text-background bg-foreground hover:opacity-90 cursor-pointer no-underline transition-opacity"
            >
              <span>Contact me</span>
              <svg width="10" height="10" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L1 10M10 1L2.65233 1M10 1L10 8.3477" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-[100px] pb-[50px]">
        <div className="mx-auto w-[30px] h-px mb-2 bg-muted" />
        <p className="text-foreground-muted text-center">
          &copy; {new Date().getFullYear()} Webentic. Built with Next.js.
        </p>
      </footer>
    </div>
  )
}
