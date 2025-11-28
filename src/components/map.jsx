import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "../assets/css/leaflet.css";

export default function RiverMap({onProvinceSelect, onDistrictSelect,}) {
  const mapRef = useRef();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [floodData, setFloodData] = useState([]);

  const [level, setLevel] = useState("province");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const NORTH_CODES = ["50","51","52","53","54","55","56","57","58"];
  const [highlightNorth, setHighlightNorth] = useState(false);

  // Load GeoJSON + Flood Data
  useEffect(() => {
    Promise.all([
      fetch("src/provinces.geojson").then(r => r.json()), // ระวังเรื่อง path
      fetch("src/districts.geojson").then(r => r.json()),
      fetch("src/subdistricts.geojson").then(r => r.json()),
      fetch("src/flood_data.json").then(r => r.json())
    ]).then(([p, d, s, f]) => {
      setProvinces(p.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setDistricts(d.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setSubdistricts(s.features.filter(x => NORTH_CODES.includes(x.properties.pro_code)));
      setFloodData(f);
    });
  }, []);

  
const zoomToFeature = (feature) => {
  const map = mapRef.current;
  if (!map || !feature) return;

  const layer = L.geoJSON(feature);              // สร้างชั้นชั่วคราวจาก GeoJSON
  const bounds = layer.getBounds();              // หา bounds ของ feature
  map.fitBounds(bounds, { padding: [50, 50] });  // ซูม fitBounds พร้อม padding
};
  const getSubdistrictColor = (code) => {
    const data = floodData.find((d) => d.subdistrict_code === code);
    if (!data) return "#4caf50";

    let [today, tmr, next] = data.forecast;
    if (today === 1) return "#d32f2f"; 
    if (tmr === 1 || next === 1) return "#fdd835"; 
    return "#4caf50";
  };

  const getAggregateColor = (code, type) => {
  if (highlightNorth && type === "province") {
    return "#4caf50"; // ตัวอย่างสีไฮไลท์จังหวัดภาคเหนือ
  }

  let children = floodData.filter(d =>
    type === "province"
      ? d.province_code === code
      : d.district_code === code
  );

  if (children.length === 0) return "#4caf50";

  let flooded = children.filter(d => d.forecast[0] === 1).length;
  let percent = (flooded / children.length) * 100;

  if (percent > 20) return "#d32f2f";
  if (percent > 0) return "#f57f17";
  return "#4caf50";
};

  const onFeatureClick = (feature) => {
  const p = feature.properties;

  if (level === "province") {
    setSelectedProvince(p.pro_code);
    setLevel("district");
    setHighlightNorth(false);  // ปิด highlight
    onProvinceSelect?.(p.pro_code);
    onDistrictSelect?.("");
  } 
  else if (level === "district") {
    setSelectedDistrict(p.amp_code);
    setLevel("subdistrict");
    onDistrictSelect?.(p.amp_code);
  }
};


 const styleFeature = (feature) => {
  const p = feature.properties;
  let color = "#ccc";

  if(level === "province") {
    if(highlightNorth && NORTH_CODES.includes(p.pro_code)) {
      color = "#4caf50"; // ไฮไลท์ภาคเหนือ
    } else {
      color = getAggregateColor(p.pro_code, "province");
    }
  } 
  else if(level === "district") {
    color = getAggregateColor(p.amp_code, "district");
  } 
  else if(level === "subdistrict") {
    color = getSubdistrictColor(p.tam_code);
  }

  return {
    weight: 1,
    color: "white",
    fillOpacity: 0.7,
    fillColor: color
  };
};

  const resetMap = () => {
  setLevel("province");
  setSelectedProvince("");
  setSelectedDistrict("");
  setHighlightNorth(true); // 🌟 ไฮไลท์จังหวัดภาคเหนือ
};

  // Pick what to show
  let displayData = provinces;
  if (level === "district") displayData = districts.filter(d => d.properties.pro_code === selectedProvince);
  if (level === "subdistrict") displayData = subdistricts.filter(s => s.properties.amp_code === selectedDistrict);

  return (
  <div className="map-layout-vertical">
    
    {/* Sidebar */}
  <div className="sidebar horizontal">

  <div className="sidebar-group">
    <label>จังหวัด</label>
    <select
      value={selectedProvince}
      onChange={(e) => {
        const code = e.target.value;
        setSelectedProvince(code);
        setSelectedDistrict("");
        setLevel("district");
        onProvinceSelect?.(code);
        onDistrictSelect?.("");

        const feature = provinces.find(p => p.properties.pro_code === code);
  if (feature) zoomToFeature(feature);
      }}
    >
      <option value="">-- เลือกจังหวัด --</option>
      {provinces
        .sort((a, b) => a.properties.pro_th.localeCompare(b.properties.pro_th))
        .map((p) => (
          <option key={p.properties.pro_code} value={p.properties.pro_code}>
            {p.properties.pro_th}
          </option>
        ))}
    </select>
  </div>

  <div className="sidebar-group">
    <label>อำเภอ</label>
    <select
      disabled={!selectedProvince}
      value={selectedDistrict}
      onChange={(e) => {
        const code = e.target.value;
  setSelectedDistrict(code);
  setLevel("subdistrict");
  onDistrictSelect?.(code);

   const feature = districts.find(d => d.properties.amp_code === code);
  if (feature) zoomToFeature(feature);
      }}
    >
      <option value="">-- เลือกอำเภอ --</option>
      {districts
        .filter((d) => d.properties.pro_code === selectedProvince)
        .sort((a, b) => a.properties.amp_th.localeCompare(b.properties.amp_th))
        .map((d) => (
          <option key={d.properties.amp_code} value={d.properties.amp_code}>
            {d.properties.amp_th}
          </option>
        ))}
    </select>
  </div>

<div className="sidebar-group">
      <label>&nbsp;</label> {/* เว้นให้ label สวย */}
      <button onClick={resetMap}>🔄ภาพรวม</button>
    </div>
</div>

  {/* Map */}
  <MapContainer
    ref={mapRef}
    center={[18.8, 99.0]}
    zoom={8}
    minZoom={7}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <GeoJSON
      key={level + selectedProvince + selectedDistrict}
      data={displayData}
      style={styleFeature}
      onEachFeature={(feature, layer) => {
        layer.bindTooltip(
          feature.properties.pro_th ||
          feature.properties.amp_th ||
          feature.properties.tam_th
        );
        layer.on("click", () => onFeatureClick(feature));
      }}
    />
  </MapContainer>
<div style={{ marginTop: "8px", display: "flex", gap: "16px", justifyContent: "center" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div style={{ width: "20px", height: "20px", backgroundColor: "#d32f2f" }}></div>
    <span>เกิดน้ำท่วม</span>
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div style={{ width: "20px", height: "20px", backgroundColor: "#fdd835" }}></div>
    <span>เสี่ยงเกิดน้ำท่วม</span>
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div style={{ width: "20px", height: "20px", backgroundColor: "#4caf50" }}></div>
    <span>ปกติ</span>
  </div>
  </div>
</div>
);
} 
