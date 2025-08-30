import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './assets/css/App.css'
import Agency from './Agency'

function Home() {
    const navigate = useNavigate();

    return (
      <div className="bg-container">
        <title>
          ติดตามสถานการณ์อุทกภัยภาคเหนือ - Northern Flood Forecasting System
        </title>
       <header className="agency-header">
        <div className="logo-area">
          <img src="/mfu-logo.png" alt="โลโก้" width={50} height={50} />
          <div className="title">
            <div className="th">ติดตามสถานการณ์อุทกภัยภาคเหนือ</div>
            <div className="en">Northern Flood Forecasting System</div>
          </div>
        </div>
        <nav>
          <button className="btn text-light" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="btn text-light" onClick={() => navigate('/agency')}>
            Agency
          </button>
        </nav>
      </header>

        {/* เนื้อหาอื่น ๆ ของหน้า */}
        <main>
          <h1>ยินดีต้อนรับสู่ระบบติดตามอุทกภัยภาคเหนือ</h1>
        </main>
      </div>
    )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agency" element={<Agency />} />
      </Routes>
    </Router>
  )
}

export default App
