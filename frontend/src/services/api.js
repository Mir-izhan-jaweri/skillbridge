import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export const tokenStore = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
  setAuthFailureHandler: (fn) => {
    onAuthFailure = fn
  },
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        accessToken = res.data.access_token
        return true
      })
      .catch(() => false)
      .finally(() => {
        setTimeout(() => {
          refreshPromise = null
        }, 0)
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true
      const refreshed = await tryRefresh()
      if (refreshed) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      }
      tokenStore.clear()
      onAuthFailure?.()
    }
    return Promise.reject(error)
  },
)

export function apiErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error?.message || fallback
}

export default api
