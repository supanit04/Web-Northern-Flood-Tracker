import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/css/App.css";
import Agency from "./agency";
import StationCards from "./components/river-stations.jsx";

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
  { province: "เชียงใหม่", district: "จอมทอง", subdistrict: "แม่สอย", status: "เกิดน้ำท่วม" },
  { province: "เชียงใหม่", district: "แม่วาง", subdistrict: "แม่วิน", status: "เกิดน้ำท่วม" },
  { province: "ลำพูน", district: "เมือง", subdistrict: "หนองหนาม", status: "เกิดน้ำท่วม" },
  { province: "เชียงราย", district: "เวียง", subdistrict: "แม่สลอง", status: "เฝ้าระวัง" },
];

function Home() {
  const [selectedProvince, setSelectedProvince] = useState("");

  return (
    <main>
      {/* Forecast */}
      <section className="predictbox">
        <h2>คาดการณ์อุทกภัย 72 ชั่วโมงล่วงหน้า</h2>
        <div className="flex justify-center gap-4">
          <div className="redbox">
            โปรดระวังน้ำท่วมฉับพลันในหลายพื้นที่<br />
            วันที่ 30 ส.ค. 2568
          </div>
          <div className="yellowbox">
            พรุ่งนี้<br />31 ส.ค. 2568
          </div>
          <div className="greenbox">
            วันจันทร์<br />1 ก.ย. 2568
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="flex flex-wrap mt-6 gap-4 px-6">
        {/* Map */}
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
            <table className="w-full border border-black text-sm text-center">
              <thead>
                <tr>
                  <th>จังหวัด</th>
                  <th>อำเภอ</th>
                  <th>ตำบล</th>
                  <th>สถานะ</th>
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
                      <td className={`border p-2 font-semibold ${
                        d.status === "เกิดน้ำท่วม"
                          ? "text-red-700 bg-red-100"
                          : "text-yellow-700 bg-yellow-100"
                      }`}>
                        {d.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* River Stations Cards */}
      <section className="flex flex-wrap mt-6 gap-4 px-6">
        <div style={{ padding: "32px", width: "100%" }}>
          <h1 className="text-2xl font-bold mb-4 text-center">River Stations (Northern Thailand)</h1>
          <StationCards provinceFilter={selectedProvince} />
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
