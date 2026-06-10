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

const SOURCE_FILE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'scala',
  'c', 'cpp', 'h', 'hpp', 'cs', 'swift',
  'php', 'pl', 'pm', 'r', 'm',
  'css', 'scss', 'sass', 'less', 'styl',
  'html', 'htm', 'xml', 'svg', 'vue', 'svelte', 'astro',
  'json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'md', 'mdx', 'txt', 'rst', 'adoc',
  'sh', 'bash', 'zsh', 'fish', 'bat', 'ps1',
  'dockerfile', 'makefile', 'cmake',
  'sql', 'graphql', 'proto',
  'prisma', 'gradle', 'properties',
])

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.github', '.next', 'dist', 'build',
  '.cache', '__pycache__', '.venv', 'venv', 'env',
  'coverage', '.nyc_output', '.turbo',
  '.vercel', '.serverless', '.webpack',
])

interface TreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url?: string
}

export interface RepoFile {
  path: string
  content: string
}

const MAX_SOURCE_FILES = 80
const MAX_FILE_SIZE = 100_000

export async function getAllSourceFiles(
  owner: string,
  repo: string,
  branch = 'main',
  token?: string
): Promise<{ files: RepoFile[]; structure: string }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  const treeRes = await fetch(treeUrl, { headers })
  let tree: TreeItem[]

  if (!treeRes.ok && branch !== 'master') {
    const fallback = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers }
    )
    if (!fallback.ok) throw new Error('Failed to fetch repository tree')
    const d = await fallback.json()
    tree = d.tree as TreeItem[]
  } else if (!treeRes.ok) {
    throw new Error('Failed to fetch repository tree')
  } else {
    const d = await treeRes.json()
    tree = d.tree as TreeItem[]
  }

  const sourceFiles = tree
    .filter((item: TreeItem) => {
      if (item.type !== 'blob') return false
      const dirs = item.path.split('/')
      if (dirs.some((d) => EXCLUDED_DIRS.has(d))) return false
      if (item.size && item.size > MAX_FILE_SIZE) return false
      const ext = item.path.split('.').pop()?.toLowerCase() || ''
      if (item.path.endsWith('Dockerfile') || item.path.endsWith('Makefile')) return true
      return SOURCE_FILE_EXTENSIONS.has(ext)
    })
    .slice(0, MAX_SOURCE_FILES)

  const structureLines = tree
    .filter((item) => {
      const dirs = item.path.split('/')
      return !dirs.some((d) => EXCLUDED_DIRS.has(d))
    })
    .map((item) => item.path)

  const structure = structureLines.join('\n')

  const rawHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  }
  if (token) rawHeaders.Authorization = `Bearer ${token}`

  const contents = await Promise.all(
    sourceFiles.map(async (item: TreeItem) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`
        const res = await fetch(rawUrl, { headers: rawHeaders })
        if (!res.ok) return { path: item.path, content: '' } as RepoFile
        const text = await res.text()
        return { path: item.path, content: text } as RepoFile
      } catch {
        return { path: item.path, content: '' } as RepoFile
      }
    })
  )

  return {
    files: contents.filter((f) => f.content.length > 0),
    structure,
  }
}
