import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-215df.up.railway.app'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const { data } = await api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },
  async register(payload) {
    const { data } = await api.post('/api/auth/register', payload)
    return data
  },
}

// ── Users ─────────────────────────────────────────────────────
export const userService = {
  async getMe() {
    const { data } = await api.get('/api/users/me')
    return data
  },
}

// ── Accounts ──────────────────────────────────────────────────
export const accountService = {
  async getMyAccounts() {
    const { data } = await api.get('/api/accounts/me')
    return data
  },
  async createAccount(payload) {
    const { data } = await api.post('/api/accounts/', payload)
    return data
  },
}

// ── Transactions ──────────────────────────────────────────────
export const transactionService = {
  async getHistory(page = 1, size = 20) {
    const { data } = await api.get(`/api/transactions/history?page=${page}&size=${size}`)
    return data
  },
  async transfer(payload) {
    const { data } = await api.post('/api/transactions/transfer', payload)
    return data
  },
  async withdraw(payload) {
    const { data } = await api.post('/api/transactions/withdraw', payload)
    return data
  },
}

// ── Statements ────────────────────────────────────────────────
export const statementService = {
  async getStatements(accountId) {
    const { data } = await api.get(`/api/statements/${accountId}`)
    return data
  },
  async generateStatement(accountId, mes, anio) {
    const { data } = await api.post(
      `/api/statements/generate/${accountId}?mes=${mes}&anio=${anio}`
    )
    return data
  },
}

export default api
