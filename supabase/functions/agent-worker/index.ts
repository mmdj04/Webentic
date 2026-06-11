import { createClient } from 'npm:@supabase/supabase-js@2'

const GITHUB_API = 'https://api.github.com'
const MODEL = 'gemma-4-31b-it'
const MAX_FILE_SIZE = 100_000
const PER_PAGE = 100
const CHUNK_SIZE = 25
const MAX_SCORED_FILES = 150
const MAX_RETRIES = 3

const OUTPUT_TOKENS = {
  stage1: 8_192,
  stage2: 16_384,
  stage3: 24_576,
  stage4: 32_768,
  stage5: 32_768,
} as const

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
  return scored.slice(0, MAX_SCORED_FILES).map(({ score: _, ...f }) => f)
}

function buildSingleFilePrompt(
  file: { path: string; content: string },
  fileIndex: number,
  totalFiles: number,
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[]
): string {
  const lines = file.content.split('\n')
  const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')

  return `<role>
You are an expert Code Analyst — Stage 1 of 5 in our documentation pipeline.
Analyze this single source file and produce a detailed file-level breakdown.
</role>

<stage_info>
Stage 1/5 — File Analysis (file ${fileIndex} of ${totalFiles})
</stage_info>

<repository_context>
- Repository: ${repoName}
- Description: ${description || 'N/A'}
- Language: ${language || 'N/A'}
- Topics: ${topics.join(', ') || 'N/A'}
</repository_context>

<current_file>
Path: ${file.path}
Lines: ${lines.length}
</current_file>

<file_content>
${numbered.slice(0, 15000)}
</file_content>

<instructions>
Analyze this file comprehensively. Produce:

## Purpose
What does this file do? Its role in the project.

## Exports (Public API)
Every exported symbol: signature, line range, purpose.

## Internal Functions & Helpers
Non-exported functions with line ranges and purpose.

## Types & Interfaces
Types/interfaces/enums with fields and descriptions.

## Dependencies
**Internal**: imports from other project files
**External**: third-party packages used

## Constants & Configuration
Important constants, env vars, config keys.

## Architecture Notes
Design patterns, state management, data flow.

---
Be exhaustive. This analysis feeds into Stage 2 (Module Synthesis).
- CRITICAL: Never use emojis, emoticons, or decorative characters.
</instructions>`
}



function buildModulePrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  owner: string,
  repo: string,
  commitSha: string,
  structure: string,
  analyses: string[],
  batchIndex: number,
  totalBatches: number
): string {
  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert Module Architect — Stage 2 of 5 in our documentation pipeline.
Take detailed file-level analyses (Stage 1) and synthesize them into a coherent MODULE-LEVEL report.
A module is a group of related files that implement a specific subsystem or feature.
</role>

<stage_info>
Stage 2/5 — Module Synthesis (batch ${batchIndex} of ${totalBatches})
Input: ${analyses.length} file analysis groups from Stage 1
Output: Coherent module report
Feeds into: Stage 3 (Architecture) + Stage 4 (Deep-Dives) + Stage 5 (Final Wiki)
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
${structure.length > 8000 ? structure.slice(0, 8000) + '\n... (truncated)' : structure}
</file_structure>

<stage1_analyses>
${analyses.map((a, i) => `<analysis_group_${i + 1}>\n${a}\n</analysis_group_${i + 1}>`).join('\n\n')}
</stage1_analyses>

<instructions>
Produce a structured MODULE REPORT. Group files by logical module (e.g., core, UI, API, data layer, utils).
Identify which files belong to which module from the analyses. For each module found:

## Module: [Module Name]

### Overview
What this module does, where it fits in the project.

### Files
Table with columns: File | Role | Key Exports | Dependencies
List every significant file in this module.

### Key Components
Every class, function, type that forms the public API of this module.
For each: signature, line range, purpose, error handling.

### Internal Architecture
How components within this module interact. Data flow, state, events.

### Dependencies
- **Internal**: which other modules this module depends on
- **External**: third-party packages used

### Design Patterns
Patterns used within this module (Singleton, Factory, Observer, etc.)

### Notable Implementation Details
Edge cases, performance considerations, threading, async patterns.

---
Be exhaustive. Resolve any cross-file relationships. Produce a report that Stage 3 can use for architecture synthesis.
- **CRITICAL: Never use emojis, emoticons, or decorative characters.**
</instructions>`
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
  moduleReports: string[]
): string {
  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert System Architecture Analyst — Stage 3 of 5 in our documentation pipeline.
Take MODULE REPORTS (Stage 2) and synthesize them into a comprehensive system architecture report.
Identify layers, dependency graphs, data flow, cross-cutting concerns, and design patterns ACROSS all modules.
</role>

<stage_info>
Stage 3/5 — Architecture & Cross-Cutting Analysis
Input: ${moduleReports.length} module reports from Stage 2
Output: Unified architecture report + cross-cutting concerns
Feeds into: Stage 4 (Deep-Dives) + Stage 5 (Final Wiki)
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
${structure.length > 15000 ? structure.slice(0, 15000) + '\n... (truncated)' : structure}
</file_structure>

<module_reports>
${moduleReports.map((r, i) => `<module_report_${i + 1}>\n${r}\n</module_report_${i + 1}>`).join('\n\n')}
</module_reports>

<instructions>
Produce a unified architecture report with these sections:

## 1. Project Classification
**Software Project** / **Curated Collection** / **Documentation Book**
Justify with evidence from module reports.

## 2. System Architecture Overview
High-level description of the system, all modules, how they compose together.
Include a Mermaid component diagram showing module relationships.

## 3. Architectural Layers
Every layer in the system. For each: purpose, which modules belong, communication with other layers.

## 4. Dependency Graph
For each module: internal dependencies (other modules), external dependencies (third-party).
Show the dependency direction and categorize (runtime / dev / optional).

## 5. Data Flow
End-to-end data flow: entry points → processing → storage → response.
State management approach. Event system. Async patterns.

## 6. Design Patterns
Every pattern found across the codebase. For each: pattern name, where used (which modules/files), why.

## 7. Cross-Cutting Concerns
Concerns that span multiple modules:
- **Configuration**: config files, env vars, feature flags, build vs runtime config
- **Error Handling**: global error handling strategy, error types, fallbacks
- **Logging / Telemetry**: logging framework, levels, monitoring
- **Security**: auth, permissions, input validation, secrets
- **Internationalization**: i18n approach, locale handling
- **Testing**: framework, test organization, CI pipeline, coverage approach
- **Performance**: caching, lazy loading, memoization, worker threads

## 8. API Surface
Public API of the project (if applicable): endpoints, function signatures, CLI commands.

## 9. Configuration Architecture
Config file formats, environment variables table, build configuration.

---
Resolve conflicts between module reports. Eliminate duplication. Produce ONE cohesive document.
- **CRITICAL: Never use emojis, emoticons, or decorative characters.**
</instructions>`
}

