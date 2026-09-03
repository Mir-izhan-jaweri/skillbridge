import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { signupSchema } from '../utils/validators'
import apiErrorMessage from '../utils/apiError'
import Button from '../components/Button'
import Field from '../components/Field'

export default function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data) => {
    setFormError('')
    try {
      await signup(data.name, data.email, data.password)
      toast.success("Account created — let's add your skills!")
      navigate('/dashboard', { state: { onboard: true } })
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Signup failed'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Free forever. Your first match is under a minute away.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Full name" name="name" error={errors.name?.message}>
          <input id="name" className="input" placeholder="Aisha Khan" autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Email" name="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        <Field
          label="Password"
          name="password"
          error={errors.password?.message}
          hint="At least 8 characters with a letter and a number."
        >
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
          />
        </Field>
        <Field label="Confirm password" name="confirm" error={errors.confirm?.message}>
          <input
            id="confirm"
            type="password"
            className="input"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirm')}
          />
        </Field>

        {formError && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Log in
        </Link>
      </p>
    </motion.div>
  )
}
