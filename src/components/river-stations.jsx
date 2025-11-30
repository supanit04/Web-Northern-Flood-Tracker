import { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../assets/css/river-stations.css";

/* =========================================================
   🔧 ฟังก์ชันสร้าง Chart
   - ย้อนหลัง 30 วัน + ล่วงหน้า 3 วัน
   - Mapping ปี 2025 -> 2024 สำหรับ Demo
   - เชื่อมเส้น Actual และ Forecast เข้าด้วยกัน
========================================================= */
const generateChartData = (data, selectedStation, simulationDateStr) => {
  const stationData = data.filter((d) => d.station === selectedStation);
  
  // ค่าตั้งต้น
  let predValue = 3.5;
  if (stationData.length > 0) {
    predValue = stationData[0].WaterLevel_Pred;
  }
  const baseValue = predValue > 4.5 ? 3.5 : predValue;

  let chartPoints = [];

  // Setup วันที่หลัก
  let simDate = new Date(simulationDateStr);
  
  // DEMO LOGIC: ถ้าเป็นปี 2025 ให้ Map กลับไปใช้ปี 2024
  if (simDate.getFullYear() === 2025) {
    simDate.setFullYear(2024);
  }

  // 🟩 1. Loop ย้อนหลัง 30 วัน (รวมวันนี้ i=0)
  for (let i = 30; i >= 0; i--) {
    const current = new Date(simDate);
    current.setDate(current.getDate() - i);

    const dateStr = current.toISOString().split("T")[0];
    let simulatedActual = baseValue;

    // จำลองกราฟ (Sine wave เพื่อความสวยงาม)
    if (i > 10 && i <= 30) {
      simulatedActual = baseValue + Math.cos(i / 3) * 0.3 + i * 0.005;
    } else if (i <= 7 && i > 3) {
      simulatedActual = 3.25 + Math.sin(i * 1.5) * 0.8 + 1.5;
    } else if (i <= 3 && i > 0) {
      simulatedActual = 3.6 + Math.sin(i * 0.8) * 0.2;
    }

    if (i === 0) simulatedActual = predValue; 

    // 🔥 จุดสำคัญ: วันนี้ (i===0) ใส่ค่าลงใน Forecast ด้วย เพื่อเป็นจุดเชื่อมกราฟ
    chartPoints.push({
      date: dateStr,
      Actual: parseFloat(simulatedActual.toFixed(2)), 
      Forecast: i === 0 ? parseFloat(simulatedActual.toFixed(2)) : null, 
    });
  }

  // 🟩 2. Loop ล่วงหน้า 3 วัน (เริ่มที่ i=1)
  const lastActual = chartPoints[chartPoints.length - 1].Actual;

  for (let i = 1; i <= 3; i++) {
    const next = new Date(simDate);
    next.setDate(next.getDate() + i);

    const dateStr = next.toISOString().split("T")[0];
    let simulatedForecast = lastActual;

    if (i === 1) simulatedForecast = lastActual - 0.15;
    if (i === 2) simulatedForecast = lastActual - 0.05;
    if (i === 3) simulatedForecast = lastActual + 0.3;

    chartPoints.push({
      date: dateStr,
      Actual: null, // วันอนาคต ไม่มี Actual
      Forecast: parseFloat(simulatedForecast.toFixed(2)),
    });
  }

  return chartPoints;
};

/* =========================================================
   🟦 Helper: แปลงวันที่เป็นไทย
========================================================= */
const formatThaiDateShort = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short", // ม.ค.
  });
};

