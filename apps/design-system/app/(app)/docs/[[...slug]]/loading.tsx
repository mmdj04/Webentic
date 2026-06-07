export default function DocPageLoading() {
  return (
    <div className="relative xl:grid xl:grid-cols-[1fr_160px] gap-4 px-6 py-6 lg:py-8">
      <div className="mx-auto w-full min-w-0 max-w-4xl flex-1">
        <nav className="mb-4 flex items-center space-x-1 text-sm text-foreground-lighter">
          <div className="h-4 w-16 bg-foreground-muted/20 rounded animate-pulse" />
        </nav>
        <div className="space-y-2 mb-5">
          <div className="h-10 w-3/4 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-foreground-muted/20 rounded animate-pulse" />
        </div>
        <div className="h-px w-full mb-6" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-full bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-foreground-muted/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
