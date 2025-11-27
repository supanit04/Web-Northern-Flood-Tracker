// src/components/RiverStations.jsx
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

// 🔹 สร้าง Chart Data จาก JSON และ simulation
const generateChartData = (data, selectedStation, simulationDateStr) => {
  const stationData = data.filter((d) => d.station === selectedStation);
  if (stationData.length === 0) return [];

  const latestPrediction = stationData[0];
  const predValue = latestPrediction.WaterLevel_Pred;
  const baseValue = predValue > 4.5 ? 3.5 : predValue;

  let chartPoints = [];

  for (let i = 30; i >= 0; i--) {
    const currentDate = new Date(simulationDateStr);
    currentDate.setDate(currentDate.getDate() - i);
    const dateStr = currentDate.toISOString().split("T")[0];

    let simulatedActual = baseValue;

    if (i > 10 && i <= 30) {
      simulatedActual = baseValue + Math.cos(i / 3) * 0.3 + i * 0.005;
    } else if (i <= 7 && i > 3) {
      simulatedActual = 3.25 + Math.sin(i * 1.5) * 0.8 + 1.5;
    } else if (i <= 3 && i > 0) {
      simulatedActual = 3.6 + Math.sin(i * 0.8) * 0.2;
    }

    if (i === 0) simulatedActual = predValue;

    chartPoints.push({
      date: dateStr,
      Actual: parseFloat(simulatedActual.toFixed(2)),
      Forecast: null,
    });
  }

  const lastActualValue = chartPoints[chartPoints.length - 1].Actual;

  for (let i = 1; i <= 3; i++) {
    const futureDate = new Date(simulationDateStr);
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr = futureDate.toISOString().split("T")[0];

    let simulatedForecast = lastActualValue;
    if (i === 1) simulatedForecast = lastActualValue - 0.15;
    else if (i === 2) simulatedForecast = lastActualValue - 0.05;
    else if (i === 3) simulatedForecast = lastActualValue + 0.3;

    chartPoints.push({
      date: dateStr,
      Actual: null,
      Forecast: parseFloat(simulatedForecast.toFixed(2)),
    });
  }

  return chartPoints;
};

export default function RiverStations({
  provinceFilter = null,
  districtFilter = null,
  scrollToSelf = false,
}) {
  const [riverData, setRiverData] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationDate, setSimulationDate] = useState(null);
  const componentRef = useRef(null);

  // 🔹 Scroll auto
  useEffect(() => {
    if (scrollToSelf && componentRef.current) {
      componentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollToSelf]);

  // 🔹 Fetch River Data
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/RiverData")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setRiverData(data.data || []);
          setSimulationDate(data.simulation_date_used);
        } else {
          setRiverData([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🔹 Filtered Data
  const filteredData = useMemo(() => {
    return riverData.filter((d) => {
      const provinceMatch = provinceFilter ? d.province === provinceFilter : true;
      const districtMatch = districtFilter ? d.district === districtFilter : true;
      return provinceMatch && districtMatch;
    });
  }, [riverData, provinceFilter, districtFilter]);

  // 🔹 ดึง unique stations และตั้งค่าเริ่มต้น
  useEffect(() => {
    const uniqueStations = [...new Set(filteredData.map((d) => d.station))];
    setStations(uniqueStations);

    setSelectedStation((prev) => prev || uniqueStations[0] || "");
  }, [filteredData]);

  // 🔹 Chart Data
  const chartData =
    simulationDate && selectedStation
      ? generateChartData(filteredData, selectedStation, simulationDate)
      : [];

  const allValues = chartData.flatMap((d) => [d.Actual, d.Forecast]).filter((v) => v !== null);
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 5.0;
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 3.0;

  return (
    <div className="river-stations-container" ref={componentRef}>
      {/* Header & Dropdown */}
      <div className="headers-wrapper">
        <div className="logo-placeholder">
          <img src="public/creek.png" alt="" />
        </div>
        <div className="title-and-controls">


  <div className="title">ปริมาณน้ำในแม่น้ำวันนี้</div>
<div className="station-select-center">
  <div className="station-select-group-custom">
    {/* Label บน dropdown */}
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
          {loading ? "กำลังโหลด..." : "เลือกสถานี"}
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
          <LineChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#ffffffff" }}
              tickFormatter={(tick) => tick.slice(5)}
            />
            <YAxis
              label={{ value: "Water Height (m)", angle: -90, position: "insideLeft", fill: "#333" }}
              domain={[dataMin - 0.1, dataMax + 0.1]}
              tick={{ fontSize: 10, fill: "#ffffffff" }}
              tickCount={10}
            />
            <Tooltip
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value, name) => [`${value !== null ? value.toFixed(2) : "-"} m`, name]}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ top: 0, right: 0 }} />
            <Line
              type="monotone"
              dataKey="Actual"
              name="Actual"
              stroke="#4169E1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4169E1" }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="Forecast"
              name="Forecast"
              stroke="#DC143C"
              strokeWidth={2}
              dot={{ r: 3, fill: "#DC143C" }}
              activeDot={{ r: 5 }}
              strokeDasharray="5 5"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="date-caption">
        ข้อมูลจัดทำ ณ วันที่ {simulationDate || "-"}
      </div>
    </div>
  );
}
