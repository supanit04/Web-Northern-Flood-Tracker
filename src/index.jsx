// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Github } from "lucide-react";
// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/index.css'
// Components
import App from './App.jsx'

// ---------------- Header ----------------
function Header() {
  const navigate = useNavigate()

  return (
    <header className="agency-header">
      <div className="logo-area">
        <img src="/mfu-logo.png" alt="โลโก้" width={50} height={50} />
        <div className="title">
          <div className="th text-white">ติดตามสถานการณ์อุทกภัยภาคเหนือของประเทศไทย</div>
          <div className="en text-white ">Northern Flood Forecasting System</div>
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

// ---------------- Footer ----------------
function Footer() {
  return (
   <footer className="footer bg-[#0B2A73] text-white py-8 px-12 flex justify-center mt-auto">

      <div className="footer-content">

        {/* ซ้าย */}
        <div className="footer-left">
          <img src="public/rain.png" alt="logo-web" width={50} />
          <h3 className="footer-title"> Northern Flood Tracker</h3>
          <p className="footer-subtext">ติดตามสถานการณ์อุทกภัยภาคเหนือ</p>
        </div>

        {/* ขวา */}
       <div className="footer-right">
        <h3 className="footer-heading">เกี่ยวกับเรา</h3>
        <ul className="footer-info">
          <li>
            <a 
              href="https://maps.app.goo.gl/pMmjNxy2SPTfixGG7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <MapPin size={18} /> 
              มหาวิทยาลัยแม่ฟ้าหลวง 333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100
            </a>
          </li>

          <li>
            <a href="tel:0839290889" className="footer-link">
              <Phone size={18} /> 
              083-929-0889
            </a>
          </li>

          <li>
            <a href="mailto:6531501166@lamduan.mfu.ac.th" className="footer-link">
              <Mail size={18} /> 
              6531501166@lamduan.mfu.ac.th
            </a>
          </li>

          <li>
            <a 
              href="https://www.instagram.com/chanonpianon?igsh=bzBmZHJqeWU3Z2xk"
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Github size={18} /> 
              chanonpianon
            </a>
          </li>
        </ul>
      </div>
      </div>
    </footer>
  )
}

// ---------------- Layout ----------------
function Layout() {
  return (
    <div className="bg-container">
      <Header />
      <App />
      <Footer /> {/* ✅ ย้าย footer มาไว้ที่นี่แทน */}
    </div>
  )
}

// ---------------- Render App ----------------
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Layout />
    </Router>
  </StrictMode>
)
