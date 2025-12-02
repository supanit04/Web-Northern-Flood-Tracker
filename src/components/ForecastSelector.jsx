import React from "react";
import "../assets/css/ForecastSelector.css"; 

export default function ForecastSelector({ selectedDate, onDateSelect, onDayIndexSelect }) {

  const today = new Date(2024, 9, 15); // ตั้งค่าเป็นวันที่ 15 ตุลาคม 2024
  const days = [0, 1, 2].map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return d;
  });

  const formatThaiDate = (date) => {
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="forecast-wrapper">
      
      {/* Card 1: เลือกวันที่ */}
      <div className="forecast-card selector-section">
        <div className="forecast-header">
          <div className="forecast-icon-wrapper">
            {/* SVG Icon */}
            <svg viewBox="0 0 24 24" fill="none" className="forecast-icon-svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
            <span className="forecast-icon-text">!</span>
          </div>
          <h2 className="forecast-title">คาดการณ์อุทกภัย 72 ชม.</h2>
        </div>

        <div className="forecast-list">
          {days.map((d, idx) => {
            const label = idx === 0 ? "วันนี้" : idx === 1 ? "พรุ่งนี้" : `วัน${d.toLocaleDateString("th-TH", { weekday: "long" })}`;
            const isSelected = selectedDate.toDateString() === d.toDateString();
            
            return (
              <button
                key={idx}
                onClick={() => {
                    onDateSelect(new Date(d));
                    onDayIndexSelect(idx); // Update Index (0,1,2)
                }}
                className={`forecast-btn ${isSelected ? "selected" : ""}`}
              >
                <span className="btn-text">{label} {formatThaiDate(d)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: แจ้งเตือนคงที่
      <div className="forecast-card alert-section">
        <div className="alert-header">
          <div className="siren-icon">🚨</div> 
          <h2 className="alert-title">แจ้งเตือน   สำหรับตรวจสอบเกิดน้ำท่วมในหลายพื้นที่</h2>
        </div>
        <hr className="alert-divider" />
        <div className="alert-content">
          <p>
            <strong>กรุณาตรวจสอบ ระวังและหลีกเลี่ยงการสัญจร</strong>
            
          </p>
        </div>
      </div> */}

    </div>
  );
}