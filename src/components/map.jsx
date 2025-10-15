import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useMemo } from "react";
import "../assets/css/leaflet.css"; 

// Component ช่วย Zoom
function MapUpdater({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

export default function RiverMap({
  onProvinceSelect,
  onDistrictSelect,
  selectedDayIndex = 0,
  selectedDate,
  selectedProvince,
  selectedDistrict
}) {
  const mapRef = useRef();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [allFloodData, setAllFloodData] = useState([]);

  const [level, setLevel] = useState("province");
  const [activeProvCode, setActiveProvCode] = useState("");
  const [activeAmpCode, setActiveAmpCode] = useState("");

  const NORTH_CODES = ["50", "51", "52", "53", "54", "55", "56", "57", "58"];
  const [highlightNorth, setHighlightNorth] = useState(false);
  const [mapView, setMapView] = useState({ center: [18.8, 99.0], zoom: 8, bounds: null });

  // 1. Fetch Data
  useEffect(() => {
    Promise.all([
      fetch("/data/provinces.geojson").then(r => r.json()),
      fetch("/data/districts.geojson").then(r => r.json()),
      fetch("/data/subdistricts.geojson").then(r => r.json()),
      fetch("http://127.0.0.1:8000/FloodData").then(r => r.json())
    ]).then(([p, d, s, fResponse]) => {
      setProvinces(p.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setDistricts(d.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setSubdistricts(s.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setAllFloodData(fResponse.data || []);
      console.log("✅ Data Loaded. Total rows:", fResponse.data ? fResponse.data.length : 0);
    }).catch(err => console.error("Error loading map data:", err));
  }, []);

  // 2. Sync Props & Zoom
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      const feature = districts.find(d => d.properties.amp_th === selectedDistrict);
      if (feature) {
        setActiveAmpCode(feature.properties.amp_code);
        setLevel("subdistrict");
        const layer = L.geoJSON(feature);
        setMapView({ bounds: layer.getBounds() });
      }
    } else if (selectedProvince && provinces.length > 0) {
      const feature = provinces.find(p => p.properties.pro_th === selectedProvince);
      if (feature) {
        setActiveProvCode(feature.properties.pro_code);
        setActiveAmpCode("");
        setLevel("district");
        const layer = L.geoJSON(feature);
        setMapView({ bounds: layer.getBounds() });
      }
    } else {
      setActiveProvCode("");
      setActiveAmpCode("");
      setLevel("province");
      setHighlightNorth(true);
      setMapView({ center: [18.8, 99.0], zoom: 8, bounds: null });
    }
  }, [selectedProvince, selectedDistrict, provinces, districts]);

  // 3. Filter Data by Date (Fixed Year 2024)
  const currentFloodData = useMemo(() => {
    if (!selectedDate || allFloodData.length === 0) return [];
    
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (selectedDayIndex + 1)); 
    
    // 🔥 FORCE YEAR 2024
    const year = "2024"; 
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`; 
    
    const filtered = allFloodData.filter(item => item.date === targetDateStr);
    return filtered;
  }, [allFloodData, selectedDate, selectedDayIndex]);

  // 4. Color Logic (Updated Aggregation Logic) 🔧
  const cleanStr = (str) => String(str || "").trim().replace(/\s+/g, '');

  const getSubdistrictColor = (properties) => {
    const mapCode = cleanStr(properties.tam_code);
    const mapName = cleanStr(properties.tam_th);

    const data = currentFloodData.find((d) => {
        const apiCode = cleanStr(d.subdistrict_code || d.tam_code);
        if (apiCode && apiCode === mapCode) return true;
        const apiName = cleanStr(d.subdistrict);
        if (apiName === mapName) return true;
        return false;
    });

    if (!data) return "#4caf50";

    const p1 = Number(data["Flood_T+1_Pred"]);
    const p2 = Number(data["Flood_T+2_Pred"]);
    const p3 = Number(data["Flood_T+3_Pred"]);
    
    if (selectedDayIndex === 0) { 
        if (p1 === 1) return "#d32f2f"; 
        if (p2 === 1 || p3 === 1) return "#fdd835"; 
    } 
    else if (selectedDayIndex === 1) { 
        if (p2 === 1) return "#d32f2f"; 
        if (p3 === 1) return "#fdd835"; 
    } 
    else if (selectedDayIndex === 2) { 
        if (p3 === 1) return "#d32f2f"; 
    }
    return "#4caf50";
  };

  // 🔴 ฟังก์ชันนี้ได้รับการปรับปรุงใหม่!
  const getAggregateColor = (properties, type) => {
    // ดึง Code และ Name จาก GeoJSON
    let mapCode, mapName;
    if (type === "province") {
        mapCode = cleanStr(properties.pro_code);
        mapName = cleanStr(properties.pro_th);
    } else {
        mapCode = cleanStr(properties.amp_code);
        mapName = cleanStr(properties.amp_th);
    }

    // กรองหาลูกๆ (ตำบล) ในพื้นที่นั้นๆ
    let children = currentFloodData.filter(d => {
      // เทียบจาก API
      let apiCode, apiName;
      if (type === "province") {
        apiCode = cleanStr(d.province_code);
        apiName = cleanStr(d.province);
      } else {
        apiCode = cleanStr(d.district_code);
        apiName = cleanStr(d.district);
      }
      
      // Match Code หรือ Match Name
      return (apiCode && apiCode === mapCode) || (apiName === mapName);
    });

    // 🔍 Debug: เช็คว่าเจอลูกๆ ไหม
    // if (children.length > 0) {
    //    console.log(`🔎 Group ${mapName}: Found ${children.length} subdistricts.`);
    // } else if (type === "district" && selectedProvince) {
    //    console.warn(`⚠️ Group ${mapName} (${type}) not found matches!`);
    // }

    if (children.length === 0) return "#4caf50";

    // นับจำนวนตำบลที่ได้รับผลกระทบ
    let affectedCount = children.filter(d => {
        const p1 = Number(d["Flood_T+1_Pred"]);
        const p2 = Number(d["Flood_T+2_Pred"]);
        const p3 = Number(d["Flood_T+3_Pred"]);
        
        // Logic การนับต้องตรงกับ Subdistrict
        if (selectedDayIndex === 0) return p1 === 1 || p2 === 1 || p3 === 1; // นับถ้ามีแนวโน้มด้วย (เพื่อให้เหลืองขึ้น)
        if (selectedDayIndex === 1) return p2 === 1 || p3 === 1;
        if (selectedDayIndex === 2) return p3 === 1;
        return false;
    }).length;

    let percent = (affectedCount / children.length) * 100;

    // Logic รวม: แดงถ้า > 40%, เหลืองถ้ามีอย่างน้อย 1 ตำบล
    if (percent > 40) return "#d32f2f";
    if (affectedCount >= 1) return "#fdd835";
    return "#4caf50";
  };

  const onFeatureClick = (feature) => {
    const p = feature.properties;
    if (level === "province") {
      onProvinceSelect?.(p.pro_th);
      onDistrictSelect?.(null);
    } else if (level === "district") {
      onDistrictSelect?.(p.amp_th);
    }
  };

  const styleFeature = (feature) => {
    const p = feature.properties;
    let color = "#ccc";
    if(level === "province") {
      // ส่ง properties ทั้งก้อนไปเลย เพื่อให้ match ชื่อได้
      color = getAggregateColor(p, "province");
    } else if(level === "district") {
      // ส่ง properties ทั้งก้อนไปเลย
      color = getAggregateColor(p, "district");
    } else if(level === "subdistrict") {
      color = getSubdistrictColor(p);
    }
    return { weight: 1, color: "white", fillOpacity: 0.7, fillColor: color };
  };

  const resetMap = () => {
    onProvinceSelect?.(null);
    onDistrictSelect?.(null);
  };

  let displayData = provinces;
  if (level === "district") displayData = districts.filter(d => d.properties.pro_code === activeProvCode);
  if (level === "subdistrict") displayData = subdistricts.filter(s => s.properties.amp_code === activeAmpCode);

  return (
    <div className="river-map-container">
      
      {/* ส่วนหัว */}
      <div className="map-card-header">
        <h2 className="font-bold mb-4 text-center text-xl text-gray-800">
          {selectedProvince ? `แผนที่จังหวัด${selectedProvince}` : "แผนที่ภาคเหนือ"}
        </h2>
        
        <div className="sidebar horizontal">
          <div className="sidebar-group">
             <label>จังหวัด</label>
             <select 
               value={selectedProvince || ""} 
               onChange={(e) => {
                 const val = e.target.value;
                 if(val) {
                   onProvinceSelect?.(val);
                   onDistrictSelect?.(null);
                 } else resetMap();
             }}>
               <option value="">-- เลือกจังหวัด --</option>
               {provinces.map(p => <option key={p.properties.pro_code} value={p.properties.pro_th}>{p.properties.pro_th}</option>)}
             </select>
          </div>

          <div className="sidebar-group">
             <label>อำเภอ</label>
             <select 
                value={selectedDistrict || ""} 
                disabled={!selectedProvince} 
                onChange={(e) => onDistrictSelect?.(e.target.value)}
             >
               <option value="">-- เลือกอำเภอ --</option>
               {districts
                 .filter(d => d.properties.pro_code === activeProvCode)
                 .map(d => <option key={d.properties.amp_code} value={d.properties.amp_th}>{d.properties.amp_th}</option>)}
             </select>
          </div>

          <div className="sidebar-group">
             <label>&nbsp;</label>
             <button onClick={resetMap}>
                 <span>🔄</span> ภาพรวม
             </button>
          </div>
        </div>
      </div>

      {/* ส่วนแผนที่ */}
      <div className="map-display-area">
        <MapContainer ref={mapRef} center={[18.8, 99.0]} zoom={8} minZoom={7} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater center={mapView.center} zoom={mapView.zoom} bounds={mapView.bounds} />
          <GeoJSON
            key={level + (selectedProvince||"") + (selectedDistrict||"") + selectedDayIndex + JSON.stringify(currentFloodData)}
            data={displayData}
            style={styleFeature}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip(feature.properties.pro_th || feature.properties.amp_th || feature.properties.tam_th);
              layer.on("click", () => onFeatureClick(feature));
            }}
          />
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="map-legend-container">
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: "#d32f2f" }}></div>
          <span>เกิดน้ำท่วม (&gt;40%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: "#fdd835" }}></div>
          <span>เสี่ยงเกิดน้ำท่วม (มีพื้นที่ท่วม)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color-box" style={{ backgroundColor: "#4caf50" }}></div>
          <span>ปกติ</span>
        </div>
      </div>

    </div>
  );
}