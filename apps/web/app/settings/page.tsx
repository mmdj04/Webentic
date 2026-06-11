'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
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
  Loader2,
  Plus,
  Trash2,
  Play,
  Square,
  AlertCircle,
  RefreshCw,
  ClipboardCopy,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui'
import { FormItemLayout } from 'ui-patterns/form/FormItemLayout/FormItemLayout'
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from 'ui-patterns/PageHeader'
import {
  PageSection,
  PageSectionContent,
  PageSectionDescription,
  PageSectionMeta,
  PageSectionSummary,
  PageSectionTitle,
} from 'ui-patterns/PageSection'
import { PageContainer } from 'ui-patterns/PageContainer'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { AccountLayout } from './AccountLayout'
import { SignInForm } from './SignInForm'

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
  processing_state: Record<string, unknown> | null
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
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const [agentName, setAgentName] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [frequency, setFrequency] = useState<string>('manual')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showGithubToken, setShowGithubToken] = useState(false)
  const [agentSaving, setAgentSaving] = useState(false)

  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)

  const [logs, setLogs] = useState<AgentLog[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [logsLoading, setLogsLoading] = useState(false)

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

  const handleAuth = async (email: string, password: string) => {
    setAuthError(null)
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err: any) {
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
        api_used: 'Gemma 4 + GitHub',
        model_type: 'gemma-4-31b-it',
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

  const [pollingAgentId, setPollingAgentId] = useState<string | null>(null)

  useEffect(() => {
    if (!pollingAgentId) return
    const channel = supabase
      .channel(`agent-status-${pollingAgentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_configs',
          filter: `id=eq.${pollingAgentId}`,
        },
        (payload: any) => {
          const status = payload.new?.status
          if (status !== 'running') {
            supabase.removeChannel(channel)
            setPollingAgentId(null)
            fetchAgents()
            if (selectedAgentId === payload.new.id) fetchLogs(payload.new.id)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollingAgentId, supabase, selectedAgentId])

  const handleToggleAgent = async (agent: AgentConfig) => {
    const newStatus = agent.status === 'running' ? 'stopped' : 'running'
    if (newStatus === 'stopped') {
      await supabase
        .from('agent_configs')
        .update({ status: 'stopped', updated_at: new Date().toISOString() })
        .eq('id', agent.id)
      await supabase.from('agent_logs').insert({
        agent_id: agent.id,
        message: 'Agent stopped manually',
        level: 'info',
      })
      fetchAgents()
      if (selectedAgentId === agent.id) fetchLogs(agent.id)
      return
    }
    await supabase.from('agent_logs').delete().eq('agent_id', agent.id)
    await supabase
      .from('agent_configs')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', agent.id)
    fetchAgents()
    if (selectedAgentId === agent.id) fetchLogs(agent.id)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '')
    const functionUrl = `${baseUrl}/functions/v1/agent-worker`
    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agent_id: agent.id }),
    })
      .then(() => setPollingAgentId(agent.id))
      .catch(() => {})
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
      <PageHeader size="small">
        <PageHeaderMeta>
          <PageHeaderSummary>
            <PageHeaderTitle>Preferences</PageHeaderTitle>
            <PageHeaderDescription>
              Manage your account profile, AI agents, and dashboard experience.
            </PageHeaderDescription>
          </PageHeaderSummary>
        </PageHeaderMeta>
      </PageHeader>
      <PageContainer size="small">
        {authError && (
          <Card>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
            </div>
          </Card>
        )}

        {/* Sign In Section */}
        <PageSection>
          <PageSectionMeta>
            <PageSectionSummary>
              <PageSectionTitle>Authentication</PageSectionTitle>
              <PageSectionDescription>
                Sign in to manage your account, configure AI agents, and view real-time logs.
              </PageSectionDescription>
            </PageSectionSummary>
          </PageSectionMeta>
          <PageSectionContent>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="size-5 text-foreground shrink-0" />
                  <CardTitle>Authentication</CardTitle>
                </div>
              </CardHeader>
              {!isLoggedIn ? (
                <CardContent>
                  <SignInForm onSubmit={handleAuth} isSubmitting={authLoading} authError={authError} />
                </CardContent>
              ) : (
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="size-5 text-foreground shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">{session?.user?.email}</p>
                        <p className="text-xs text-foreground-lighter">Signed in</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="outline" size="tiny" icon={<LogOut className="size-3" />}>
                          Sign Out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sign Out</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to sign out? You will need to sign in again to manage your agents.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              )}
            </Card>
          </PageSectionContent>
        </PageSection>

        {/* Account Management */}
        <PageSection>
          <PageSectionMeta>
            <PageSectionSummary>
              <PageSectionTitle>Account</PageSectionTitle>
              <PageSectionDescription>
                Manage your profile information and account details.
              </PageSectionDescription>
            </PageSectionSummary>
          </PageSectionMeta>
          <PageSectionContent>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="size-5 text-foreground shrink-0" />
                  <CardTitle>Account</CardTitle>
                </div>
              </CardHeader>
              {!isLoggedIn ? (
                <CardContent>
                  <div className="py-6 text-center">
                    <p className="text-sm text-foreground-muted">Sign in above to manage your account settings.</p>
                  </div>
                </CardContent>
              ) : (
              <>
              <CardContent>
                <FormItemLayout
                  layout="flex-row-reverse"
                  label={<span><Mail className="size-3 mr-1 inline" />Email</span>}
                  description="Your email address is read-only."
                >
                  <Input value={profileEmail} disabled className="opacity-60" />
                </FormItemLayout>
              </CardContent>

              <CardContent>
                <FormItemLayout
                  layout="flex-row-reverse"
                  label={<span><User className="size-3 mr-1 inline" />Display Name</span>}
                  description="Your display name shown across the dashboard."
                >
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your display name"
                  />
                </FormItemLayout>
              </CardContent>

              <CardContent>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4 text-foreground-lighter shrink-0" />
                  <span className="text-foreground-lighter">Member since</span>
                  <span className="text-foreground-light">
                    {session?.user?.created_at
                      ? format(new Date(session.user.created_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button type="primary" icon={<Save className="size-3" />} loading={saving} onClick={handleUpdateProfile}>
                  Save
                </Button>
              </CardFooter>
              </>
              )}
            </Card>
          </PageSectionContent>
        </PageSection>

        {/* AI Agent Configuration */}
        <PageSection>
          <PageSectionMeta>
            <PageSectionSummary>
              <PageSectionTitle>AI Agent Configuration</PageSectionTitle>
              <PageSectionDescription>
                Configure AI agents to automatically generate repository documentation.
              </PageSectionDescription>
            </PageSectionSummary>
          </PageSectionMeta>
          <PageSectionContent>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="size-5 text-foreground shrink-0" />
                  <CardTitle>AI Agent Configuration</CardTitle>
                  <Badge variant="warning">gemma-4-31b-it</Badge>
                </div>
              </CardHeader>
              {!isLoggedIn ? (
                <CardContent>
                  <div className="py-6 text-center">
                    <p className="text-sm text-foreground-muted">Sign in above to configure AI agents.</p>
                  </div>
                </CardContent>
              ) : (
              <>
              <form id="agent-form" onSubmit={handleSaveAgent}>
              <CardContent>
                {agents.length >= 5 && (
                  <div className="p-3 bg-warning/10 border border-warning-500 rounded-lg flex items-start gap-2">
                    <AlertCircle className="size-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-warning">
                      Maximum of 5 agents reached. Delete an existing agent to add a new one.
                    </p>
                  </div>
                )}

                <FormItemLayout
                  layout="flex-row-reverse"
                  label="Agent Name"
                  description="Give your AI agent a recognizable name."
                >
                  <Input
                    placeholder="My Documentation Agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                    disabled={agents.length >= 5}
                  />
                </FormItemLayout>
              </CardContent>

              <CardContent>
                <FormItemLayout
                  layout="flex-row-reverse"
                  label={<span><Key className="size-3 mr-1 inline" />Gemini API Key</span>}
                  description={
                    <span>
                      Get your key from{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        aistudio.google.com
                      </a>
                    </span>
                  }
                >
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
                </FormItemLayout>
              </CardContent>

              <CardContent>
                <FormItemLayout
                  layout="flex-row-reverse"
                  label={<span><Github className="size-3 mr-1 inline" />GitHub Token</span>}
                  description={
                    <span>
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
                    </span>
                  }
                >
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
                </FormItemLayout>
              </CardContent>

              <CardContent>
                <FormItemLayout
                  layout="flex-row-reverse"
                  label={<span><Clock className="size-3 mr-1 inline" />Generation Frequency</span>}
                  description="How often the agent should generate documentation."
                >
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
                </FormItemLayout>
              </CardContent>
              </form>

              <CardFooter className="justify-end space-x-2">
                <Button
                  type="default"
                  disabled={!agentName.trim() && !geminiKey && !githubToken}
                  onClick={() => { setAgentName(''); setGeminiKey(''); setGithubToken(''); setFrequency('manual') }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  form="agent-form"
                  icon={<Plus className="size-4" />}
                  loading={agentSaving}
                  disabled={!agentName.trim() || agents.length >= 5}
                >
                  Create Agent
                </Button>
              </CardFooter>
              </>
              )}
            </Card>
          </PageSectionContent>
        </PageSection>

        {/* Agent List */}
        <PageSection>
          <PageSectionMeta>
            <PageSectionSummary>
              <PageSectionTitle>Agents</PageSectionTitle>
              <PageSectionDescription>
                View and manage your AI documentation agents.
              </PageSectionDescription>
            </PageSectionSummary>
          </PageSectionMeta>
          <PageSectionContent>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <List className="size-5 text-foreground shrink-0" />
                  <CardTitle>Agents</CardTitle>
                  <Badge variant="default">{agents.length}/5</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
              {!isLoggedIn ? (
                <div className="py-6 text-center px-(--card-padding-x)">
                  <p className="text-sm text-foreground-muted">Sign in above to view and manage your agents.</p>
                </div>
              ) : agentsLoading ? (
                <div className="flex justify-center py-8 px-(--card-padding-x)">
                  <Loader2 className="size-5 animate-spin text-foreground-muted" />
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 px-(--card-padding-x)">
                  <p className="text-sm text-foreground-muted">No agents configured yet</p>
                  <p className="text-xs text-foreground-lighter mt-1">
                    Create an agent above to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>API</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">{agent.name}</span>
                            <span className="text-xs text-foreground-lighter">
                              Created {format(new Date(agent.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              agent.status === 'running'
                                ? 'success'
                                : agent.status === 'error'
                                  ? 'destructive'
                                  : 'default'
                            }
                          >
                            {agent.status === 'running' ? (
                              <span className="flex items-center gap-1">
                                <span className="size-1.5 bg-brand-600 rounded-full animate-pulse" />
                                Running
                              </span>
                            ) : agent.status === 'error' ? (
                              'Error'
                            ) : (
                              'Stopped'
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground-light">{agent.api_used}</TableCell>
                        <TableCell className="text-foreground-light capitalize">
                          {FREQUENCIES.find((f) => f.value === agent.generation_frequency)?.label ??
                            agent.generation_frequency}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="tiny"
                              type="default"
                              icon={<RefreshCw className="size-3" />}
                              onClick={() => handleViewLogs(agent.id)}
                              className={selectedAgentId === agent.id ? 'bg-surface-200' : ''}
                            >
                              Logs
                            </Button>
                            <Button
                              size="tiny"
                              type={agent.status === 'running' ? 'danger' : 'default'}
                              icon={agent.status === 'running' ? <Square className="size-3" /> : <Play className="size-3" />}
                              onClick={() => handleToggleAgent(agent)}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="tiny"
                                  type="default"
                                  icon={<Trash2 className="size-3" />}
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the agent "{agent.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAgent(agent)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              </CardContent>

              {/* Real-time Logs */}
              {selectedAgentId && (
                <div className="border-t">
                  <div className="px-(--card-padding-x) py-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground">Real-time Logs</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = logs
                            .map((l) => `[${format(new Date(l.created_at), 'HH:mm:ss')}] [${l.level.toUpperCase()}] ${l.message}`)
                            .join('\n')
                          navigator.clipboard.writeText(text)
                        }}
                        className="text-foreground-lighter hover:text-foreground transition-colors"
                        title="Copy logs"
                      >
                        <ClipboardCopy className="size-3.5" />
                      </button>
                      <Badge variant="default" className="text-[10px]">
                        <span className="size-1.5 bg-brand-600 rounded-full inline-block mr-1 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                  </div>
                  <div className="px-(--card-padding-x) pb-3">
                    {logsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="size-4 animate-spin text-foreground-muted" />
                      </div>
                    ) : logs.length === 0 ? (
                      <p className="text-xs text-foreground-muted text-center py-4">No logs yet</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-2 py-1.5 px-2 rounded bg-muted/50 text-xs font-mono">
                            <span className="text-foreground-lighter shrink-0">
                              {format(new Date(log.created_at), 'HH:mm:ss')}
                            </span>
                            <span className={`shrink-0 font-medium ${
                              log.level === 'error' ? 'text-red-500'
                              : log.level === 'warn' ? 'text-amber-500'
                              : log.level === 'debug' ? 'text-foreground-lighter'
                              : 'text-foreground-light'
                            }`}>
                              [{log.level.toUpperCase()}]
                            </span>
                            <span className="text-foreground-light break-all">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </PageSectionContent>
        </PageSection>
      </PageContainer>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AccountLayout>
      <SettingsContent />
    </AccountLayout>
  )
}
