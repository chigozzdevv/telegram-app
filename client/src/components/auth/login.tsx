import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '16px 18px',
    fontSize: '16px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #3a3a5a',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d0d1a',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: 'white', 
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Welcome back
        </h1>
        <p style={{ 
          color: '#888', 
          fontSize: '16px', 
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid #ef4444'
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#ccc', 
              marginBottom: '10px' 
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#ccc', 
              marginBottom: '10px' 
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p style={{ 
            textAlign: 'center', 
            marginTop: '32px', 
            color: '#888', 
            fontSize: '15px' 
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
