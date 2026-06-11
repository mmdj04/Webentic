'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Button, Input } from 'ui'
import z from 'zod'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const formId = 'sign-in-form'

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isSubmitting?: boolean
  authError?: string | null
}

export function SignInForm({ onSubmit, isSubmitting: externalSubmitting, authError }: SignInFormProps) {
  const [passwordHidden, setPasswordHidden] = useState(true)
  const { register, handleSubmit, formState: { errors, isSubmitting: formSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  const isSubmitting = externalSubmitting ?? formSubmitting

  const handleFormSubmit: SubmitHandler<z.infer<typeof schema>> = async ({ email, password }) => {
    await onSubmit(email, password)
  }

  return (
    <form id={formId} className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
      {authError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-xs font-medium mb-1 block text-foreground-light">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="password" className="text-xs font-medium mb-1 block text-foreground-light">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={passwordHidden ? 'password' : 'text'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isSubmitting}
            className="pr-10"
            {...register('password')}
          />
          <Button
            type="default"
            title={passwordHidden ? 'Show password' : 'Hide password'}
            aria-label={passwordHidden ? 'Show password' : 'Hide password'}
            className="absolute right-1 top-1 px-1.5"
            icon={passwordHidden ? <Eye /> : <EyeOff />}
            disabled={isSubmitting}
            onClick={() => setPasswordHidden((prev) => !prev)}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button block form={formId} htmlType="submit" size="large" loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  )
}
