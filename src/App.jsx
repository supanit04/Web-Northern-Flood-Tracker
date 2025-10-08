import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./assets/css/App.css";
import Agency from "./agency";



const data = [
  { month: "Jan", y2023: 220, y2024: 80, y2025: 40 },
  { month: "Feb", y2023: 200, y2024: 70, y2025: 50 },
  { month: "Mar", y2023: 250, y2024: 100, y2025: 70 },
  { month: "Apr", y2023: 230, y2024: 130, y2025: 100 },
  { month: "May", y2023: 260, y2024: 150, y2025: 120 },
  { month: "Jun", y2023: 240, y2024: 160, y2025: 130 },
  { month: "Jul", y2023: 300, y2024: 170, y2025: 140 },
  { month: "Aug", y2023: 280, y2024: 180, y2025: 150 },
  { month: "Sep", y2023: 320, y2024: 190, y2025: 160 },
];


const provinces = [
  { name: "เชียงราย", color: "bg-blue-40" },
  { name: "พะเยา", color: "bg-sky" },
  { name: "น่าน", color: "bg-red" },
  { name: "แพร่", color: "bg-amber" },
  { name: "ลำปาง", color: "bg-orange" },
  { name: "ลำพูน", color: "bg-purple" },
  { name: "เชียงใหม่", color: "bg-brown" },
  { name: "แม่ฮ่องสอน", color: "bg-green" },
  { name: "อุตรดิตถ์", color: "bg-blue" },
];

const floodData = [
  { province: "เชียงใหม่", district: "จอมทอง", subdistrict: "แม่สอย", village: 2, status: "เกิดน้ำท่วม" },
  { province: "เชียงใหม่", district: "แม่วาง", subdistrict: "แม่วิน", village: 3, status: "เกิดน้ำท่วม" },
  { province: "ลำพูน", district: "เมือง", subdistrict: "หนองหนาม", village: 4, status: "เกิดน้ำท่วม" },
  { province: "เชียงราย", district: "เวียง", subdistrict: "แม่สลอง", village: 6, status: "เฝ้าระวัง" },
];

function Home() {
  const [selectedProvince, setSelectedProvince] = useState("");

  return (
    <main>
     

      {/* Forecast Section */}
      <section className="predictbox">
        <h2 className="font-bold text-lg mb-2 ">คาดการณ์อุทกภัย 72 ชั่วโมงล่วงหน้า</h2>
        <div className="flex justify-center gap-4">
          <div className="redbox">
            โปรดระวังน้ำท่วมฉับพลันในหลายพื้นที่ <br />
             วันที่ 30 ส.ค. 2568
          </div>
          <div className="yellowbox">
            พรุ่งนี้ <br /> 31 ส.ค. 2568
          </div>
          <div className="greenbox">
            วันจันทร์ <br /> 1 ก.ย. 2568
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex flex-wrap mt-6 gap-4 px-6">
        {/* Map Section */}
        <div className="mapbox">
          <h2 className="font-semibold mb-3 text-center text-lg">แผนที่ภาคเหนือ</h2>
          <div className="grid grid-cols-3 gap-2">
            {provinces.map((p) => (
              <div
                key={p.name}
                className={`${p.color} p-3 text-white text-center rounded-lg cursor-pointer hover:scale-105 transition`}
                onClick={() => setSelectedProvince(p.name)}
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Flood Table */}
        <div className="floodtable">
          <h2 className="font-semibold mb-3 text-center text-lg">สถานการณ์น้ำท่วม</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-black-600 text-sm text-center">
              <thead className="bg-white-100">
                <tr>
                  <th className="border p-2">จังหวัด</th>
                  <th className="border p-2">อำเภอ</th>
                  <th className="border p-2">ตำบล</th>
                  <th className="border p-2">หมู่ที่</th>
                  <th className="border p-2">สถานการณ์</th>
                </tr>
              </thead>
              <tbody>
                {floodData
                  .filter((d) => !selectedProvince || d.province === selectedProvince)
                  .map((d, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{d.province}</td>
                      <td className="border p-2">{d.district}</td>
                      <td className="border p-2">{d.subdistrict}</td>
                      <td className="border p-2">{d.village}</td>
                      <td
                        className={`border p-2 font-semibold ${
                       d.status === "เกิดน้ำท่วม"
                       ?"text-red-700 bg-red-100"
                        :"text-yellow-700 bg-yellow-100"
                    }`}
                      >
                        {d.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section>
        <div className="staticbox">
          <h2>สถิติการเกิดน้ำท่วมย้อนหลัง 3 ปี</h2>
             
        </div>
      </section>
      <section>
        <div className="staticbox">
          <h2>สถิติการเกิดน้ำท่วมในแต่ละเดือนในปี 2568</h2>
             
        </div>
      </section>
      <section className="flex flex-wrap mt-6 gap-4 px-6">
        {/* Map Section */}
        <div className="mapbox">
          <h2 className="font-semibold mb-3 text-center text-lg">ปริมาณน้ำในเขื่อนวันนี้ จาก คลังน้ำแห่งชาติ</h2>
          <div className="card-container">
            <div className="card">
              <h3 className="card-title">เขื่อนภูมิพล</h3>
              <p className="card-value">ความจุ: 1,420 ล้าน ลบ.ม.</p>  
              <p className="card-value">ปัจจุบัน: 1,200 ล้าน ลบ.ม.</p>
            </div>
            <div className="card">    
              <h3 className="card-title">เขื่อนสิริกิติ์</h3>
              <p className="card-value">ความจุ: 2,100 ล้าน ลบ.ม.</p>  
              <p className="card-value">ปัจจุบัน: 1,800 ล้าน ลบ.ม.</p>    
            </div>
            <div className="card">    
              <h3 className="card-title">เขื่อนสิริกิติ์</h3>
              <p className="card-value">ความจุ: 2,100 ล้าน ลบ.ม.</p>  
              <p className="card-value">ปัจจุบัน: 1,800 ล้าน ลบ.ม.</p>    
            </div>
           <p>อัพเดทล่าสุด: 30 ส.ค. 2568 08:00 น.</p>
          </div>
        </div>

        {/* Flood Table */}
        <div className="floodtable">
          <h2 className="font-semibold mb-3 text-center text-lg">ปริมาณน้ำในแม่น้ำวันนี้</h2>
          <div className="card-container">
            <div className="card">
              <h3 className="card-title">สถานีน้ำเชียงใหม่</h3>
              <p className="card-value">อำเภอ</p> 
              <p className="card-value">ตำบล</p>    
            </div>
            <div className="card">    
              <h3 className="card-title">สถานีน้ำเชียงใหม่</h3>
              <p className="card-value">อำเภอ</p>  
              <p className="card-value">ตำบล</p>    
            </div>
            <div className="card">    
              <h3 className="card-title">สถานีน้ำเชียงใหม่</h3>
              <p className="card-value">อำเภอ</p> 
              <p className="card-value">ตำบล</p>    
            </div>
           <p>อัพเดทล่าสุด: 30 ส.ค. 2568 08:00 น.</p>
          </div>
        </div>
      </section>
     

    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agency" element={<Agency />} />
    </Routes>
  );
}

export default App;
