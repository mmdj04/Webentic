import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { searchRepos, getAllSourceFiles } from '@/lib/github'
import { generateGemini } from '@/lib/gemini'

const MAX_REPOS = 3

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

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accessToken = authHeader.slice(7)
  const body = await request.json()
  const { agent_id } = body

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id is required' }, { status: 400 })
  }

  const supabase = createServerClient(accessToken)

  const { data: agent, error: agentError } = await supabase
    .from('agent_configs')
    .select('*')
    .eq('id', agent_id)
    .single()

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const log = async (message: string, level: string = 'info') => {
    await supabase.from('agent_logs').insert({
      agent_id,
      message,
      level,
    })
  }

  const runId = Date.now().toString(36)

  try {
    await log(`[${runId}] Starting agent: ${agent.name}`)
    await log(`[${runId}] Searching GitHub for repositories with 1k+ stars...`)

    const repos = await searchRepos('stars:>1000', agent.github_token || undefined)

    if (repos.length === 0) {
      await log(`[${runId}] No repositories found matching the criteria`, 'warn')
      await supabase
        .from('agent_configs')
        .update({ status: 'error', updated_at: new Date().toISOString() })
        .eq('id', agent_id)
      await log(`[${runId}] Agent stopped — no repos found`, 'error')
      return NextResponse.json({ message: 'No repos found' })
    }

    await log(`[${runId}] Found ${repos.length} repositories. Processing top ${Math.min(MAX_REPOS, repos.length)}...`)

    const topRepos = repos.slice(0, MAX_REPOS)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < topRepos.length; i++) {
      const repo = topRepos[i]
      const repoFullName = repo.full_name
      const [owner, name] = repoFullName.split('/')

      await log(`[${runId}] (${i + 1}/${topRepos.length}) Analyzing ${repoFullName}...`)

      try {
        const { data: existing } = await supabase
          .from('repository_analyses')
          .select('id')
          .eq('repo_owner', owner)
          .eq('repo_name', name)
          .maybeSingle()

        const analysisId = existing?.id || crypto.randomUUID()

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
          status: 'analyzing',
        })

        await log(`[${runId}] Fetching source files from ${repoFullName}...`)

        const { files, structure } = await getAllSourceFiles(
          owner,
          name,
          repo.default_branch,
          agent.github_token || undefined
        )

        await log(`[${runId}] Retrieved ${files.length} source files from ${repoFullName}`)

        if (files.length === 0) {
          await log(`[${runId}] No source files found in ${repoFullName}`, 'warn')
          await supabase
            .from('repository_analyses')
            .update({ status: 'failed', error_message: 'No source files found' })
            .eq('id', analysisId)
          failCount++
          continue
        }

        const prompt = buildPrompt(
          repoFullName,
          repo.description,
          repo.language,
          repo.topics,
          structure,
          files
        )

        await log(`[${runId}] Generating documentation via Gemini for ${repoFullName}...`)

        const documentation = await generateGemini(prompt, agent.gemini_api_key || undefined)

        if (!documentation) {
          throw new Error('Gemini returned empty documentation')
        }

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

        await log(`[${runId}] ✅ Documentation generated for ${repoFullName}`)
        successCount++
      } catch (err: any) {
        const errMsg = err?.message || String(err)
        await log(`[${runId}] ❌ Error processing ${repoFullName}: ${errMsg}`, 'error')

        await supabase
          .from('repository_analyses')
          .upsert({
            user_id: agent.user_id,
            repo_owner: owner!,
            repo_name: name!,
            repo_url: repo.html_url,
            status: 'failed',
            error_message: errMsg,
          })
        failCount++
      }
    }

    const totalMsg = `[${runId}] Agent run complete: ${successCount} succeeded, ${failCount} failed`
    if (failCount > 0) {
      await log(totalMsg, 'warn')
    } else {
      await log(totalMsg, 'info')
    }

    await supabase
      .from('agent_configs')
      .update({ status: 'stopped', updated_at: new Date().toISOString() })
      .eq('id', agent_id)

    await log(`[${runId}] Agent stopped`)

    return NextResponse.json({
      message: 'Agent run complete',
      successCount,
      failCount,
    })
  } catch (err: any) {
    const errMsg = err?.message || String(err)
    await log(`[${runId}] Fatal error: ${errMsg}`, 'error')

    await supabase
      .from('agent_configs')
      .update({ status: 'error', updated_at: new Date().toISOString() })
      .eq('id', agent_id)

    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
