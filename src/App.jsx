import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './assets/css/App.css'
import Agency from './Agency'

function Home() {
  const navigate = useNavigate(); // ใช้สำหรับนำทาง programmatically

  return (
    <>
      <h1>Northern-Flood-Tracker</h1>
      <button onClick={() => navigate('/agency')}>
        Next Page
      </button>
    </>
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
