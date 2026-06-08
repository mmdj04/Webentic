import { SidebarNavItem } from '@/types/nav'

export function sortSidebarItems(items: SidebarNavItem[]): SidebarNavItem[] {
  const priorityItems = items.filter((item) => item.priority)
  const regularItems = items
    .filter((item) => !item.priority)
    .sort((a, b) => a.title.localeCompare(b.title))
  return [...priorityItems, ...regularItems]
}
