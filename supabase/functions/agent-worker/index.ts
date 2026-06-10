import { createClient } from 'jsr:@supabase/supabase-js@2'

const GITHUB_API = 'https://api.github.com'
const GEMINI_MODEL = 'gemini-3.5-flash'
const MAX_FILE_SIZE = 100_000

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

interface GitHubRepo {
  full_name: string
  name: string
  owner: { login: string }
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  default_branch: string
}

interface TreeItem {
  path: string
  type: string
  size?: number
}

async function searchRepos(token?: string): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Webentic-Agent',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=10`,
    { headers }
  )
  if (!res.ok) throw new Error(`GitHub search error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data.items as GitHubRepo[]
}

async function getSourceFiles(
  owner: string,
  repo: string,
  branch: string,
  token?: string,
  timeBudgetMs = 60_000
): Promise<{ files: { path: string; content: string }[]; structure: string }> {
  const startTime = Date.now()

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Webentic-Agent',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  const treeRes = await fetch(treeUrl, { headers })
  if (!treeRes.ok) throw new Error('Failed to fetch repository tree')
  const treeData = await treeRes.json()
  const tree = treeData.tree as TreeItem[]

  const sourceFiles = tree.filter((item) => {
    if (item.type !== 'blob') return false
    const dirs = item.path.split('/')
    if (dirs.some((d) => EXCLUDED_DIRS.has(d))) return false
    if (item.size && item.size > MAX_FILE_SIZE) return false
    const ext = item.path.split('.').pop()?.toLowerCase() || ''
    if (item.path.endsWith('Dockerfile') || item.path.endsWith('Makefile')) return true
    return SOURCE_FILE_EXTENSIONS.has(ext)
  })

  const structureLines = tree
    .filter((item) => {
      const dirs = item.path.split('/')
      return !dirs.some((d) => EXCLUDED_DIRS.has(d))
    })
    .map((item) => item.path)

  const structure = structureLines.join('\n')

  const rawHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
    'User-Agent': 'Webentic-Agent',
  }
  if (token) rawHeaders.Authorization = `Bearer ${token}`

  const files: { path: string; content: string }[] = []

  for (const item of sourceFiles) {
    if (Date.now() - startTime > timeBudgetMs) break

    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`
      const res = await fetch(rawUrl, { headers: rawHeaders })
      if (res.ok) {
        const text = await res.text()
        if (text.length > 0) {
          files.push({ path: item.path, content: text })
        }
      }
    } catch {
      // skip failed file
    }
  }

  return { files, structure }
}

async function generateGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 65536 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${errText}`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

function buildPrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  structure: string,
  files: { path: string; content: string }[]
): string {
  return `<role>
You are an expert technical documentation writer. Generate comprehensive, well-structured documentation for the open-source repository.
</role>

<repository_info>
- Name: ${repoName}
- Description: ${description || 'N/A'}
- Language: ${language || 'N/A'}
- Topics: ${topics.join(', ') || 'N/A'}
</repository_info>

<source_data>
The following is the file structure and contents of the repository:

<file_structure>
${structure}
</file_structure>

<file_contents>
${files.map((f) => `<file path="${f.path}">\n${f.content.slice(0, 8000)}\n</file>`).join('\n\n')}
</file_contents>
</source_data>

<output_structure>
Generate documentation with these sections:

1. ## 📋 Overview
   - Brief description of what the project does
   - Key features and capabilities

2. ## 🏗️ Architecture
   - High-level architecture overview
   - Use a Mermaid diagram to show component relationships

3. ## 📁 Project Structure
   - Table of the main directories and their purposes

4. ## 🚀 Getting Started
   - Prerequisites
   - Installation steps
   - Basic usage example

5. ## 🧩 Key Components
   - For each major component/class/function:
     - Name and purpose
     - Source file reference (with line numbers)
     - Key methods and their signatures
     - Usage example

6. ## 🔧 Configuration
   - Environment variables
   - Configuration options

7. ## 📊 API Reference (if applicable)
   - Endpoints
   - Request/Response formats
   - Authentication

8. ## 🧪 Testing
   - How to run tests
   - Testing structure

9. ## 🤝 Contributing
   - Guidelines for contributors
</output_structure>

<formatting_rules>
- Use proper Markdown throughout
- Include a Mermaid diagram in the Architecture section using \`\`\`mermaid blocks
- Use tables for structured data (configuration options, API endpoints, component lists)
- Reference source files with their exact paths and line numbers where relevant
- Use code blocks with language identifiers for all code examples
- Keep descriptions clear and concise
- Use emojis sparingly for section headers only
</formatting_rules>`
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const accessToken = authHeader.slice(7)
  const { agent_id } = await req.json()

  if (!agent_id) {
    return new Response(JSON.stringify({ error: 'agent_id is required' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  )

  const { data: agent, error: agentError } = await supabase
    .from('agent_configs')
    .select('*')
    .eq('id', agent_id)
    .single()

  if (agentError || !agent) {
    return new Response(JSON.stringify({ error: 'Agent not found' }), { status: 404 })
  }

  const log = async (message: string, level = 'info') => {
    await supabase.from('agent_logs').insert({ agent_id, message, level })
  }

  const runId = Date.now().toString(36)

  try {
    await log(`[${runId}] Agent started: ${agent.name}`)
    await log(`[${runId}] Searching GitHub for repositories with 1k+ stars...`)

    const repos = await searchRepos(agent.github_token || undefined)

    if (repos.length === 0) {
      await log(`[${runId}] No repositories found`, 'warn')
      await supabase.from('agent_configs').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', agent_id)
      return new Response(JSON.stringify({ message: 'No repos found' }))
    }

    const repo = repos[0]
    const [owner, name] = repo.full_name.split('/')

    await log(`[${runId}] Selected repository: ${repo.full_name} ⭐ ${repo.stargazers_count}`)
    await log(`[${runId}] Fetching source files from ${repo.full_name}...`)

    const { files, structure } = await getSourceFiles(
      owner,
      name,
      repo.default_branch,
      agent.github_token || undefined,
      60_000
    )

    await log(`[${runId}] Retrieved ${files.length} source files`)

    if (files.length === 0) {
      await log(`[${runId}] No source files found`, 'error')
      await supabase.from('agent_configs').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', agent_id)
      return new Response(JSON.stringify({ message: 'No source files found' }))
    }

    await log(`[${runId}] Generating documentation via Gemini...`)

    const prompt = buildPrompt(repo.full_name, repo.description, repo.language, repo.topics, structure, files)
    const documentation = await generateGemini(prompt, agent.gemini_api_key!)

    if (!documentation) {
      throw new Error('Gemini returned empty documentation')
    }

    const analysisId = crypto.randomUUID()

    await supabase.from('repository_analyses').upsert({
      id: analysisId,
      user_id: agent.user_id,
      repo_owner: owner,
      repo_name: name,
      repo_url: repo.html_url,
      analysis_data: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        description: repo.description,
        language: repo.language,
        topics: repo.topics,
      },
      documentation,
      status: 'completed',
    })

    await log(`[${runId}] ✅ Documentation published for ${repo.full_name}`)
    await log(`[${runId}] Agent run complete`)

    await supabase.from('agent_configs').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', agent_id)

    return new Response(JSON.stringify({ message: 'Agent run complete', repo: repo.full_name }))
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await log(`[${runId}] Fatal error: ${errMsg}`, 'error')
    await supabase.from('agent_configs').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', agent_id)
    return new Response(JSON.stringify({ error: errMsg }), { status: 500 })
  }
})
