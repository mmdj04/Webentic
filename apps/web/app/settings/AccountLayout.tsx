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

function SidebarContent({ sections }: { sections: SidebarSection[] }) {
  return (
    <div className="min-h-dvh bg-dash-sidebar flex flex-col justify-between hide-scrollbar w-full md:w-64 md:border-r border-default">
      <div className="flex-1 flex flex-col">
        <div className="shrink-0">
          <div className="flex h-12 max-h-12 items-center border-b px-6 border-default">
            <Link
              href="/"
              className="flex text-sm flex-row gap-2 items-center text-foreground-lighter focus-visible:text-foreground hover:text-foreground"
            >
              <ArrowLeft strokeWidth={1.5} size={16} />
              Back to dashboard
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col">
            {sections.map((section) => (
              <div key={section.key} className="mt-8">
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
      </div>
    </div>
  )
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
      <SidebarContent sections={sections} />
      <div className="flex flex-1 flex-col">
        <div className="flex-1 grow overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