function buildComponentDeepDivePrompt(
  repoName: string,
  description: string | null,
  language: string | null,
  topics: string[],
  owner: string,
  repo: string,
  commitSha: string,
  structure: string,
  moduleReport: string,
  architectureReport: string,
  files: { path: string; content: string }[],
  moduleIndex: number,
  totalModules: number
): string {
  const numberedFiles = files.map(f => {
    const lines = f.content.split('\n')
    const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')
    return { path: f.path, content: numbered }
  })

  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert Technical Documentation Writer — Stage 4 of 5 in our documentation pipeline.
Take a MODULE REPORT (Stage 2) and the ARCHITECTURE REPORT (Stage 3), then produce a beautiful, detailed COMPONENT DEEP-DIVE.
This will be a major section in the final wiki page. Write with precision, depth, and source traceability.
</role>

<stage_info>
Stage 4/5 — Component Deep-Dive (module ${moduleIndex} of ${totalModules})
Input: Module report + Architecture report + Source files
Output: Ready-to-include component documentation section
Feeds into: Stage 5 (Final Wiki Assembly)
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
${structure.length > 12000 ? structure.slice(0, 12000) + '\n... (truncated)' : structure}
</file_structure>

<architecture_report>
${architectureReport.length > 12000 ? architectureReport.slice(0, 12000) + '\n... (truncated)' : architectureReport}
</architecture_report>

<module_report>
${moduleReport}
</module_report>

<source_files>
File contents include LINE NUMBERS (format "LINE_NUMBER:content"). Use these for precise source references.
${numberedFiles.map((f) => `<file path="${f.path}">\n${f.content.slice(0, 10000)}\n</file>`).join('\n\n')}
</source_files>

<output_structure>
Using the module report as your guide and the source files for precise references, generate:

## [Module Name]

### Overview
What this module does, its role in the overall architecture, key capabilities.

### Key Components Table
| Component | File | Line Range | Description |
|---|---|---|---|
| (every key class/function/type) | | | |

### API Reference
For every exported function, class, interface, type, constant:
- **Name**: \`symbolName\` (\`path/file.ts#L10-L50\`)
- **Signature**: exact signature with types
- **Purpose**: what it does, parameters, return value, side effects
- **Error Handling**: what errors can occur
- **Usage Example**: brief code snippet showing typical usage
- **Dependencies**: what it calls internally

### Architecture Diagram
\`\`\`mermaid
[... component-level diagram showing internal structure and relationships]
\`\`\`

### Internal Architecture
How components within this module interact: data flow, event flow, state management, lifecycle.

### Data Flow
Walk through the main data path through this module. Entry point → processing → output.

### Error Handling & Edge Cases
Specific error conditions handled in this module, defensive coding patterns.

### Configuration
Configuration options specific to this module.

### Dependencies
- **Internal module dependencies**: which other modules this relies on
- **External packages**: third-party deps

### Source File Map
Table of every significant file in this module: File | Role | Key Lines

---
Use the source files for every line reference. Use Markdown link syntax: \`[path/file.ts#L10-L50](${githubBase}/path/file.ts#L10-L50)\`.
- **CRITICAL: Never use emojis, emoticons, or decorative characters.**
</output_structure>`
}

