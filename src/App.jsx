import { Routes, Route } from 'react-router-dom'
import './assets/css/App.css'
import Agency from './agency'

function Home() {
  return (
    <main>
      <h1>ยินดีต้อนรับสู่ระบบติดตามอุทกภัยภาคเหนือ</h1>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agency" element={<Agency />} />
    </Routes>
  )
}

export default App
