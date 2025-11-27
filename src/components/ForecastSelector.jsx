import React from "react";
import "../assets/css/ForecastSelector.css"; // ตรวจสอบ path ให้ถูกต้อง

export default function ForecastSelector({ selectedDate, onDateSelect }) {
  const today = new Date();

  // สร้างวันที่ล่วงหน้า
  const day1 = new Date(today);
  const day2 = new Date(today);
  day2.setDate(today.getDate() + 1);
  const day3 = new Date(today);
  day3.setDate(today.getDate() + 2);

  const days = [day1, day2, day3];

  // ฟอร์แมตวันที่แบบย่อ (เช่น 30 ส.ค. 2568)
  const formatThaiDate = (date) => {
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short", // ใช้ชื่อเดือนย่อ
      year: "numeric",
    });
  };

  return (
    <div className="forecast-wrapper">
      
      {/* --- Card 1: ฝั่งซ้าย (เลือกวันที่) --- */}
      <div className="forecast-card selector-section">
        <div className="forecast-header">
          {/* ไอคอนป้ายสีเหลือง */}
          <div className="forecast-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" className="forecast-icon-svg">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="forecast-icon-text">!</span>
          </div>
          <h2 className="forecast-title">
            คาดการณ์อุทกภัย 72 ชั่วโมงล่วงหน้า
          </h2>
        </div>

        {/* ปุ่มเรียงแนวตั้ง */}
        <div className="forecast-list">
          {days.map((d, idx) => {
            const label =
              idx === 0
                ? "สถานการณ์วันนี้"
                : idx === 1
                ? "สถานการณ์พรุ่งนี้"
                : `สถานการณ์วัน${d.toLocaleDateString("th-TH", { weekday: "long" })}`;

            // เช็คว่าเลือกวันไหนอยู่ (เทียบ String เพื่อความแม่นยำ)
            const isSelected = selectedDate.toDateString() === d.toDateString();

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(new Date(d))}
                className={`forecast-btn ${isSelected ? "selected" : ""}`}
              >
                <span className="btn-text">
                  {label} {formatThaiDate(d)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Card 2: ฝั่งขวา (แจ้งเตือน) --- */}
      <div className="forecast-card alert-section">
        <div className="alert-header">
          {/* ไอคอนไซเรน (ใช้ Emoji หรือ SVG ก็ได้) */}
          <div className="siren-icon">🚨</div> 
          <h2 className="alert-title">แจ้งเตือน</h2>
        </div>
        
        <hr className="alert-divider" />
        
        <div className="alert-content">
          <p>
            <strong>โปรดระวัง เกิดน้ำท่วมรุนแรงในหลายพื้นที่ต่อเนื่อง</strong>
            <br />
            กรุณาตรวจสอบ ระวังและหลีกเลี่ยงการสัญจร
          </p>
        </div>
      </div>

    </div>
  );
}