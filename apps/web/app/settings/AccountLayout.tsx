'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

interface SidebarLink {
  key: string
  label: string
  href: string
  isActive: boolean
}

interface SidebarSection {
  key: string
  heading: string
  links: SidebarLink[]
}

export function AccountLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()

  const sections: SidebarSection[] = useMemo(
    () => [
      {
        key: 'account-settings',
        heading: 'Account Settings',
        links: [
          {
            key: 'preferences',
            label: 'Preferences',
            href: '/settings',
            isActive: pathname === '/settings',
          },
        ],
      },
    ],
    [pathname]
  )

  return (
    <div className="flex flex-col md:flex-row min-h-dvh">
      {/* Mobile top bar */}
      <div className="md:hidden flex h-12 items-center border-b px-4 border-default bg-background">
        <Link
          href="/"
          className="flex text-sm gap-2 items-center text-foreground-lighter hover:text-foreground"
        >
          <ArrowLeft strokeWidth={1.5} size={16} />
          Back to dashboard
        </Link>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex min-h-dvh bg-dash-sidebar flex-col w-64 border-r border-default">
        <div className="flex h-12 items-center border-b px-6 border-default shrink-0">
          <Link
            href="/"
            className="flex text-sm gap-2 items-center text-foreground-lighter hover:text-foreground"
          >
            <ArrowLeft strokeWidth={1.5} size={16} />
            Back to dashboard
          </Link>
        </div>
        <div className="flex-1 overflow-auto pt-2">
          {sections.map((section) => (
            <div key={section.key}>
              <div className="px-6 mb-2">
                <p className="text-xs uppercase tracking-wider font-medium text-foreground-lighter">
                  {section.heading}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 px-3">
                {section.links.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      link.isActive
                        ? 'bg-surface-200 text-foreground'
                        : 'text-foreground-light hover:text-foreground hover:bg-surface-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
