import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#CBDA2E', color: '#18130F', borderRadius: 20, fontWeight: 600, fontSize: 14, border: '1px solid #18130F22' },
            success: { style: { background: '#CBDA2E', color: '#18130F' } },
            error: { style: { background: '#FFFFFF', color: '#18130F', border: '1px solid #E4DBCB' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
