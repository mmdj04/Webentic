'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Key,
  Github,
  Zap,
  Clock,
  List,
  LogOut,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  Play,
  Square,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface AgentConfig {
  id: string
  user_id: string
  name: string
  api_used: string
  model_type: string
  status: string
  gemini_api_key: string | null
  github_token: string | null
  generation_frequency: string
  created_at: string
  updated_at: string
}

interface AgentLog {
  id: number
  agent_id: string
  message: string
  level: string
  created_at: string
}

type GenericAuthSession = {
  user: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, unknown> } | null
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  token_type?: string
}

const FREQUENCIES = [
  { value: 'manual', label: 'Manual' },
  { value: '1h', label: 'Every 1 hour' },
  { value: '3h', label: 'Every 3 hours' },
  { value: '6h', label: 'Every 6 hours' },
  { value: '12h', label: 'Every 12 hours' },
  { value: '24h', label: 'Every 24 hours' },
] as const

function SettingsContent() {
  const supabase: any = createClient()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Auth form
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Agent form
  const [agentName, setAgentName] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [frequency, setFrequency] = useState<string>('manual')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showGithubToken, setShowGithubToken] = useState(false)
  const [agentSaving, setAgentSaving] = useState(false)

  // Agent list
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)

  // Logs
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [logsLoading, setLogsLoading] = useState(false)

  // Profile
  const [profileEmail, setProfileEmail] = useState('')
  const [profileName, setProfileName] = useState('')

  const fetchAgents = useCallback(async () => {
    if (!session?.user?.id) return
    setAgentsLoading(true)
    const { data } = await supabase
      .from('agent_configs')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAgents(data)
    setAgentsLoading(false)
  }, [session, supabase])

  const fetchLogs = useCallback(async (agentId: string) => {
    setLogsLoading(true)
    const { data } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setLogs(data)
    setLogsLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then((res: any) => {
      const s: GenericAuthSession | null = res.data?.session ?? null
      setSession(s)
      setProfileEmail(s?.user?.email ?? '')
      setProfileName((s?.user?.user_metadata as Record<string, unknown>)?.full_name as string ?? '')
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session as GenericAuthSession | null)
      setProfileEmail(session?.user?.email ?? '')
      setProfileName((session?.user?.user_metadata as Record<string, unknown>)?.full_name as string ?? '')
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (session?.user?.id) fetchAgents()
  }, [session, fetchAgents])

  // Real-time logs subscription
  useEffect(() => {
    if (!selectedAgentId) return

    const channel = supabase
      .channel('agent-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `agent_id=eq.${selectedAgentId}`,
        },
        (payload: any) => {
          setLogs((prev: AgentLog[]) => [payload.new as AgentLog, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedAgentId, supabase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
      }
    } catch (err: any) {
      console.error('[AUTH ERROR]', err)
      setAuthError(err?.message || String(err))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setAgents([])
    setLogs([])
  }

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName.trim()) return
    setAgentSaving(true)

    try {
      const { data: existing } = await supabase
        .from('agent_configs')
        .select('id')
        .eq('user_id', session!.user.id)

      if (existing && existing.length >= 5) {
        setAuthError('Maximum of 5 agents allowed')
        setAgentSaving(false)
        return
      }

      const { error } = await supabase.from('agent_configs').insert({
        user_id: session!.user.id,
        name: agentName.trim(),
        api_used: 'Gemini + GitHub',
        model_type: 'gemini-3.5-flash',
        status: 'stopped',
        gemini_api_key: geminiKey || null,
        github_token: githubToken || null,
        generation_frequency: frequency as AgentConfig['generation_frequency'],
      })

      if (error) throw error

      setAgentName('')
      setGeminiKey('')
      setGithubToken('')
      setFrequency('manual')
      fetchAgents()
    } catch (err: any) {
      setAuthError(`[SAVE AGENT] ${err?.message || err}`)
    } finally {
      setAgentSaving(false)
    }
  }

  const handleToggleAgent = async (agent: AgentConfig) => {
    const newStatus = agent.status === 'running' ? 'stopped' : 'running'
    await supabase
      .from('agent_configs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', agent.id)

    await supabase.from('agent_logs').insert({
      agent_id: agent.id,
      message: `Agent ${newStatus === 'running' ? 'started' : 'stopped'} manually`,
      level: 'info',
    })

    fetchAgents()
    if (selectedAgentId === agent.id) fetchLogs(agent.id)
  }

  const handleDeleteAgent = async (agent: AgentConfig) => {
    await supabase.from('agent_configs').delete().eq('id', agent.id)
    if (selectedAgentId === agent.id) {
      setSelectedAgentId(null)
      setLogs([])
    }
    fetchAgents()
  }

  const handleViewLogs = (agentId: string) => {
    setSelectedAgentId(agentId)
    fetchLogs(agentId)
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileName },
      })
      if (error) throw error
    } catch (err: any) {
      setAuthError(`[PROFILE] ${err?.message || err}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-foreground-muted" />
      </div>
    )
  }

  const isLoggedIn = !!session

  return (
    <div className="min-h-dvh bg-background">
      <header style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="mx-auto flex items-center gap-4 px-6 py-4" style={{ maxWidth: 780 }}>
          <Link href="/" className="flex items-center gap-2 no-underline text-sm shrink-0" style={{ color: 'var(--foreground-light)' }}>
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground-default)' }}>
              Settings
            </span>
            {isLoggedIn && (
              <Button size="tiny" type="default" icon={<LogOut className="size-3" />} onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto px-6 py-8 space-y-8" style={{ maxWidth: 780 }}>
        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
          </div>
        )}

        {!isLoggedIn && (
          <Card className="p-6 border border-amber-400 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground-default)' }}>
                  Sign in to manage settings
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                  {isSignUp
                    ? 'Create an account to configure AI agents and manage your profile.'
                    : 'Sign in to configure AI agents, manage your profile, and view real-time logs.'}
                </p>
                <form onSubmit={handleAuth} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-lighter hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <Button type="primary" htmlType="submit" loading={authLoading} disabled={authLoading}>
                    {authLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setAuthError(null) }}
                    className="text-xs text-foreground-lighter hover:text-foreground transition-colors"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Account Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="size-5 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">Account</h2>
          </div>
          {!isLoggedIn ? (
            <div className="py-6 text-center">
              <p className="text-sm text-foreground-muted">Sign in above to manage your account settings.</p>
            </div>
          ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <Mail className="size-3 mr-1" />
                Email
              </label>
              <Input value={profileEmail} disabled className="opacity-60" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <User className="size-3 mr-1" />
                Display Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your display name"
                  className="flex-1"
                />
                <Button
                  type="primary"
                  size="tiny"
                  icon={<Save className="size-3" />}
                  loading={saving}
                  onClick={handleUpdateProfile}
                >
                  Save
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <Calendar className="size-3 mr-1" />
                Member since
              </label>
              <p className="text-sm text-foreground-muted">
                {session.user.created_at
                  ? format(new Date(session.user.created_at), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
          )}
        </Card>

        {/* AI Agent Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="size-5 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">AI Agent Configuration</h2>
            <Badge color="amber">gemini-3.5-flash</Badge>
          </div>

          {!isLoggedIn ? (
            <div className="py-6 text-center">
              <p className="text-sm text-foreground-muted">Sign in above to configure AI agents.</p>
            </div>
          ) : (
          <>
          {agents.length >= 5 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Maximum of 5 agents reached. Delete an existing agent to add a new one.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveAgent} className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                Agent Name
              </label>
              <Input
                placeholder="My Documentation Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
                disabled={agents.length >= 5}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <Key className="size-3 mr-1" />
                Gemini API Key
              </label>
              <p className="text-xs text-foreground-muted mb-2">
                Get your key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  aistudio.google.com
                </a>
              </p>
              <div className="relative">
                <Input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  disabled={agents.length >= 5}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-lighter hover:text-foreground"
                >
                  {showGeminiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <Github className="size-3 mr-1" />
                GitHub Token
              </label>
              <p className="text-xs text-foreground-muted mb-2">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  github.com/settings/tokens
                </a>
                {' '}(repo scope recommended)
              </p>
              <div className="relative">
                <Input
                  type={showGithubToken ? 'text' : 'password'}
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  disabled={agents.length >= 5}
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-lighter hover:text-foreground"
                >
                  {showGithubToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-foreground-light">
                <Clock className="size-3 mr-1" />
                Generation Frequency
              </label>
              <Select value={frequency} onValueChange={setFrequency} disabled={agents.length >= 5}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="primary"
              htmlType="submit"
              icon={<Plus className="size-4" />}
              loading={agentSaving}
              disabled={!agentName.trim() || agents.length >= 5}
            >
              Create Agent
            </Button>
          </form>
          </>
          )}
        </Card>

        {/* Agent List */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <List className="size-5 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">Agents</h2>
            <Badge color="scale">
              {agents.length}/5
            </Badge>
          </div>

          {!isLoggedIn ? (
            <div className="py-6 text-center">
              <p className="text-sm text-foreground-muted">Sign in above to view and manage your agents.</p>
            </div>
          ) : (
          <>
          {agentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-foreground-muted" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-foreground-muted">No agents configured yet</p>
              <p className="text-xs text-foreground-lighter mt-1">
                Create an agent above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="border rounded-lg p-4 bg-surface-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        Created {format(new Date(agent.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        color={
                          agent.status === 'running'
                            ? 'green'
                            : agent.status === 'error'
                              ? 'red'
                              : 'scale'
                        }
                      >
                        {agent.status === 'running' ? (
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                            Running
                          </span>
                        ) : agent.status === 'error' ? (
                          'Error'
                        ) : (
                          'Stopped'
                        )}
                      </Badge>
                      <Button
                        size="tiny"
                        type={agent.status === 'running' ? 'danger' : 'default'}
                        icon={
                          agent.status === 'running' ? (
                            <Square className="size-3" />
                          ) : (
                            <Play className="size-3" />
                          )
                        }
                        onClick={() => handleToggleAgent(agent)}
                      />
                      <Button
                        size="tiny"
                        type="default"
                        icon={<Trash2 className="size-3" />}
                        onClick={() => handleDeleteAgent(agent)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-foreground-lighter">API</span>
                      <p className="text-foreground-light mt-0.5">{agent.api_used}</p>
                    </div>
                    <div>
                      <span className="text-foreground-lighter">Model</span>
                      <p className="text-foreground-light mt-0.5">{agent.model_type}</p>
                    </div>
                    <div>
                      <span className="text-foreground-lighter">Frequency</span>
                      <p className="text-foreground-light mt-0.5 capitalize">
                        {FREQUENCIES.find((f) => f.value === agent.generation_frequency)?.label ??
                          agent.generation_frequency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button
                      size="tiny"
                      type="default"
                      icon={<RefreshCw className="size-3" />}
                      onClick={() => handleViewLogs(agent.id)}
                    >
                      {selectedAgentId === agent.id ? 'Refresh Logs' : 'View Logs'}
                    </Button>
                  </div>

                  {/* Real-time logs for selected agent */}
                  {selectedAgentId === agent.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-foreground">Real-time Logs</h4>
                        <Badge color="scale" className="text-[10px]">
                          <span className="size-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse" />
                          Live
                        </Badge>
                      </div>
                      {logsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-foreground-muted" />
                        </div>
                      ) : logs.length === 0 ? (
                        <p className="text-xs text-foreground-muted text-center py-4">No logs yet</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {logs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start gap-2 py-1.5 px-2 rounded bg-muted/50 text-xs font-mono"
                            >
                              <span className="text-foreground-lighter shrink-0">
                                {format(new Date(log.created_at), 'HH:mm:ss')}
                              </span>
                              <span
                                className={`shrink-0 font-medium ${
                                  log.level === 'error'
                                    ? 'text-red-500'
                                    : log.level === 'warn'
                                      ? 'text-amber-500'
                                      : log.level === 'debug'
                                        ? 'text-foreground-lighter'
                                        : 'text-foreground-light'
                                }`}
                              >
                                [{log.level.toUpperCase()}]
                              </span>
                              <span className="text-foreground-light break-all">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </Card>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return <SettingsContent />
}
