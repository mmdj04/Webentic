import { createClient } from 'jsr:@supabase/supabase-js@2'

const GITHUB_API = 'https://api.github.com'
const GEMINI_MODEL = 'gemini-3.5-flash'
const MAX_FILE_SIZE = 100_000
const PER_PAGE = 100
const MAX_INPUT_FILES = 50
const MAX_RETRIES = 3

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

const CODE_PRIORITY = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts',
  'py', 'go', 'rs', 'java', 'kt', 'scala', 'rb', 'c', 'cpp',
  'h', 'hpp', 'cs', 'swift', 'php',
])

function chunkFiles(files: { path: string; content: string }[]): { path: string; content: string }[][] {
  const chunks: { path: string; content: string }[][] = []
  for (let i = 0; i < files.length; i += MAX_INPUT_FILES) {
    chunks.push(files.slice(i, i + MAX_INPUT_FILES))
  }
  return chunks
}

function prioritizeFiles(files: { path: string; content: string }[]): { path: string; content: string }[] {
  // Score each file: code > config > docs/media
  const scored = files.map(f => {
    const ext = f.path.split('.').pop()?.toLowerCase() || ''
    const basename = f.path.split('/').pop()?.toLowerCase() || ''
    const isConfig = ['json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'editorconfig', 'gitattributes'].includes(ext)
    const isDoc = ['md', 'mdx', 'txt', 'rst', 'license', 'readme'].includes(ext) ||
                  ['license', 'readme', 'contributing', 'code-of-conduct'].includes(basename)
    const isBuild = ext === 'sh' || ext === 'makefile' || ['dockerfile', 'makefile'].includes(basename)
    let score = 0
    if (CODE_PRIORITY.has(ext)) score = 3
    else if (isBuild || isConfig) score = 2
    else if (isDoc) score = 1
    if (f.path.startsWith('src/') || f.path.startsWith('lib/') || f.path.startsWith('packages/')) score += 1
    const depth = f.path.split('/').length
    score -= depth * 0.1
    return { ...f, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, MAX_INPUT_FILES * 4).map(({ score: _, ...f }) => f)
}

function buildAnalysisPrompt(
  files: { path: string; content: string }[],
  chunkIndex: number,
  totalChunks: number
): string {
  const numberedFiles = files.map(f => {
    const lines = f.content.split('\n')
    const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')
    return { path: f.path, content: numbered }
  })

  return `<role>
You are an expert Code Analyst — Stage 1 of 3 in our documentation pipeline.
Your sole job is to analyze source files and produce exhaustive file-level breakdowns.
You have the full 150s generation budget. Use it to analyze every function, type, import, and constant.
</role>

<stage_info>
Stage 1/3 — Per-file Code Analysis (batch ${chunkIndex} of ${totalChunks})
Your output will feed into Stage 2 (Architecture Analysis) and Stage 3 (Documentation Writer).
</stage_info>

<instructions>
Analyze EVERY file in this batch. For each file produce a structured analysis:

## \`path/to/file.ts\`

### Purpose
What does this file do? Where does it belong in the project?

### Exports (Public API)
For every exported symbol (function, class, interface, type, constant, enum):
- \`export function foo(bar: string): number\` (line 12-45)
- What it does, parameters, return type, side effects, error handling

### Internal Functions & Helpers
Non-exported functions with line ranges and purpose.

### Types & Interfaces
Full breakdown of every type/interface/enum with fields, types, and where used.

### Dependencies
**Internal**: imports from other project files — what specifically is imported
**External**: npm/pip/go/etc packages used

### Constants & Configuration
Important constants, env vars, magic numbers, config keys.

### Architecture Notes
Design patterns, state management, event flow, callbacks, class hierarchies.

---
Be exhaustive — no detail is too small. Stage 3 will read this as the authoritative source.
</instructions>

<files>
${numberedFiles.map((f) => `<file path="${f.path}">\n${f.content}\n</file>`).join('\n\n')}
</files>`
}

function buildArchitecturePrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  owner: string,
  repo: string,
  commitSha: string,
  structure: string,
  analyses: string[]
): string {
  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert Architecture Analyst — Stage 2 of 3 in our documentation pipeline.
Your job is to take per-file analyses from Stage 1 and synthesize them into a comprehensive architecture overview.
You have the full 150s generation budget. Identify patterns, relationships, data flow, and design decisions.
</role>

<stage_info>
Stage 2/3 — Cross-file Architecture & Dependency Analysis
Your output will be the primary input for Stage 3 (Documentation Writer).
</stage_info>

<repository_info>
- Name: ${repoName}
- Description: ${description || 'N/A'}
- Language: ${language || 'N/A'}
- Topics: ${topics.join(', ') || 'N/A'}
- Indexed commit: ${commitSha}
- GitHub base URL: ${githubBase}
</repository_info>

<file_structure>
${structure}
</file_structure>

<stage1_analyses>
The following are detailed per-file analyses from Stage 1. Analyze them together to understand the full system.

${analyses.map((a, i) => `<analysis_batch_${i + 1}>\n${a}\n</analysis_batch_${i + 1}>`).join('\n\n')}
</stage1_analyses>

<instructions>
Produce a structured architecture report with these sections:

## Project Classification
- **Software Project** / **Curated Collection** / **Documentation Book**
- Justify with evidence from Stage 1 analyses

## Dependency Graph
For each major module/component:
- What it depends on (both internal and external)
- What depends on it
- Categorize: runtime dep, dev dep, optional dep

## Architectural Layers
Identify the major layers of the project (e.g., API layer, business logic, data access, UI, config).
For each layer:
- Which files/modules belong to it
- What responsibility it has
- How it communicates with other layers

## Data Flow
How data moves through the system:
- Entry points
- Request/response lifecycle
- State management
- Events and event handlers
- External API interactions

## Design Patterns
Patterns used in the codebase (MVC, Observer, Factory, Singleton, Repository, etc.):
- Where each pattern appears (file and line ranges)
- Why it's used there

## Key Components Summary
For each major component identified across all files:
- **Name**: component/module name
- **Files**: list of files that implement it
- **Responsibility**: what it does
- **Public API surface**: how other components interact with it
- **Dependencies**: what it needs to function

## Configuration Architecture
How the project is configured:
- Config file formats and locations
- Environment variables (required vs optional)
- Build-time vs runtime configuration
- Feature flags

## Testing Architecture
- Testing framework
- Test organization (unit vs integration vs e2e)
- Mock/stub approach
- CI pipeline testing stages

---
Be exhaustive and technically precise. Stage 3 will use this report to write the final documentation.
</instructions>`
}

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

async function generateGemini(prompt: string, apiKey: string, log?: (msg: string, level?: string) => Promise<void>): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
  const estimatedTokens = Math.ceil(prompt.length / 4)

  if (estimatedTokens > 200_000) {
    const warn = `[WARN] Prompt ~${estimatedTokens.toLocaleString()} tokens (free tier limit: 250K/min)`
    if (log) await log(warn, 'warn')
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 65536,
          thinkingConfig: { thinkingLevel: 'HIGH' },
        },
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    const errText = await res.text()

    // Check if it's a quota error with a retry delay
    if (res.status === 429) {
      let delayMs = 60_000 // default 60s
      try {
        const errBody = JSON.parse(errText)
        const retryStr = errBody?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay || '60s'
        const seconds = parseInt(retryStr) || 60
        delayMs = seconds * 1000 + 2000 // add 2s buffer
      } catch { /* use default */ }

      if (attempt < MAX_RETRIES) {
        const msg = `[RETRY ${attempt}/${MAX_RETRIES}] Quota exceeded, waiting ${Math.round(delayMs / 1000)}s...`
        if (log) await log(msg, 'warn')
        await new Promise(r => setTimeout(r, delayMs))
        continue
      }
    }

    throw new Error(`Gemini API error: ${res.status} ${errText}`)
  }

  throw new Error('Gemini API error: max retries exceeded')
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

function buildFinalPrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  owner: string,
  repo: string,
  commitSha: string,
  defaultBranch: string,
  structure: string,
  files: { path: string; content: string }[],
  architectureReport: string
): string {
  const numberedFiles = files.map(f => {
    const lines = f.content.split('\n')
    const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')
    return { path: f.path, content: numbered }
  })

  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert Technical Documentation Writer — Stage 3 of 3 in our documentation pipeline.
Your job is to take the Stage 2 architecture report and selected source files, then produce a beautiful, comprehensive DeepWiki-style wiki page.
You have the full 150s generation budget. Use it to write deep, thorough documentation with precise source code traceability.
</role>

<stage_info>
Stage 3/3 — Final Wiki Generation
Inputs: Stage 2 Architecture Report + Top source files with line numbers
Output: Complete DeepWiki markdown page
</stage_info>

<repository_info>
- Name: ${repoName}
- Description: ${description || 'N/A'}
- Language: ${language || 'N/A'}
- Topics: ${topics.join(', ') || 'N/A'}
- Indexed commit: ${commitSha}
- Source files analyzed: ${files.length}
- GitHub base URL: ${githubBase}
</repository_info>

<stage2_architecture_report>
${architectureReport}
</stage2_architecture_report>

<source_data>
File contents include LINE NUMBERS (format "LINE_NUMBER:content"). Use these to reference exact source locations in the format \`[path/file.ts#L10-L30](${githubBase}/path/file.ts#L10-L30)\`.

<file_structure>
${structure}
</file_structure>

<file_contents>
${numberedFiles.map((f) => `<file path="${f.path}">\n${f.content}\n</file>`).join('\n\n')}
</file_contents>
</source_data>

<output_structure>
Generate a multi-section DeepWiki-style documentation page with ALL of the following sections. Use the Stage 2 architecture report as your primary source of truth, and the source files for precise line-numbered references. Be exhaustive, technically detailed, and precise.

### Relevant Source Files
A comprehensive table with columns: File | Purpose | Key Elements | Dependencies.
List ALL significant source files. After each file path, add a clickable Markdown link to the GitHub location with line range.
Every important file must be listed here.

### Overview
- What the project does and who it is for
- Key features and capabilities (list with detail)
- Problems it solves and use cases
- Technology stack (languages, frameworks, runtime)
- Reference source files throughout

### Project Type
State the classification (Software Project / Curated Collection / Documentation Book).

### Quick Start
Installation, prerequisites, and basic usage. Show commands, API keys needed, environment setup.
**Only include commands that appear verbatim in the source files.**

### Architecture
FOR SOFTWARE PROJECTS ONLY — generate this section with:
1. A Mermaid diagram (\`\`\`mermaid ... \`\`\`) showing component/module relationships, data flow, and external dependencies
2. Detailed explanation of each architectural layer/module with file and line range references
3. Request/response lifecycle or data flow walkthrough
4. Design patterns used and why
5. After the section, a "Sources:" bullet list of every file referenced

FOR CURATED LISTS / BOOKS — skip Architecture, instead generate:
### Content Organization
- How the content is structured (categories, chapters, sections)
- Navigation patterns
- Contribution guidelines for adding content

### Project Structure
A detailed table with columns: Directory | Purpose | Key Files | Notable Subdirectories.
Every major directory should be documented.

### Core Components
FOR SOFTWARE PROJECTS — exhaustive documentation of every major component:
#### [Component Name]
- **File:** \`path/file.ts#L10-L50\` (Markdown link to GitHub)
- **Purpose:** What this component does
- **Public API:** Every exported function/class/constant with signature, line range, and explanation
- **Key Methods:** Table with columns: Method | Signature | Description | Line Range | Source
- **Internal Logic:** How it works internally, algorithms, state management
- **Error Handling:** What errors can occur and how they're handled
- **Dependencies:** Internal and external dependencies
- **Sources:** List of files this component touches with line ranges

FOR CURATED LISTS — replace with:
### Content Categories
Detailed breakdown of each category/section in the list with what it contains.

FOR BOOKS — replace with:
### Chapter Overview
Each chapter's content, length, and key topics covered.

### Key Data Structures
FOR SOFTWARE PROJECTS — for each important type/interface/class/struct:
#### [Structure Name]
- **File:** \`path/file.ts#L10-L50\`
- **Definition:** Full type/interface/class definition with line range
- **Fields:** Table with columns: Field | Type | Description | Default | Source
- **Methods:** Table with columns: Method | Signature | Description | Line Range
- **Usage:** Which components create, consume, or extend this structure
- **Relationships:** Inheritance, composition, or association with other structures

### Configuration & Environment
- Configuration files and their formats
- Environment variables: table with columns: Variable | Required | Default | Description | Source
- Build / CI configuration
- Feature flags or runtime configuration

### API Reference
If the project exposes an API (REST, GraphQL, library API, CLI commands):
- Endpoints / functions with signatures, parameters, return values
- Authentication and authorization
- Request/response examples
- Error codes

### Testing
- Testing framework and tools used
- Test directory structure
- How to run tests (only commands from source files)
- Test coverage approach
- CI pipeline testing steps

### Dependencies
- Runtime dependencies with purpose
- Development dependencies with purpose
- Version constraints

### Contributing
How to contribute — only what is documented in actual source files (CONTRIBUTING.md, pull request templates, etc.)

### Last Indexed
- **Commit:** \`${commitSha}\`
- **Branch:** \`${defaultBranch}\`
- **Source files analyzed:** ${files.length}
- **Indexed at:** ${new Date().toISOString()}
- **Repository:** [${owner}/${repo}](${githubBase.replace('/blob/' + commitSha, '')})
</output_structure>

<formatting_rules>
- Output valid GitHub-flavored Markdown
- EVERY source file reference MUST include exact line ranges (e.g., \`path/file.ts#L10-L50\`)
- Use full Markdown link syntax: \`[path/file.ts#L10-L50](${githubBase}/path/file.ts#L10-L50)\`
- Use Mermaid diagrams (\`\`\`mermaid ... \`\`\`) for software projects with real architecture
- Use tables for all structured data with blank line before and after each table
- Use \`\`\`language code blocks for code examples with the correct language identifier
- After each major section, add a "Sources:" line listing every file referenced in that section with line ranges
- Be technically exhaustive — cover every function, type, and component in the relevant sections
- Avoid inline HTML and unnecessary emojis
- **CRITICAL: Never invent terminal commands.** Only show a command if it appears VERBATIM in a source file.
- **CRITICAL: Never invent software architecture.** If no source code exists, classify as curated list or book.
- **CRITICAL: Never describe markdown templates as components, engines, pipelines, or frameworks.**
- **CRITICAL: Use the Stage 2 architecture report as the authoritative reference for architecture and dependencies.**
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

    const selectedFiles = prioritizeFiles(files)
    await log(`[${runId}] Selected ${selectedFiles.length} most relevant files for context (from ${files.length} total)`)

    await log(`[${runId}] Fetching latest commit SHA...`)

    const commitSha = await getLatestCommitSha(owner, name, repo.default_branch, agent.github_token || undefined) || 'HEAD'

    await log(`[${runId}] Generating documentation via 3-stage Gemini pipeline...`)

    // Set status to running before Gemini (longest operation, may timeout)
    await supabase.from('agent_configs').update({ status: 'running', updated_at: new Date().toISOString() }).eq('id', agent_id)

    // Stage 1: Per-file code analysis (one call per chunk, each has own 150s + 250K tokens)
    const chunks = chunkFiles(selectedFiles)
    const analyses: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      await log(`[${runId}] Stage 1/${chunks.length + 2}: Analyzing batch ${i + 1} of ${chunks.length} (${chunks[i].length} files)...`)
      const analysisPrompt = buildAnalysisPrompt(chunks[i], i + 1, chunks.length)
      const analysis = await generateGemini(analysisPrompt, agent.gemini_api_key!, log)
      if (analysis) analyses.push(analysis)
      else await log(`[${runId}] Stage 1 batch ${i + 1} returned empty analysis`, 'warn')
    }

    // Stage 2: Architecture synthesis from all Stage 1 analyses
    await log(`[${runId}] Stage 2/${chunks.length + 2}: Synthesizing architecture from ${analyses.length} analyses...`)
    const archPrompt = buildArchitecturePrompt(
      repo.full_name, repo.description, repo.language, repo.topics,
      owner, name, commitSha, structure, analyses
    )
    const architectureReport = await generateGemini(archPrompt, agent.gemini_api_key!, log) || ''

    if (!architectureReport) {
      await log(`[${runId}] Stage 2 returned empty architecture report, proceeding without it`, 'warn')
    }

    // Stage 3: Final wiki generation from architecture report + top files for line-numbered refs
    const topFiles = selectedFiles.slice(0, MAX_INPUT_FILES)
    await log(`[${runId}] Stage 3/${chunks.length + 2}: Generating final documentation...`)
    const finalPrompt = buildFinalPrompt(
      repo.full_name, repo.description, repo.language, repo.topics,
      owner, name, commitSha, repo.default_branch, structure, topFiles, architectureReport
    )
    const documentation = await generateGemini(finalPrompt, agent.gemini_api_key!, log)

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
