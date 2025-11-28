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

  const getSubdistrictColor = (code) => {
    const data = floodData.find((d) => d.subdistrict_code === code);
    if (!data) return "#2438bdff";

    let [today, tmr, next] = data.forecast;
    if (today === 1) return "#d32f2f"; 
    if (tmr === 1 || next === 1) return "#fdd835"; 
    return "#4caf50";
  };

  const getAggregateColor = (code, type) => {
  if (highlightNorth && type === "province") {
    return "#80aaffff"; // ตัวอย่างสีไฮไลท์จังหวัดภาคเหนือ
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
      color = "#8093ffff"; // ไฮไลท์ภาคเหนือ
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
  };

  // Pick what to show
  let displayData = provinces;
  if (level === "district") displayData = districts.filter(d => d.properties.pro_code === selectedProvince);
  if (level === "subdistrict") displayData = subdistricts.filter(s => s.properties.amp_code === selectedDistrict);

  return (
  <div className="map-layout">
    
    {/* Sidebar */}
    <div className="sidebar">

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


    const provinceFeature = provinces.find(p => p.properties.pro_code === code);
    if (provinceFeature && mapRef.current) {
      const layer = L.geoJSON(provinceFeature);
      mapRef.current.fitBounds(layer.getBounds());
    }
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

      <label>อำเภอ</label>
      <select
        disabled={!selectedProvince}
        value={selectedDistrict}
        onChange={(e) => {
          setSelectedDistrict(e.target.value);
          setLevel("subdistrict");
          onDistrictSelect?.(e.target.value);
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

      <button
       onClick={() => {
    setLevel("province");
    setSelectedProvince("");
    setSelectedDistrict("");
    setHighlightNorth(true); // เปิด highlight
    if (mapRef.current) {
      mapRef.current.setView([18.8, 99.0], 8);
    }
  }}
>
  🔄 ภาพรวม
      </button>
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

  </div>
);
}
