import { createClient } from 'jsr:@supabase/supabase-js@2'

const GITHUB_API = 'https://api.github.com'
const GEMINI_MODEL = 'gemini-3.5-flash'
const MAX_FILE_SIZE = 100_000
const PER_PAGE = 100

const SOURCE_FILE_EXTENSIONS = new Set([
  // JavaScript ecosystem
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts', 'd.ts',
  'vue', 'svelte', 'astro', 'qwik', 'njk', 'hbs', 'ejs', 'pug', 'jade',
  // Python
  'py', 'pyx', 'pxd', 'pyi', 'ipynb', 'pyw', 'rpy',
  // Ruby
  'rb', 'erb', 'rbs', 'rake', 'gemfile', 'gemspec',
  // Go
  'go', 'mod', 'sum',
  // Rust
  'rs', 'rlib', 'rson',
  // Java & JVM
  'java', 'kt', 'kts', 'scala', 'sc', 'groovy', 'gvy', 'gy', 'gsh',
  'clj', 'cljs', 'cljc', 'edn',
  // C family
  'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'hh', 'hxx', 'cuh', 'cu',
  'cs', 'fs', 'fsx', 'vb',
  // Swift/ObjC
  'swift', 'm', 'mm',
  // PHP
  'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'phpt',
  // Web
  'html', 'htm', 'xhtml', 'xml', 'xsl', 'xslt', 'svg', 'webmanifest',
  'css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss',
  // Config / data
  'json', 'jsonc', 'json5', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'env', 'editorconfig', 'gitattributes', 'gitmodules',
  // Markup / docs
  'md', 'mdx', 'txt', 'rst', 'adoc', 'asciidoc', 'tex', 'bib',
  // Shell / scripts
  'sh', 'bash', 'zsh', 'fish', 'ksh', 'csh', 'bat', 'cmd', 'ps1', 'psm1',
  'awk', 'sed', 'exp',
  // Build / CI
  'dockerfile', 'makefile', 'cmake', 'mk', 'gnumakefile',
  'gradle', 'maven', 'ant', 'bazel', 'bzl', 'buck',
  'github', 'gitlab-ci', 'circleci', 'travis',
  // Database
  'sql', 'psql', 'mysql', 'pgsql', 'sqlite', 'graphql', 'gql', 'prisma',
  'dbt', 'migration',
  // Protocol / API
  'proto', 'protobuf', 'grpc', 'thrift', 'avsc', 'avdl',
  // Android
  'xml', 'gradle', 'kt', 'kts', 'dart',
  // Dart/Flutter
  'dart',
  // Lua
  'lua', 'wlua',
  // Elixir/Erlang
  'ex', 'exs', 'erl', 'hrl',
  // Haskell
  'hs', 'lhs', 'cabal',
  // Julia
  'jl',
  // R
  'r', 'rdata', 'rds',
  // Zig
  'zig', 'zon',
  // Nim
  'nim', 'nims',
  // Crystal
  'cr',
  // OCaml
  'ml', 'mli',
  // Assembly
  'asm', 's', 'nasm',
  // Properties / env
  'properties', 'props', 'env', 'dotenv',
  // Nix
  'nix',
  // Terraform / IaC
  'tf', 'tfvars', 'hcl',
  // Miscellaneous
  'lock', 'seed', 'snapshot', 'patch', 'diff',
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
  size?: string
}

async function searchReposPage(page: number, token?: string): Promise<{ items: GitHubRepo[]; total: number }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Webentic-Agent',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`,
    { headers }
  )
  if (!res.ok) throw new Error(`GitHub search error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return { items: data.items as GitHubRepo[], total: data.total_count as number }
}

async function findUndocumentedRepo(
  supabase: ReturnType<typeof createClient>,
  token?: string
): Promise<GitHubRepo | null> {
  let page = 1

  while (true) {
    const { items: repos } = await searchReposPage(page, token)

    if (repos.length === 0) return null

    const urls = repos.map((r) => r.html_url)
    const { data: existing } = await supabase
      .from('repository_analyses')
      .select('repo_url')
      .in('repo_url', urls)
      .neq('status', 'failed')

    const existingUrls = new Set((existing || []).map((r: { repo_url: string }) => r.repo_url))

    for (const repo of repos) {
      if (!existingUrls.has(repo.html_url)) {
        return repo
      }
    }

    page++
  }
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

  let treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  let treeRes = await fetch(treeUrl, { headers })

  if (!treeRes.ok && branch !== 'master') {
    treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`
    treeRes = await fetch(treeUrl, { headers })
  }

  if (!treeRes.ok) throw new Error('Failed to fetch repository tree')
  const treeData = await treeRes.json()
  const tree = treeData.tree as TreeItem[]

  const sourceFiles = tree.filter((item) => {
    if (item.type !== 'blob') return false
    const dirs = item.path.split('/')
    if (dirs.some((d) => EXCLUDED_DIRS.has(d))) return false
    if (item.size && parseInt(item.size) > MAX_FILE_SIZE) return false
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

async function getLatestCommitSha(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Webentic-Agent',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/branches/${branch}`,
    { headers }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.commit?.sha || null
}

function buildPrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  owner: string,
  repo: string,
  commitSha: string,
  structure: string,
  files: { path: string; content: string }[]
): string {
  // Add line numbers to file contents for accurate source line references
  const numberedFiles = files.map(f => {
    const lines = f.content.split('\n')
    const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')
    return { path: f.path, content: numbered }
  })

  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert technical documentation writer. Generate comprehensive, well-structured documentation in the style of DeepWiki for this open-source repository. Focus on accuracy, technical depth, and traceability to source code.
</role>

<repository_info>
- Name: ${repoName}
- Description: ${description || 'N/A'}
- Language: ${language || 'N/A'}
- Topics: ${topics.join(', ') || 'N/A'}
- Indexed commit: ${commitSha}
- Source files analyzed: ${files.length}
- GitHub base URL: ${githubBase}
</repository_info>

<source_data>
File contents include LINE NUMBERS (format "LINE_NUMBER:content"). Use these to reference exact source locations.

<file_structure>
${structure}
</file_structure>

<file_contents>
${numberedFiles.map((f) => `<file path="${f.path}">\n${f.content.slice(0, 10000)}\n</file>`).join('\n\n')}
</file_contents>
</source_data>

<output_structure>
Generate a single-page DeepWiki-style wiki with sections in this order:

### Relevant Source Files
Table with columns: File, Purpose, Key Elements.
List the most important source files identified in the repository.
After each file path, add a clickable Markdown link to the GitHub location.

### Overview
What the project does, key features, problems it solves. Reference source files.

### Project Type
First, determine the type of this repository:
- **If the repo is a curated list / awesome list / collection of links** (few or no source code files, mainly a README.md with categorized links), classify it as a "Curated Resource Collection." Do NOT invent software architecture, do NOT generate a Mermaid diagram, and do NOT describe markdown files as "components" or "engines."
- **If the repo is a software project** (has actual source code in languages like .ts, .py, .go, .rs, .java, .c, etc.), classify it as a "Software Project" and generate the Architecture section as normal.
- **If the repo is a book / documentation project** (markdown chapters, e-book build system), classify it as a "Documentation / Book" and describe its structure accordingly.

### Architecture
Only generate this section if the repo is a "Software Project."
If applicable, include a Mermaid diagram (\`\`\`mermaid ... \`\`\`) showing component/module relationships.
Then explain each component with source file and line range references.
After this section, add a "Sources:" bullet list of all files referenced.
**For curated lists or books, skip the Architecture section entirely or replace it with a "Content Organization" section describing how the content is structured.**

### Project Structure
Table of main directories with columns: Directory, Purpose, Key Files.

### Getting Started
Prerequisites, installation steps, basic usage examples with code blocks.
**IMPORTANT: Only include terminal commands (npx, npm, pip, go install, etc.) if they EXACTLY appear in the provided source file contents. Never invent or guess commands.**

### Key Components
For a software project, describe each major component/module/class:
#### Component Name
- **File:** \`path/file.ts#L10-L50\` (as Markdown link to GitHub)
- **Purpose:** What this component does
- **Key Methods/Properties:** Table with columns: Name, Signature, Description, Source (file with line range)
- **Sources:** List of files this component touches
**For curated lists, replace this with "Content Categories" and describe the organization of the listed resources.**
**For books, replace this with "Chapter Overview" and describe the chapters.**

### Configuration
Table with columns: Key, Type, Default, Description, Source file link.
Only include if the repo has actual configuration files.

### Key Data Structures
For each important type/interface/class/struct:
#### Structure Name
- **File:** \`path/file.ts#L10-L50\`
- **Fields:** Table with columns: Field, Type, Description, Source link
- **Used In:** References to components/files that consume this structure
Only include for software projects with actual data structures.

### Testing
Testing approach, how to run tests, test file locations.
**Only include commands that appear verbatim in the source files.**

### Last Indexed
- **Commit:** ${commitSha}
- **Source files analyzed:** ${files.length}
- **Indexed at:** ${new Date().toISOString()}
</output_structure>

<formatting_rules>
- Output valid Markdown
- EVERY source file reference MUST include line ranges (e.g., \`path/file.ts#L10-L50\`)
- Use Markdown link syntax for source references: \`[path/file.ts#L10-L50](${githubBase}/path/file.ts#L10-L50)\`
- Only generate a Mermaid diagram if the repo is a software project with actual code architecture
- Use tables for all structured data (add blank line before and after)
- Use \`\`\`language code blocks for code examples
- After each major section, add a "Sources:" line listing files referenced with line ranges
- Be technically detailed and precise
- Avoid inline HTML and unnecessary emojis
- **CRITICAL: Never invent terminal commands.** Only show a command if it is written verbatim in a source file (e.g., a Makefile, Dockerfile, CI config, or README). If no source file contains a command example, do not generate any code blocks with shell commands.
- **CRITICAL: Do not invent software architecture.** If the repo has no source code (only markdown, config files, and documentation), describe it as a curated collection, list, or book — not as a software framework. Do not generate Mermaid diagrams for list/collection repos.
- **CRITICAL: Do not describe markdown files or templates as "components," "engines," "pipelines," or "frameworks."** Files like CONTRIBUTING.md, pull_request_template.md, and ISSUE_TEMPLATE.md are documentation templates, not software modules.
</formatting_rules>`
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const accessToken = authHeader.slice(7)
  const { agent_id } = await req.json()

  if (!agent_id) {
    return new Response(JSON.stringify({ error: 'agent_id is required' }), { status: 400, headers: corsHeaders })
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
    return new Response(JSON.stringify({ error: 'Agent not found' }), { status: 404, headers: corsHeaders })
  }

  const log = async (message: string, level = 'info') => {
    await supabase.from('agent_logs').insert({ agent_id, message, level })
  }

  const runId = Date.now().toString(36)

  try {
    await log(`[${runId}] Agent started: ${agent.name}`)
    await log(`[${runId}] Searching for undocumented repos with 1k+ stars...`)

    const repo = await findUndocumentedRepo(supabase, agent.github_token || undefined)

    if (!repo) {
      await log(`[${runId}] All repositories have already been documented`, 'warn')
      await supabase.from('agent_configs').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', agent_id)
      return new Response(JSON.stringify({ message: 'No undocumented repos found' }), { headers: corsHeaders })
    }

    const [owner, name] = repo.full_name.split('/')

    await log(`[${runId}] Selected: ${repo.full_name} ⭐ ${repo.stargazers_count} (not yet documented)`)
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
      return new Response(JSON.stringify({ message: 'No source files found' }), { headers: corsHeaders })
    }

    await log(`[${runId}] Fetching latest commit SHA...`)

    const commitSha = await getLatestCommitSha(owner, name, repo.default_branch, agent.github_token || undefined) || 'HEAD'

    await log(`[${runId}] Generating documentation via Gemini...`)

    // Set status to running before Gemini (longest operation, may timeout)
    await supabase.from('agent_configs').update({ status: 'running', updated_at: new Date().toISOString() }).eq('id', agent_id)

    const prompt = buildPrompt(repo.full_name, repo.description, repo.language, repo.topics, owner, name, commitSha, structure, files)
    const documentation = await generateGemini(prompt, agent.gemini_api_key!)

    if (!documentation) {
      throw new Error('Gemini returned empty documentation')
    }

    // Log progress: about to save
    await log(`[${runId}] Saving documentation to database...`)

    await supabase.from('repository_analyses').upsert({
      id: crypto.randomUUID(),
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
        indexed_commit_sha: commitSha,
        default_branch: repo.default_branch,
      },
      documentation,
      status: 'completed',
    })

    await log(`[${runId}] ✅ Documentation published for ${repo.full_name}`)
    await log(`[${runId}] Agent run complete`)

    await supabase.from('agent_configs').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', agent_id)

    return new Response(JSON.stringify({ message: 'Agent run complete', repo: repo.full_name }), { headers: corsHeaders })
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await log(`[${runId}] Fatal error: ${errMsg}`, 'error')
    await supabase.from('agent_configs').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', agent_id)
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: corsHeaders })
  }
})
