import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './assets/css/App.css'
import Agency from './Agency'

function Home() {
  const navigate = useNavigate(); // ใช้สำหรับนำทาง programmatically

  return (
    <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/css/index.css" />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <title>
    ติดตามสถานการณ์อุทกภัยภาคเหนือ - Northern Flood Forecasting System
  </title>
  <header>
    <div className="logo-area">
      <img src="/photo/ตรามอ.png" alt="โลโก้" width={50} height={50} />
      <div className="title">
        <div className="th">ติดตามสถานการณ์อุทกภัยภาคเหนือ</div>
        <div className="en">Northern Flood Forecasting System</div>
      </div>
    </div>
    <nav>
      <button className="btn text-light">Home</button>
      <button className="btn text-light">Agency</button>
    </nav>
  </header>
  <section className="region-buttons " aria-label="เลือกภาคจังหวัด">
    <button className="region-button red-bg" type="button" aria-pressed="false">
      เชียงราย
      <img src="/photo/flood.png" width="60px" height="60px" />
    </button>
    <button className="region-button red-bg" type="button" aria-pressed="false">
      เชียงใหม่
      <img src="/photo/flood.png" width={60} height={60} />
    </button>
    <button
      className="region-button orange-bg"
      type="button"
      aria-pressed="false"
    >
      พะเยา
      <img src="/photo/sea-level.png" width={60} height={60} />
    </button>
    <button
      className="region-button orange-bg"
      type="button"
      aria-pressed="false"
    >
      ลำพูน
      <img src="/photo/sea-level.png" width={60} height={60} />
    </button>
    <button
      className="region-button orange-bg"
      type="button"
      aria-pressed="false"
    >
      ลำปาง
      <img src="/photo/sea-level.png" width={60} height={60} />
    </button>
    <button
      className="region-button green-bg"
      type="button"
      aria-pressed="false"
    >
      น่าน
      <img src="/photo/home.png" width={60} height={60} />
    </button>
    <button
      className="region-button green-bg"
      type="button"
      aria-pressed="false"
    >
      แม่ฮ่องสอน
      <img src="/photo/home.png" width={60} height={60} />
    </button>
    <button
      className="region-button green-bg"
      type="button"
      aria-pressed="false"
    >
      แพร่
      <img src="/photo/home.png" width={60} height={60} />
    </button>
    <button
      className="region-button green-bg"
      type="button"
      aria-pressed="false"
    >
      อุตรดิตถ์
      <img src="/photo/home.png" width={60} height={60} />
    </button>
  </section>
  <main>
    <div className="map-title" id="map-title">
      แผนที่ภาคเหนือ
    </div>
    <div className="content-grid">
      <img
        src="/photo/Screenshot 2025-08-21 222225.png"
        alt=""
        width="500px"
        height="500px"
      />
      <section
        className="filter-container"
        aria-label="ข้อมูลสถานการณ์น้ำและสถานการณ์อุทกภัย"
      >
        <form className="filter-form" aria-label="กรองข้อมูลสถานการณ์">
          <label htmlFor="provinceSelect" className="visually-hidden">
            จังหวัด
          </label>
          <select
            id="provinceSelect"
            name="province"
            aria-describedby="selectProvinceHelp"
          >
            <option value=""> เลือกจังหวัด </option>
            <option value="เชียงใหญ่">เชียงใหม่</option>
            <option value="เชียงราย">เชียงราย</option>
            <option value="พะเยา">พะเยา</option>
            <option value="ลำพูน">ลำพูน</option>
            <option value="ลำปาง">ลำปาง</option>
            <option value="น่าน">น่าน</option>
            <option value="แม่ฮ่องสอน">แม่ฮ่องสอน</option>
            <option value="แพร่">แพร่</option>
            <option value="อุตรดิตถ์">อุตรดิตถ์</option>
          </select>
          <label htmlFor="districtSelect" className="visually-hidden">
            อำเภอ
          </label>
          <select
            id="districtSelect"
            name="district"
            aria-disabled="true"
            disabled=""
          >
            <option value="">เลือกอำเภอ</option>
          </select>
        </form>
        <div
          className="table-wrapper"
          role="region"
          aria-live="polite"
          aria-relevant="all"
          aria-label="ข้อมูลสถานการณ์น้ำและสถานการณ์อุทกภัยในแต่ละพื้นที่"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">จังหวัด</th>
                <th scope="col">แม่น้ำ</th>
                <th scope="col">ตำบล</th>
                <th scope="col">อำเภอ</th>
                <th scope="col">สถานการณ์</th>
              </tr>
            </thead>
            <tbody id="statusTableBody" tabIndex={0}>
              <tr>
                <td>เชียงใหม่</td>
                <td>แม่น้ำปิง</td>
                <td>แม่สอย</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>เชียงใหม่</td>
                <td>แม่น้ำปิง</td>
                <td>บ้านแปะ</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>เชียงราย</td>
                <td>น้ำแม่วาง</td>
                <td>แม่วิน</td>
                <td>แม่จาง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>พะเยา</td>
                <td>แม่น้ำงาว</td>
                <td>แม่ลอย</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>ลำพูน</td>
                <td>แม่น้ำปิง</td>
                <td>บ้านแปง</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>เชียงราย</td>
                <td>น้ำแม่ขาว</td>
                <td>แม่วัน</td>
                <td>แม่วาง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>ลำปาง</td>
                <td>แม่น้ำปิง</td>
                <td>แม่สอย</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>พะเยา</td>
                <td>แม่น้ำปิง</td>
                <td>บ้านแปง</td>
                <td>จอมทอง</td>
                <td>
                  <span
                    className="status-icon status-danger"
                    aria-label="วิกฤต"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>เชียงราย</td>
                <td>น้ำแม่วาง</td>
                <td>แม่วิน</td>
                <td>แม่วาง</td>
                <td>
                  <span
                    className="status-icon status-warning"
                    aria-label="เฝ้าระวัง"
                  >
                    !
                  </span>
                </td>
              </tr>
              <tr>
                <td>พะเยา</td>
                <td>น้ำแม่วาง</td>
                <td>แม่วิน</td>
                <td>แม่วาง</td>
                <td>
                  <span
                    className="status-icon status-warning"
                    aria-label="เฝ้าระวัง"
                  >
                    !
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          className="pagination-controls"
          aria-label="ควบคุมการแสดงข้อมูลหน้าและจำนวนข้อมูล"
        >
          <div>
            จำนวนแถวต่อหน้า
            <select id="rowCountSelect" aria-label="จำนวนแถวต่อหน้า">
              <option value={10} selected="">
                10
              </option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div
            className="page-nav"
            role="navigation"
            aria-label="หน้า pagination"
          >
            <button id="prevPage" aria-label="หน้าก่อนหน้า" disabled="">
              &lt;
            </button>
            <span id="pageInfo" aria-live="polite" aria-atomic="true">
              แสดงผลรายการ 1-10 จาก 738 รายการ
            </span>
            <button id="nextPage" aria-label="หน้าถัดไป">
              &gt;
            </button>
          </div>
        </div>
      </section>
    </div>
  </main>
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
