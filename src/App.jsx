import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/css/App.css";

// Components
import Agency from "./agency";
import StationCards from "./components/river-stations.jsx";
import Prediction from "./components/Prediction.jsx";
import ForecastSelector from "./components/ForecastSelector.jsx"; 
import RiverMap from "./components/map.jsx";

// ข้อมูลจังหวัด
const provinces = [
  { name: "เชียงราย", districts: ["เมืองเชียงราย", "เวียงชัย", "แม่ลาว", "แม่จัน","ดอยหลวง","พาน","พญาเม็งราย","เวียงเชียงรุ้ง","ป่าแดด","แม่สรวย","เชียงแสน","ขุนตาล","แม่สาย","เทิง","แม่ฟ้าหลวง","เวียงป่าเป้า","เวียงแก่น","เชียงของ"], color: "bg-blue-500" },
  { name: "พะเยา", districts: ["เมืองพะเยา", "จุน", "เชียงคำ", "เชียงม่วน","ดอกคำใต้","ปง","แม่ใจ","ภูซาง","ภูกามยาว"], color: "bg-sky-500" },
  { name: "น่าน", districts: ["เมืองน่าน", "แม่จริม", "บ้านหลวง", "นาน้อย","ปัว","ท่าวังผา","เวียงสา","ทุ่งช้าง","เชียงกลาง","นาหมื่น","สันติสุข","บ่อเกลือ","สองแคว","ภูเพียง","เฉลิมพระเกียรติ"], color: "bg-red-500" },
  { name: "แพร่", districts: ["เมือง", "สูงเม่น", "หนองม่วงไข่", "เด่นชัย","ร้องกวาง","ลอง","สอง","วังชิ้น"], color: "bg-amber-500" },
  { name: "ลำปาง", districts: ["เมือง", "เกาะคา", "ห้างฉัตร", "แม่ทะ","เสริมงาม","แม่เมาะ","แจ้ห่ม","สบปราบ","เมืองปาน","งาว","เถิน","วังเหนือ","แม่พริก"], color: "bg-orange-500" },
  { name: "ลำพูน", districts: ["เมือง", "ป่าซาง", "แม่ทา", "บ้านธิ","บ้านโฮ่ง","เวียงหนองล่อง","ลี้","ทุ่งหัวช้าง"], color: "bg-purple-500" },
  { name: "เชียงใหม่", districts: ["เมือง", "แม่ริม", "สันทราย", "ดอยสะเก็ด","สารภี","สันกำแพง","หางดง","สันป่าตอง","แม่ออน","แม่วาง","แม่แตง","ดอยหล่อ","สะเมิง","จอมทอง","เชียงดาว","ฮอด","พร้าว","ดอยเต่า","ไชยปราการ","เวียงแหง","ฝาง","แม่แจ่ม","แม่อาย","อมก๋อย"], color: "bg-yellow-700" },
  { name: "แม่ฮ่องสอน", districts: ["เมือง", "ปางมะผ้า", "ขุมยวม", "ปาย","แม่ลาน้อย","แม่สะเรียง","สบเมย"], color: "bg-green-500" },
  { name: "อุตรดิตถ์", districts: ["เมือง", "ลับแล", "ตรอน", "ท่าปลา","ทองแสนชัย","พิชัย","น้ำปาด","ฟากท่า","บ้านโคก"], color: "bg-blue-700" },
];

function Home() {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // ตั้งค่าเริ่มต้นเป็น "วันนี้"
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  
  // เก็บ Index ของปุ่ม (0=วันนี้, 1=พรุ่งนี้, 2=มะรืนนี้) เพื่อใช้คำนวณย้อนกลับ
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  return (
    <main className="bg-gray-50 min-h-screen pb-10 font-sarabun">
      
      {/* 1. Forecast Selector (เลือกวัน) */}
      <section className="pt-6 px-2 flex  justify-center pb-4">
         <ForecastSelector 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onDayIndexSelect={setSelectedDayIndex}
         />
      </section>

      {/* Container หลัก */}
      <section className="px-4 max-w-[1500px] mx-auto flex flex-row">
        {/* 2. River Map (แผนที่) */}
        <div className=" flex flex-row">
            <div className="mapbox w-[500px] h-[600px] bg-gray-50 p-4 rounded-lg shadow-md ">  
              <RiverMap
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                onProvinceSelect={(code) => {
                  setSelectedProvince(code);
                  setSelectedDistrict(null);
                }}
                onDistrictSelect={(code) => setSelectedDistrict(code)}
                
                // ส่งค่าวันที่และ index ไปให้ Map คำนวณสี
                selectedDate={selectedDate}
                selectedDayIndex={selectedDayIndex}
              />
            </div>
          </div>  

        {/* 3. Prediction Table (ตารางแสดงผล) */}
        <div className="w-full flex flex-row">
           <Prediction 
              provinceFilter={selectedProvince} 
              districtFilter={selectedDistrict} 
              selectedDate={selectedDate}
              selectedDayIndex={selectedDayIndex} 
            />
        </div>

      </section>

      {/* 4. River Stations (กราฟ) */}
      <section className="mt-8 px-4 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <StationCards
            provinceFilter={selectedProvince}
            districtFilter={selectedDistrict}
            selectedDate={selectedDate}
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