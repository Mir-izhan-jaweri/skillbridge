import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { tokenStore } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    tokenStore.setAuthFailureHandler(() => {
      setUser(null)
      setSkills([])
      setAnalysis(null)
    })
  }, [])

  const applyProfile = useCallback((data) => {
    setUser(data.user)
    setSkills(data.skills || [])
  }, [])

  // Restore session from the httpOnly refresh cookie on first load.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/profile')
        if (!cancelled) applyProfile(res.data)
      } catch {
        tokenStore.clear()
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applyProfile])

  const login = useCallback(
    async (email, password) => {
      const res = await api.post('/auth/login', { email, password })
      tokenStore.set(res.data.access_token)
      applyProfile({ user: res.data.user, skills: [] })
      const profile = await api.get('/profile').catch(() => null)
      if (profile) applyProfile(profile.data)
      return res.data.user
    },
    [applyProfile],
  )

  const signup = useCallback(
    async (name, email, password) => {
      const res = await api.post('/auth/signup', { name, email, password })
      tokenStore.set(res.data.access_token)
      applyProfile({ user: res.data.user, skills: [] })
      return res.data.user
    },
    [applyProfile],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* token already invalid */
    }
    tokenStore.clear()
    setUser(null)
    setSkills([])
    setAnalysis(null)
  }, [])

  const analyzeSkills = useCallback(async ({ skills: skillList, text, resumeFile }) => {
    let res
    if (resumeFile) {
      const form = new FormData()
      form.append('resume', resumeFile)
      if (skillList?.length) form.append('skills', skillList.join(', '))
      res = await api.post('/skills/analyze', form)
    } else {
      res = await api.post('/skills/analyze', skillList?.length ? { skills: skillList } : { text })
    }
    setAnalysis(res.data)
    setSkills(res.data.skills || [])
    return res.data
  }, [])

  const updateProfile = useCallback(
    async (payload) => {
      const res = await api.put('/profile', payload)
      applyProfile(res.data)
      return res.data
    },
    [applyProfile],
  )

  const value = useMemo(
    () => ({
      user,
      skills,
      analysis,
      booting,
      isAdmin: user?.role === 'admin',
      hasSkills: skills.length > 0,
      login,
      signup,
      logout,
      analyzeSkills,
      updateProfile,
      applyProfile,
    }),
    [user, skills, analysis, booting, login, signup, logout, analyzeSkills, updateProfile, applyProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