function buildAssemblyPrompt(
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
  architectureReport: string,
  componentDocs: string[]
): string {
  const numberedFiles = files.map(f => {
    const lines = f.content.split('\n')
    const numbered = lines.map((line, i) => `${i + 1}:${line}`).join('\n')
    return { path: f.path, content: numbered }
  })

  const githubBase = `https://github.com/${owner}/${repo}/blob/${commitSha}`

  return `<role>
You are an expert Senior Technical Documentation Writer — Stage 5 of 5 in our documentation pipeline.
This is the FINAL stage. Your job is to take the ARCHITECTURE REPORT (Stage 3) and all COMPONENT DEEP-DIVES (Stage 4),
then assemble a beautiful, comprehensive, DeepWiki-style documentation page.
You have the full 150s generation budget. Produce the highest quality wiki possible.
</role>

<stage_info>
Stage 5/5 — Final Wiki Assembly
Inputs: Architecture Report (Stage 3) + ${componentDocs.length} Component Deep-Dives (Stage 4) + Source files
Output: Complete DeepWiki markdown page with diagrams, tables, and line-numbered references
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

<architecture_report>
${architectureReport.length > 20000 ? architectureReport.slice(0, 20000) + '\n... (truncated)' : architectureReport}
</architecture_report>

<component_deep_dives>
${componentDocs.map((d, i) => `<component_deep_dive_${i + 1}>\n${d}\n</component_deep_dive_${i + 1}>`).join('\n\n')}
</component_deep_dives>

<source_data>
File contents include LINE NUMBERS. Use these for exact source references.
<file_structure>
${structure}
</file_structure>

<file_contents>
${numberedFiles.map((f) => `<file path="${f.path}">\n${f.content.slice(0, 12000)}\n</file>`).join('\n\n')}
</file_contents>
</source_data>

<output_structure>
Generate a COMPLETE multi-section DeepWiki documentation page. Combine the architecture report with component deep-dives into one cohesive document.

### Overview
- What the project does and who it is for
- Key features and capabilities (list with detail)
- Problems it solves and use cases
- Technology stack (languages, frameworks, runtime)
- Reference source files throughout

### Project Type
State the classification (Software Project / Curated Collection / Documentation Book).

### Quick Start
Installation, prerequisites, and basic usage.
**Only include commands that appear verbatim in source files.**

### Architecture
A Mermaid diagram (\`\`\`mermaid ... \`\`\`) showing component/module relationships, data flow, and external dependencies.
Detailed explanation of each architectural layer with file and line range references.
Request/response lifecycle or data flow walkthrough.
Design patterns used and why.
"Sources:" bullet list of every file referenced.

### Project Structure
Table with columns: Directory | Purpose | Key Files | Notable Subdirectories.

### Modules / Components
For each major module identified in the deep-dives, include its documentation section.
Integrate the component deep-dives from Stage 4 here, maintaining consistent formatting.

### Key Data Structures
For each important type/interface/class/struct:
- **Structure Name** — \`path/file.ts#L10-L50\`
- **Definition**: full type with line range
- **Fields**: table with columns: Field | Type | Description | Default
- **Methods**: table with columns: Method | Signature | Description | Line Range
- **Usage**: which components create, consume, or extend this structure
- **Relationships**: inheritance, composition, association

### Configuration & Environment
- Configuration files and formats
- Environment variables: table with columns: Variable | Required | Default | Description
- Build / CI configuration
- Feature flags

### API Reference
If the project exposes an API: endpoints/functions with signatures, parameters, return values.
Authentication, request/response examples, error codes.

### Testing
- Testing framework and tools
- Test directory structure
- How to run tests (only commands from source files)
- CI pipeline testing stages

### Dependencies
- Runtime dependencies with purpose
- Dev dependencies with purpose
- Version constraints

### Glossário
Key terms, acronyms, and their definitions used in the codebase.

### Last Indexed
- **Commit:** \`${commitSha}\`
- **Branch:** \`${defaultBranch}\`
- **Source files analyzed:** ${files.length}
- **Repository:** [${owner}/${repo}](${githubBase.replace('/blob/' + commitSha, '')})
</output_structure>

<formatting_rules>
- Output valid GitHub-flavored Markdown
- EVERY source file reference MUST include exact line ranges: \`[path/file.ts#L10-L50](${githubBase}/path/file.ts#L10-L50)\`
- Use Mermaid diagrams (\`\`\`mermaid ... \`\`\`) for architecture
- Use tables for structured data with blank line before and after each table
- Use \`\`\`language code blocks with correct language identifier
- After each major section, add "Sources:" listing every file referenced with line ranges
- Be technically exhaustive — cover every function, type, and component
- **CRITICAL: Never invent terminal commands.** Only show commands that appear VERBATIM in source files.
- **CRITICAL: Never invent software architecture.**
- **CRITICAL: Never use emojis, emoticons, or decorative characters.**
- **CRITICAL: Use the architecture report and deep-dives as authoritative references.**
</formatting_rules>`
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

async function generateContent(prompt: string, apiKey: string, log?: (msg: string, level?: string) => Promise<void>, maxTokens = 16_384): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          thinkingConfig: { thinkingLevel: 'HIGH' },
        },
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    const errText = await res.text()

    // Retry on quota errors (429) or service unavailability (503)
    if (res.status === 429 || res.status === 503) {
      let delayMs = res.status === 503 ? 20_000 : 60_000
      try {
        const errBody = JSON.parse(errText)
        const retryStr = errBody?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay
        if (retryStr) {
          const seconds = parseInt(retryStr) || (res.status === 503 ? 10 : 60)
          delayMs = seconds * 1000 + 2000
        }
      } catch { /* use default */ }

      if (attempt < MAX_RETRIES) {
        const label = res.status === 503 ? 'Service unavailable' : 'Quota exceeded'
        const msg = `[RETRY ${attempt}/${MAX_RETRIES}] ${label}, waiting ${Math.round(delayMs / 1000)}s...`
        if (log) await log(msg, 'warn')
        await new Promise(r => setTimeout(r, delayMs))
        continue
      }
    }

    throw new Error(`Model API error: ${res.status} ${errText}`)
  }

  throw new Error('Model API error: max retries exceeded')
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



