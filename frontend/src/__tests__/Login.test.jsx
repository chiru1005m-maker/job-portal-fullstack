import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../api', () => ({
  post: vi.fn()
}))
import api from '../api'

vi.mock('react-router-dom', async (orig) => {
  const mod = await vi.importActual('react-router-dom')
  return { ...mod, useNavigate: () => vi.fn() }
})

describe('Login', () => {
  beforeEach(()=>{ localStorage.clear() })
  test('renders and validates input', async () => {
    render(<MemoryRouter><Login/></MemoryRouter>)
    expect(screen.getByText(/Login/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Login/i))
    // since password empty, should show validation
    expect(screen.getByText(/Please provide username\/email and password/i)).toBeInTheDocument()
  })

  test('calls api on submit', async () => {
    api.post.mockResolvedValue({ data: { token: 't', username: 'u', role: 'JobSeeker' } })
    render(<MemoryRouter><Login/></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/Username or Email/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByText('Login'))
    await waitFor(()=> expect(api.post).toHaveBeenCalledWith('/api/auth/login', { username: 'testuser', password: 'secret' }))
    expect(localStorage.getItem('token')).toBe('t')
  })
})