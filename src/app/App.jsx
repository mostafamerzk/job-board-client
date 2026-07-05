import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import { AppShell } from '../shared/layout/AppShell.jsx'
import { AppRouter } from '../routes/AppRouter.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <AppRouter />
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
