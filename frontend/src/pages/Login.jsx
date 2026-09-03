import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { loginSchema } from '../utils/validators'
import apiErrorMessage from '../utils/apiError'
import Button from '../components/Button'
import Field from '../components/Field'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setFormError('')
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Login failed'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Log in to see your latest matches and skill insights.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email" name="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            {...register('email')}
          />
        </Field>
        <Field label="Password" name="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            {...register('password')}
          />
        </Field>

        {formError && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New to SkillBridge?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Create an account
        </Link>
      </p>
    </motion.div>
  )
}
