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
  selectedProvince, // รับชื่อจังหวัด (Name)
  selectedDistrict  // รับชื่ออำเภอ (Name)
}) {
  const mapRef = useRef();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [allFloodData, setAllFloodData] = useState([]);

  const [level, setLevel] = useState("province");
  
  // แปลงชื่อเป็นรหัสเพื่อใช้ใน Map Logic
  const [activeProvCode, setActiveProvCode] = useState(""); 
  const [activeAmpCode, setActiveAmpCode] = useState("");

  const NORTH_CODES = ["50","51","52","53","54","55","56","57","58"];
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
    }).catch(err => console.error("Error loading map data:", err));
  }, []);

  // 2. Sync Props (Name) -> Internal State (Code) & Zoom
  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      // หา Code จากชื่ออำเภอ
      const feature = districts.find(d => d.properties.amp_th === selectedDistrict);
      if (feature) {
        setActiveAmpCode(feature.properties.amp_code);
        setLevel("subdistrict");
        const layer = L.geoJSON(feature);
        setMapView({ bounds: layer.getBounds() });
      }
    } else if (selectedProvince && provinces.length > 0) {
      // หา Code จากชื่อจังหวัด
      const feature = provinces.find(p => p.properties.pro_th === selectedProvince);
      if (feature) {
        setActiveProvCode(feature.properties.pro_code);
        setActiveAmpCode(""); // Reset อำเภอ
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

  // 3. Filter Data ตามวันที่ (Logic ย้อนหลัง)
  const currentFloodData = useMemo(() => {
    if (!selectedDate || allFloodData.length === 0) return [];

    const d = new Date(selectedDate);
    // สูตร: วันที่เลือก - (Index + 1)
    d.setDate(d.getDate() - (selectedDayIndex + 1)); 

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const targetDateStr = `2024-${month}-${day}`; 

    return allFloodData.filter(item => item.date === targetDateStr);
  }, [allFloodData, selectedDate, selectedDayIndex]);

  // 4. Color Logic
  const getSubdistrictColor = (code) => {
    const data = currentFloodData.find((d) => d.subdistrict_code === code || d.subdistrict === code); 
    if (!data) return "#4caf50"; 

    const p1 = data["Flood_T+1_Pred"];
    const p2 = data["Flood_T+2_Pred"];
    const p3 = data["Flood_T+3_Pred"];
    
    let status;
    if (selectedDayIndex === 0) status = p1;
    else if (selectedDayIndex === 1) status = p2;
    else status = p3;

    if (status === 2) return "#d32f2f"; 
    if (status === 1) return "#fdd835"; 
    return "#4caf50"; 
  };

  const getAggregateColor = (code, type) => {
    if (highlightNorth && type === "province") return "#4caf50"; 

    let children = currentFloodData.filter(d =>
      type === "province"
        ? d.province_code === code || d.province === code
        : d.district_code === code || d.district === code
    );

    if (children.length === 0) return "#4caf50";

    let affectedCount = children.filter(d => {
        const p1 = d["Flood_T+1_Pred"];
        const p2 = d["Flood_T+2_Pred"];
        const p3 = d["Flood_T+3_Pred"];
        let status;
        if (selectedDayIndex === 0) status = p1;
        else if (selectedDayIndex === 1) status = p2;
        else status = p3;
        return status > 0; 
    }).length;

    let percent = (affectedCount / children.length) * 100;

    if (percent > 40) return "#d32f2f"; 
    if (percent > 20) return "#fdd835";
    return "#4caf50";
  };

  // 5. Click Event (ส่งชื่อแทนรหัส)
  const onFeatureClick = (feature) => {
    const p = feature.properties;
    if (level === "province") {
      onProvinceSelect?.(p.pro_th); // 🔥 ส่งชื่อไทยกลับไป
      onDistrictSelect?.(null);
    } else if (level === "district") {
      onDistrictSelect?.(p.amp_th); // 🔥 ส่งชื่อไทยกลับไป
    }
  };

  const styleFeature = (feature) => {
    const p = feature.properties;
    let color = "#ccc";

    if(level === "province") {
      if(highlightNorth && NORTH_CODES.includes(p.pro_code)) color = "#4caf50"; 
      else color = getAggregateColor(p.pro_code, "province");
    } else if(level === "district") {
      color = getAggregateColor(p.amp_code, "district");
    } else if(level === "subdistrict") {
      color = getSubdistrictColor(p.tam_code);
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
    
    <div className="map-layout-vertical">
      
      <div className="sidebar horizontal">
        <div className="sidebar-group">
           <label>จังหวัด</label>
           <select value={selectedProvince || ""} onChange={(e) => {
               const val = e.target.value;
               if(val) {
                 onProvinceSelect?.(val); // ส่งชื่อ
                 onDistrictSelect?.(null);
               } else resetMap();
           }}>
             <option value="">-- เลือกจังหวัด --</option>
             {provinces.map(p => <option key={p.properties.pro_code} value={p.properties.pro_th}>{p.properties.pro_th}</option>)}
           </select>
        </div>
        <div className="sidebar-group">
           <label>อำเภอ</label>
           <select value={selectedDistrict || ""} disabled={!selectedProvince} onChange={(e) => {
               onDistrictSelect?.(e.target.value); // ส่งชื่อ
           }}>
             <option value="">-- เลือกอำเภอ --</option>
             {districts
               .filter(d => d.properties.pro_code === activeProvCode)
               .map(d => <option key={d.properties.amp_code} value={d.properties.amp_th}>{d.properties.amp_th}</option>)}
           </select>
        </div>
        <div className="sidebar-group">
           <button onClick={resetMap}>🔄ภาพรวม</button>
        </div>
      </div>

      <MapContainer ref={mapRef} center={[18.8, 99.0]} zoom={8} minZoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater center={mapView.center} zoom={mapView.zoom} bounds={mapView.bounds} />
        <GeoJSON
          // 🔥 เพิ่ม currentFloodData.length ใน Key เพื่อบังคับวาดใหม่เมื่อข้อมูลมา
          key={level + (selectedProvince||"") + (selectedDistrict||"") + selectedDayIndex + currentFloodData.length}
          data={displayData}
          style={styleFeature}
          onEachFeature={(feature, layer) => {
            layer.bindTooltip(feature.properties.pro_th || feature.properties.amp_th || feature.properties.tam_th);
            layer.on("click", () => onFeatureClick(feature));
          }}
        />
      </MapContainer>
      
      <div style={{ marginTop: "8px", display: "flex", gap: "16px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#d32f2f" }}></div><span>เกิดน้ำท่วม (&gt;40%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#fdd835" }}></div><span>เสี่ยง (&gt;20%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "#4caf50" }}></div><span>ปกติ</span>
        </div>
      </div>
    </div>
  );
}