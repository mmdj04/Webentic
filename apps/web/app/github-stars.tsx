'use client'

import { useEffect, useState } from 'react'
import { Github } from 'lucide-react'
import { Button } from 'ui'

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
    <Button asChild type="text" size="tiny" className="gap-1.5 rounded-full">
      <a
        href="https://github.com/mmdj04/Webentic"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="size-3.5" />
        <span>{stars.toLocaleString()}</span>
      </a>
    </Button>
  )
}
