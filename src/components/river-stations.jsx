import React, { useEffect, useState } from "react";
import "../assets/css/river-stations.css";

export default function StationCards({ provinceFilter }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/flooddata")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setStations(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  // กรองตามจังหวัดที่เลือก
  const filteredStations = provinceFilter
    ? stations.filter((s) => s.Province === provinceFilter)
    : stations;

  return (
    <div className="dam-cards">
      {filteredStations.map((station) => {
        const bgColor =
          station.WaterHeight >= 5
            ? "bg-red-100"
            : station.WaterHeight >= 2
            ? "bg-yellow-100"
            : "bg-green-100";

        return (
          <div
            key={`${station.Station}-${station.District}`}
            className={`card ${bgColor}`}
          >
            <h3>{station.Station}</h3>
            <p>
              <strong>Province:</strong> {station.Province}
            </p>
            <p>
              <strong>District:</strong> {station.District}
            </p>
            <p>
              <strong>Subdistrict:</strong> {station.Subdistrict}
            </p>
            <p>
              <strong>Water Height:</strong> {station.WaterHeight} m
            </p>
            <p>
              <strong>River:</strong> {station.RiverName}
            </p>
          </div>
        );
      })}
    </div>
  );
}