const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function now(): string {
  return new Date().toISOString()
}

async function saveProcessingState(
  supabase: ReturnType<typeof createClient>,
  agentId: string,
  state: ProcessingState | null
): Promise<void> {
  await supabase
    .from('agent_configs')
    .update({ processing_state: state as any, updated_at: now() })
    .eq('id', agentId)
}

async function scheduleNextCall(agentId: string, delayMs = 1000) {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceKey) {
    console.error('[scheduleNextCall] SUPABASE_SERVICE_ROLE_KEY not set')
    return
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const url = `${supabaseUrl}/functions/v1/agent-worker`
  // Await the delay BEFORE returning, so the runtime keeps the event loop alive
  await new Promise(r => setTimeout(r, delayMs))
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ agent_id: agentId }),
    })
  } catch (err) {
    console.error('[scheduleNextCall]', err)
  }
}

async function scheduleAfterRun(supabase: ReturnType<typeof createClient>, agentId: string) {
  const { data: agent } = await supabase
    .from('agent_configs')
    .select('generation_frequency')
    .eq('id', agentId)
    .single()

  if (!agent || agent.generation_frequency === 'manual') return

  const intervalMap: Record<string, number> = {
    '1h': 3600_000,
    '3h': 10800_000,
    '6h': 21600_000,
    '12h': 43200_000,
    '24h': 86400_000,
  }
  const intervalMs = intervalMap[agent.generation_frequency]
  if (!intervalMs) return

  const nextRun = new Date(Date.now() + intervalMs).toISOString()
  await supabase
    .from('agent_configs')
    .update({
      processing_state: {
        phase: 'idle',
        next_run: nextRun,
        processing_since: null,
      },
      updated_at: now(),
    })
    .eq('id', agentId)

  await scheduleNextCall(agentId, intervalMs)
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
  const ps = agent.processing_state as ProcessingState | null

  try {
    if (!ps || ps.phase === 'idle') {
      if (agent.status !== 'running') {
        return new Response(JSON.stringify({ message: 'Agent is not running' }), { headers: corsHeaders })
      }
      if (ps?.phase === 'idle') {
        if (ps.next_run && new Date(ps.next_run).getTime() > Date.now()) {
          const waitMs = new Date(ps.next_run).getTime() - Date.now()
          await scheduleNextCall(agent_id, Math.min(waitMs, 3600_000))
          return new Response(JSON.stringify({ message: 'Scheduled run not yet due' }), { headers: corsHeaders })
        }
        await log(`[${runId}] Scheduled run starting for: ${agent.name}`)
      }
      await log(`[${runId}] Agent started: ${agent.name}`)
      await log(`[${runId}] Searching for undocumented repos with 1k+ stars...`)

      const repo = await findUndocumentedRepo(supabase, agent.github_token || undefined)

      if (!repo) {
        await log(`[${runId}] All repositories have already been documented`, 'warn')
        await supabase.from('agent_configs').update({ status: 'stopped', updated_at: now() }).eq('id', agent_id)
        return new Response(JSON.stringify({ message: 'No undocumented repos found' }), { headers: corsHeaders })
      }

      const [owner, name] = repo.full_name.split('/')

      await log(`[${runId}] Selected: ${repo.full_name} ⭐ ${repo.stargazers_count}`)
      await log(`[${runId}] Fetching source files...`)

      const { files, structure } = await getSourceFiles(owner, name, repo.default_branch, agent.github_token || undefined, 60_000)

      await log(`[${runId}] Retrieved ${files.length} source files`)

      if (files.length === 0) {
        await log(`[${runId}] No source files found`, 'error')
        await supabase.from('agent_configs').update({ status: 'error', updated_at: now() }).eq('id', agent_id)
        return new Response(JSON.stringify({ message: 'No source files found' }), { headers: corsHeaders })
      }

      const selectedFiles = prioritizeFiles(files)
      await log(`[${runId}] Selected ${selectedFiles.length} files for context (from ${files.length} total)`)

      await log(`[${runId}] Fetching latest commit SHA...`)
      const commitSha = await getLatestCommitSha(owner, name, repo.default_branch, agent.github_token || undefined) || 'HEAD'

      // Save state and return — next invocation processes stage1 (one file at a time)
      await supabase.from('agent_configs').update({
        status: 'running',
        updated_at: now(),
        processing_state: {
          phase: 'stage1',
          processing_since: null,
          repo,
          owner,
          name,
          commitSha,
          structure,
          files: selectedFiles,
          current_chunk: 0,
          total_chunks: selectedFiles.length,
          file_analyses: [],
          module_reports: [],
          architecture_report: '',
          component_docs: [],
        } as ProcessingState,
      }).eq('id', agent_id)

      await log(`[${runId}] Files fetched. ${selectedFiles.length} files to process.`)
      await scheduleNextCall(agent_id, 1000)
      return new Response(JSON.stringify({ message: 'Files fetched, ready for stage 1' }), { headers: corsHeaders })
    }

    // ── PROCESS NEXT UNIT ─────────────────────────────────
    const TIMEOUT_MS = 145_000

    // Check if another invocation is already processing
    if (ps.processing_since) {
      const lockTime = new Date(ps.processing_since).getTime()
      const elapsed = Date.now() - lockTime
      if (elapsed < TIMEOUT_MS) {
        return new Response(JSON.stringify({ message: 'Already processing' }), { headers: corsHeaders })
      }
      await log(`[${runId}] Reclaiming stale processing (${Math.round(elapsed / 1000)}s old)`, 'warn')
    }

    // Mark as processing
    ps.processing_since = now()
    await supabase.from('agent_configs').update({
      processing_state: ps as any,
      updated_at: now(),
    }).eq('id', agent_id)

    const apiKey = agent.gemini_api_key!
    const repo = ps.repo

    if (ps.phase === 'stage1') {
      // ── STAGE 1: Per-File Analysis (one file per RPD) ─────
      const i = ps.current_chunk
      const file = ps.files[i]
      await log(`[${runId}] Analyzing file ${i + 1}/${ps.total_chunks}: ${file.path}`)

      const analysis = await generateContent(
        buildSingleFilePrompt(file, i + 1, ps.total_chunks, repo.full_name, repo.description, repo.language, repo.topics),
        apiKey, log, OUTPUT_TOKENS.stage1
      )

      if (analysis) ps.file_analyses.push(analysis)
      else await log(`[${runId}] File ${i + 1} returned empty analysis`, 'warn')

      ps.current_chunk = i + 1
      ps.processing_since = null

      if (ps.current_chunk >= ps.total_chunks) {
        ps.phase = 'stage2'
        ps.current_chunk = 0
        ps.total_chunks = Math.ceil(ps.file_analyses.length / 2)
        ps.module_reports = []
        await log(`[${runId}] All ${ps.file_analyses.length} files analyzed. Stage 2: ${ps.total_chunks} module synthesis batches.`)
      } else {
        await log(`[${runId}] ${ps.current_chunk}/${ps.total_chunks} files analyzed.`)
      }

      await saveProcessingState(supabase, agent_id, ps)
      await scheduleNextCall(agent_id, 1500)
      return new Response(JSON.stringify({
        message: ps.phase === 'stage2' ? 'All files analyzed' : 'File analyzed',
        file: i + 1,
        total: ps.total_chunks,
      }), { headers: corsHeaders })
    }

    if (ps.phase === 'stage2') {
      // ── STAGE 2: Module Synthesis ───────────────────────
      const batchDone = ps.module_reports.length
      const isLastBatch = batchDone >= ps.total_chunks

      if (!isLastBatch) {
        const from = batchDone * 2
        const to = Math.min(from + 2, ps.file_analyses.length)
        await log(`[${runId}] Synthesizing module ${batchDone + 1}/${ps.total_chunks} (analyses ${from + 1}-${to})...`)

        const report = await generateContent(
          buildModulePrompt(
            repo.full_name, repo.description, repo.language, repo.topics,
            ps.owner, ps.name, ps.commitSha,
            ps.structure.length > 8000 ? ps.structure.slice(0, 8000) + '\n... (truncated)' : ps.structure,
            ps.file_analyses.slice(from, to),
            batchDone + 1, ps.total_chunks
          ),
          apiKey, log, OUTPUT_TOKENS.stage2
        ) || ''

        ps.module_reports.push(report)
        ps.current_chunk = batchDone + 1
        ps.processing_since = null

        await log(`[${runId}] Module ${batchDone + 1}/${ps.total_chunks} complete.`)

        await saveProcessingState(supabase, agent_id, ps)
        await scheduleNextCall(agent_id, 1500)
        return new Response(JSON.stringify({
          message: ps.current_chunk >= ps.total_chunks ? 'All modules synthesized' : 'Module done',
          batch: batchDone + 1,
          total: ps.total_chunks,
        }), { headers: corsHeaders })
      }

      // All module reports done → move to stage 3
      ps.phase = 'stage3'
      ps.current_chunk = 0
      ps.total_chunks = 1
      ps.processing_since = null
      await saveProcessingState(supabase, agent_id, ps)
      await log(`[${runId}] All ${ps.module_reports.length} modules synthesized. Moving to architecture synthesis.`)
      await scheduleNextCall(agent_id, 1500)
      return new Response(JSON.stringify({ message: 'Module synthesis complete, starting architecture' }), { headers: corsHeaders })
    }

    if (ps.phase === 'stage3') {
      // ── STAGE 3: Architecture & Cross-Cutting ────────────
      await log(`[${runId}] Building architecture from ${ps.module_reports.length} module reports...`)

      const archReport = await generateContent(
        buildArchitecturePrompt(
          repo.full_name, repo.description, repo.language, repo.topics,
          ps.owner, ps.name, ps.commitSha,
          ps.structure.length > 15000 ? ps.structure.slice(0, 15000) + '\n... (truncated)' : ps.structure,
          ps.module_reports
        ),
        apiKey, log, OUTPUT_TOKENS.stage3
      ) || ''

      ps.architecture_report = archReport
      ps.phase = 'stage4'
      ps.current_chunk = 0
      ps.total_chunks = ps.module_reports.length
      ps.component_docs = []
      ps.processing_since = null
      await saveProcessingState(supabase, agent_id, ps)

      if (!archReport) {
        await log(`[${runId}] Stage 3 returned empty architecture report`, 'warn')
      } else {
        await log(`[${runId}] Architecture complete. Starting ${ps.total_chunks} component deep-dives.`)
      }
      await scheduleNextCall(agent_id, 1500)
      return new Response(JSON.stringify({ message: 'Architecture complete' }), { headers: corsHeaders })
    }

    if (ps.phase === 'stage4') {
      // ── STAGE 4: Component Deep-Dives ──────────────────
      const i = ps.current_chunk
      const moduleReport = ps.module_reports[i]
      const topFiles = ps.files.slice(0, CHUNK_SIZE)
      await log(`[${runId}] Deep-dive module ${i + 1}/${ps.total_chunks}...`)

      const doc = await generateContent(
        buildComponentDeepDivePrompt(
          repo.full_name, repo.description, repo.language, repo.topics,
          ps.owner, ps.name, ps.commitSha,
          ps.structure.length > 12000 ? ps.structure.slice(0, 12000) + '\n... (truncated)' : ps.structure,
          moduleReport,
          ps.architecture_report,
          topFiles,
          i + 1, ps.total_chunks
        ),
        apiKey, log, OUTPUT_TOKENS.stage4
      ) || ''

      if (doc) ps.component_docs.push(doc)
      else await log(`[${runId}] Module ${i + 1} deep-dive returned empty`, 'warn')

      ps.current_chunk = i + 1
      ps.processing_since = null

      if (ps.current_chunk >= ps.total_chunks) {
        ps.phase = 'stage5'
        ps.current_chunk = 0
        ps.total_chunks = 1
        await log(`[${runId}] All ${ps.component_docs.length} deep-dives complete. Assembling final wiki.`)
      } else {
        await log(`[${runId}] Deep-dive ${i + 1}/${ps.total_chunks} done. ${ps.total_chunks - ps.current_chunk} remaining.`)
      }

      await saveProcessingState(supabase, agent_id, ps)
      await scheduleNextCall(agent_id, 1500)
      return new Response(JSON.stringify({
        message: ps.phase === 'stage5' ? 'All deep-dives complete' : 'Deep-dive done',
        module: i + 1,
        total: ps.total_chunks,
      }), { headers: corsHeaders })
    }

    if (ps.phase === 'stage5') {
      // ── STAGE 5: Final Wiki Assembly ────────────────────
      await log(`[${runId}] Assembling final wiki...`)

      const topFiles = ps.files.slice(0, CHUNK_SIZE)
      const documentation = await generateContent(
        buildAssemblyPrompt(
          repo.full_name, repo.description, repo.language, repo.topics,
          ps.owner, ps.name, ps.commitSha, repo.default_branch,
          ps.structure, topFiles,
          ps.architecture_report || '',
          ps.component_docs
        ),
        apiKey, log, OUTPUT_TOKENS.stage5
      )

      if (!documentation) {
        throw new Error('Model returned empty documentation')
      }

      await log(`[${runId}] Saving documentation to database...`)

      const { data: existingDoc } = await supabase
        .from('repository_analyses')
        .select('id')
        .eq('repo_owner', ps.owner)
        .eq('repo_name', ps.name)
        .single()

      const docPayload = {
        user_id: agent.user_id,
        repo_owner: ps.owner,
        repo_name: ps.name,
        repo_url: repo.html_url,
        analysis_data: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          description: repo.description,
          language: repo.language,
          topics: repo.topics,
          indexed_commit_sha: ps.commitSha,
          default_branch: repo.default_branch,
        },
        documentation,
        status: 'completed',
      }

      if (existingDoc) {
        await supabase.from('repository_analyses').update(docPayload).eq('id', existingDoc.id)
      } else {
        await supabase.from('repository_analyses').insert({ id: crypto.randomUUID(), ...docPayload })
      }

      await supabase.from('agent_configs').update({
        status: 'stopped',
        processing_state: null,
        updated_at: now(),
      }).eq('id', agent_id)

      await log(`[${runId}] Documentation published for ${ps.owner}/${ps.name}`)
      await log(`[${runId}] Agent run complete. Processing state cleared.`)

      await scheduleAfterRun(supabase, agent_id)
      return new Response(JSON.stringify({ message: 'Documentation complete', repo: repo.full_name }), { headers: corsHeaders })
    }

    throw new Error(`Unknown phase: ${ps.phase}`)
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await log(`[${runId}] Error: ${errMsg}`, 'error')

    // Clear processing_since so next invocation can retry, but keep accumulated state
    if (ps) {
      ps.processing_since = null
      await saveProcessingState(supabase, agent_id, ps)
      await scheduleNextCall(agent_id, 2500)
    } else {
      await supabase.from('agent_configs').update({ status: 'error', updated_at: now() }).eq('id', agent_id)
    }

    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: corsHeaders })
  }
})
