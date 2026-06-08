export default function DocPageLoading() {
  return (
    <main className="relative lg:gap-10 xl:grid xl:grid-cols-[1fr_200px] px-8 md:px-16 py-20">
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <div className="mb-4 flex items-center space-x-1 text-sm text-foreground-muted">
          <div className="h-4 w-12 bg-foreground-muted/20 rounded animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-5">
          <div className="space-y-2 w-full">
            <div className="h-10 w-3/4 bg-foreground-muted/20 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-foreground-muted/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-full bg-foreground-muted/20 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-foreground-muted/20 rounded animate-pulse" />
        </div>
      </div>
    </main>
  )
}
