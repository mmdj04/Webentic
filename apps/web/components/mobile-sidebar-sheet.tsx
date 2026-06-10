'use client'

import { usePathname } from 'next/navigation'
import { ScrollArea, Sheet, SheetContent, SheetTitle } from 'ui'

import SideNavigation from '@/components/side-navigation'
import DesignSystemSideNavigation from '@/components/design-system-side-navigation'
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar'

export function MobileSidebarSheet() {
  const { open, setOpen } = useMobileSidebar()
  const pathname = usePathname()
  const isDesignSystem = pathname?.startsWith('/design-system')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="p-0 w-[240px] sm:w-[280px]" showClose={false}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <ScrollArea className="h-full py-6 lg:py-8">
          {isDesignSystem ? <DesignSystemSideNavigation /> : <SideNavigation />}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