const formatThaiDateFull = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   🟦 Main Component
========================================================= */
export default function RiverStations({
  provinceFilter = null,
  districtFilter = null,
  scrollToSelf = false,
  selectedDate = null 
}) {
  const [riverData, setRiverData] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationDate, setSimulationDate] = useState(null);
  const componentRef = useRef(null);

  // 🟦 เลื่อนจออัตโนมัติ
  useEffect(() => {
    if (scrollToSelf && componentRef.current) {
      componentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollToSelf]);

  // 🟦 โหลดข้อมูลจาก Backend
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/RiverData")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setRiverData(data.data || []);
          
          // ถ้ามี selectedDate (จาก Props) ให้ใช้ก่อน ถ้าไม่มีใช้จาก API
          const dateToUse = selectedDate 
            ? (selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate)
            : data.simulation_date_used;

          setSimulationDate(dateToUse);
        } else {
          setRiverData([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  // 🟦 Filter จังหวัด / อำเภอ
  const filteredData = useMemo(() => {
    return riverData.filter((d) => {
      const matchProvince = provinceFilter ? d.province === provinceFilter : true;
      const matchDistrict = districtFilter ? d.district === districtFilter : true;
      return matchProvince && matchDistrict;
    });
  }, [riverData, provinceFilter, districtFilter]);

  // 🟦 หา station ที่มีในจังหวัด/อำเภอ
  useEffect(() => {
    const unique = [...new Set(filteredData.map((d) => d.station))];
    setStations(unique);
    // ถ้าสถานีที่เลือกอยู่ไม่อยู่ใน list ใหม่ ให้ reset เป็นอันแรก
    if (!unique.includes(selectedStation)) {
       setSelectedStation(unique[0] || "");
    }
  }, [filteredData]);

  // 🟦 สร้างกราฟ
  const chartData = useMemo(() => {
    if (simulationDate && selectedStation) {
      return generateChartData(filteredData, selectedStation, simulationDate);
    }
    return [];
  }, [filteredData, selectedStation, simulationDate]);

  // 🟦 หาค่าสูงสุด-ต่ำสุด เพื่อให้ Y-axis ปรับอัตโนมัติ
  const allValues = chartData.flatMap((d) => [d.Actual, d.Forecast]).filter((v) => v !== null);
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 5.0;
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 3.0;

  return (
    <div className="river-stations-container" ref={componentRef}>
      {/* Header */}
      <div className="headers-wrapper">
        <div className="logo-placeholder">
          {/* ตรวจสอบว่ารูป creek.png อยู่ใน folder public */}
          <img src="/creek.png" alt="River Icon" /> 
        </div>

        <div className="title-and-controls">
          <div className="title">ปริมาณน้ำในแม่น้ำ (คาดการณ์ล่วงหน้า 72 ชั่วโมง)</div>

          <div className="station-select-center">
            <div className="station-select-group-custom">
              <label className="dropdown-label" htmlFor="station-dropdown">
                เลือกสถานีวัดน้ำ
              </label>

              <div className="dropdown-wrapper">
                <span className="pin-icon">📍</span>
                <select
                  id="station-dropdown"
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="dropdown-custom"
                  disabled={stations.length === 0 || loading}
                >
                  <option value="" disabled>
                    {loading ? "กำลังโหลด..." : stations.length === 0 ? "ไม่พบสถานี" : "เลือกสถานี"}
                  </option>
                  {stations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="loading">กำลังดึงข้อมูล...</div>
      ) : chartData.length === 0 ? (
        <div className="loading">ไม่มีข้อมูลกราฟสำหรับสถานีนี้</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 40, left: 30, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />

            {/* X-Axis: แสดงทุกวัน เอียง 45 องศา */}
            <XAxis
              dataKey="date"
              interval={0} 
              angle={-45}
              textAnchor="end"
              height={70} 
              tick={{ fontSize: 11, fill: "#333" }}
              tickFormatter={(tick) => formatThaiDateShort(tick)}
            />

            {/* Y-Axis: ปริมาณน้ำ (ม.) */}
            <YAxis
              label={{
                value: "ปริมาณน้ำ (ม.)",
                angle: -90,
                position: "insideLeft",
                fill: "#333",
                fontSize: 14,
                dy: 50
              }}
              domain={[dataMin - 0.5, dataMax + 0.5]}
              tick={{ fontSize: 12, fill: "#333" }}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{ 
                borderRadius: "8px", 
                border: "none", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.95)"
              }}
              labelFormatter={(label) => formatThaiDateFull(label)}
              formatter={(value, name) => {
                const nameThai = name === "Actual" ? "ระดับน้ำจริง" : "พยากรณ์";
                return [`${value} ม.`, nameThai];
              }}
            />

            <Legend verticalAlign="top" align="right" wrapperStyle={{ top: 0, right: 0 }} />

            {/* เส้นจริง (ย้อนหลัง) */}
            <Line
              type="monotone"
              dataKey="Actual"
              name="Actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

            {/* เส้นพยากรณ์ (ล่วงหน้า) */}
            <Line
              type="monotone"
              dataKey="Forecast"
              name="Forecast"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
              strokeDasharray="5 5"
              connectNulls={true} // เชื่อมเส้น
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Footer Info */}
<div className="date-caption" style={{textAlign: 'right', marginTop: '10px', fontSize: '0.9rem', color: '#666'}}>
    {/* ถ้ามี selectedDate (ที่เป็นปี 2025) ให้ใช้เลย, ถ้าไม่มีค่อยใช้ simulationDate */}
    อัพเดทข้อมูลล่าสุด วันที่{selectedDate ? formatThaiDateFull(selectedDate) : (simulationDate ? formatThaiDateFull(simulationDate.replace('2024', '2025')) : "-")}
</div>
    </div>
  );
}