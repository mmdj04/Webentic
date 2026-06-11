'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://api.github.com/repos/mmdj04/Webentic')
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null))
  }, [])

  if (stars === null) return null

  return (
    <a
      href="https://github.com/mmdj04/Webentic"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-foreground-lighter hover:text-foreground hover:bg-muted transition-colors"
    >
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span>{stars.toLocaleString()}</span>
    </a>
  )
}
