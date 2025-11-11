import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/css/App.css";
import Agency from "./agency";
import StationCards from "./components/river-stations.jsx";
import Prediction from "./components/Prediction.jsx"; // ปรับ path ให้ตรงกับที่เก็บไฟล์

const provinces = [
  { name: "เชียงราย", districts: ["เมืองเชียงราย", "เวียงชัย", "แม่ลาว", "แม่จัน","ดอยหลวง","พาน","พญาเม็งราย","เวียงเชียงรุ้ง","ป่าแดด","แม่สรวย","เชียงแสน","ขุนตาล","แม่สาย","เทิง","แม่ฟ้าหลวง","เวียงป่าเป้า","เวียงแก่น","เชียงของ"], color: "bg-blue-40" },
  { name: "พะเยา",districts: ["เมืองพะเยา", "จุน", "เชียงคำ", "เชียงม่วน","ดอกคำใต้","ปง","แม่ใจ","ภูซาง","ภูกามยาว"], color: "bg-sky" },
  { name: "น่าน", districts: ["เมืองน่าน", "แม่จริม", "บ้านหลวง", "นาน้อย","ปัว","ท่าวังผา","เวียงสา","ทุ่งช้าง","เชียงกลาง","นาหมื่น","สันติสุข","บ่อเกลือ","สองแคว","ภูเพียง","เฉลิมพระเกียรติ"], color: "bg-red" },
  { name: "แพร่", districts: ["เมือง", "สูงเม่น", "หนองม่วงไข่", "เด่นชัย","ร้องกวาง","ลอง","สอง","วังชิ้น"], color: "bg-amber" },
  { name: "ลำปาง",districts: ["เมือง", "เกาะคา", "ห้างฉัตร", "แม่ทะ","เสริมงาม","แม่เมาะ","แจ้ห่ม","สบปราบ","เมืองปาน","งาว","เถิน","วังเหนือ","แม่พริก"], color: "bg-orange" },
  { name: "ลำพูน", districts: ["เมือง", "ป่าซาง", "แม่ทา", "บ้านธิ","บ้านโฮ่ง","เวียงหนองล่อง","ลี้","ทุ่งหัวช้าง"],color: "bg-purple" },
  { name: "เชียงใหม่",districts: ["เมือง", "แม่ริม", "สันทราย", "ดอยสะเก็ด","สารภี","สันกำแพง","หางดง","สันป่าตอง","แม่ออน","แม่วาง","แม่แตง","ดอยหล่อ","สะเมิง","จอมทอง","เชียงดาว","ฮอด","พร้าว","ดอยเต่า","ไชยปราการ","เวียงแหง","ฝาง","แม่แจ่ม","แม่อาย","อมก๋อย"], color: "bg-brown" },
  { name: "แม่ฮ่องสอน",districts: ["เมือง", "ปางมะผ้า", "ขุมยวม", "ปาย","แม่ลาน้อย","แม่สะเรียง","สบเมย"], color: "bg-green" },
  { name: "อุตรดิตถ์", districts: ["เมือง", "ลับแล", "ตรอน", "ท่าปลา","ทองแสนชัย","พิชัย","น้ำปาด","ฟากท่า","บ้านโคก"],color: "bg-blue" },
];

// Flood Data (ตัวอย่าง)


function Home() {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const handleProvinceSelect = (provinceName) => {
    setSelectedProvince(provinceName);
    setSelectedDistrict(null);
  };

  const selectedProvinceData = provinces.find(
    (p) => p.name === selectedProvince
  );

  return (
    <main>
      {/* Forecast box */}
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
      <section className="flex flex-wrap justify-center mt-6 gap-4 px-6">
        {/* Map */}
        <div className="mapbox w-[300px] h-[600px] bg-gray-50 p-4 rounded-lg shadow-md overflow-auto">
          <h2 className="font-semibold mb-3 text-center text-lg">แผนที่ภาคเหนือ</h2>
          <h2 className="font-semibold mb-3 text-center text-lg">
            {!selectedProvince ? "เลือกจังหวัด" : `เลือกอำเภอในจังหวัด ${selectedProvince}`}
          </h2>
          {!selectedProvince ? (
            <div className="grid grid-cols-3 gap-4">
              {provinces.map((p) => (
                <div
                  key={p.name}
                  className={`${p.color} p-3 text-white text-center rounded-full cursor-pointer hover:scale-105 transition`}
                  onClick={() => handleProvinceSelect(p.name)}
                >
                  {p.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              <button
                onClick={() => setSelectedProvince(null)}
                className="mb-3 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                ← กลับไปเลือกจังหวัด
              </button>
              <div className="grid grid-cols-2 gap-3">
                {selectedProvinceData?.districts.map((d) => (
                  <div
                    key={d}
                    className={`district-box p-2 text-center rounded-md cursor-pointer transition ${
                      selectedDistrict === d
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-blue-100"
                    }`}
                    onClick={() => setSelectedDistrict(d)}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flood Table */}
        <div className="floodtable w-[600px] h-[600px] overflow-auto p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-3 text-center text-lg">สถานการณ์น้ำท่วม</h2>
           {/* Prediction Table */}
      <section className="mt-6 px-6">
       <Prediction 
  provinceFilter={selectedProvince} 
  districtFilter={selectedDistrict} 
/>

      </section>
        </div>
      </section>

      {/* River Stations */}
      <section className="flex flex-wrap mt-6 gap-4 px-6">
        <div style={{ padding: "32px", width: "100%" }}>
          <h1 className="text-2xl font-bold mb-4 text-center">River Stations (Northern Thailand)</h1>
          <StationCards
            provinceFilter={selectedProvince}
            districtFilter={selectedDistrict}
            scrollToSelf={!!selectedDistrict}
          />
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
