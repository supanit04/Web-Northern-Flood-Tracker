// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
// Styles
import 'bootstrap/dist/css/bootstrap.min.css' // Bootstrap
import './assets/css/index.css'               // Tailwind
// Components
import App from './App.jsx'

// Header Component
function Header() {
  const navigate = useNavigate()

  return (
    <header className="agency-header">
      <div className="logo-area">
        <img src="/mfu-logo.png" alt="โลโก้" width={50} height={50} />
        <div className="title">
          <div className="th">ติดตามสถานการณ์อุทกภัยภาคเหนือของประเทศไทย</div>
          <div className="en">Northern Flood Forecasting System</div>
        </div>
      </div>

      <nav>
        <button className="btn text-light" onClick={() => navigate('/')}>
          Home
        </button>
        <button className="btn text-light" onClick={() => navigate('/agency')}>
          Emergency contacts
        </button>
      </nav>
    </header>

  )
}

// Layout Component
function Layout() {
  return (
    <div className="bg-container">
      <Header />
      <App />
    </div>
  )
}

// Render Application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Layout />
    </Router>
  </StrictMode>
)
