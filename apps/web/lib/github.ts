const GITHUB_API = 'https://api.github.com'

export interface GitHubRepo {
  id: number
  full_name: string
  owner: { login: string; avatar_url: string }
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  updated_at: string
  default_branch: string
}

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

export async function searchRepos(
  query: string,
  token?: string
): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&per_page=20`,
    { headers }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`)
  const data = await res.json()
  return data.items as GitHubRepo[]
}

export async function getRepo(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepo> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers })
  if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`)
  return res.json()
}

export async function getRepoContents(
  owner: string,
  repo: string,
  path = '',
  token?: string
): Promise<GitHubFile[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`)
  return res.json()
}

export async function getRepoReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/readme`,
    { headers }
  )
  if (!res.ok) return ''
  return res.text()
}

export async function getRepoTree(
  owner: string,
  repo: string,
  branch = 'main',
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  )
  if (!res.ok) {
    // try master branch
    const res2 = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers }
    )
    if (!res2.ok) throw new Error(`GitHub API error: ${res.statusText}`)
    const data2 = await res2.json()
    return JSON.stringify(data2.tree, null, 2)
  }
  const data = await res.json()
  return JSON.stringify(data.tree, null, 2)
}
