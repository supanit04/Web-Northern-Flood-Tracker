import React, { useEffect, useState, useMemo } from "react";
import "../assets/css/Prediction.css";

export default function Prediction({ provinceFilter = null, districtFilter = null, selectedDate }) {
  const [floodData, setFloodData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState(1); // สำหรับช่องกรอกเลขหน้า

  // -------------------------
  // Fetch Data
  // -------------------------
  useEffect(() => {
    // จำลองการ Fetch (หรือใช้ URL จริงของคุณ)
    fetch("http://127.0.0.1:8000/FloodData")
      .then((res) => res.json())
      .then((data) => setFloodData(data.data || []))
      .catch((err) => console.error(err));
  }, []);


  // -------------------------
  // 2. Filter & Date Logic (DEMO 2024 Mode)
  // -------------------------
  const filteredData = useMemo(() => {
    let targetDateStr = "";

    if (selectedDate) {
      const d = new Date(selectedDate);
      
      // ดึง เดือน และ วัน จากวันที่ที่เลือก
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      // 🔥 HARDCODE: บังคับให้เป็นปี 2024 เสมอ เพื่อดึงข้อมูล Demo
      targetDateStr = `2024-${month}-${day}`;
      
      console.log("Selected:", selectedDate, "Filter use:", targetDateStr); // เช็คใน Console ดูได้
    }

    return floodData.filter((item) => {
      const provinceMatch = provinceFilter ? item.province === provinceFilter : true;
      const districtMatch = districtFilter ? item.district === districtFilter : true;

      // เทียบกับ string "2024-MM-DD" ใน JSON
      const dateMatch = targetDateStr ? item.date === targetDateStr : true;

      return provinceMatch && districtMatch && dateMatch;
    });
  }, [floodData, provinceFilter, districtFilter, selectedDate]);

  // -------------------------
  // Pagination Logic
  // -------------------------
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  // Reset หน้าเมื่อ Filter เปลี่ยน
  useEffect(() => {
    setCurrentPage(1);
    setPageInput(1);
  }, [provinceFilter, districtFilter, itemsPerPage, selectedDate]);

  // Handle เปลี่ยนหน้าด้วยการพิมพ์
  const handlePageInputChange = (e) => {
    const val = e.target.value;
    setPageInput(val);
    const num = Number(val);
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  // Handle ปุ่มลูกศร
  const changePage = (direction) => {
    let newPage = currentPage + direction;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setCurrentPage(newPage);
    setPageInput(newPage);
  };

  // -------------------------
  // Helper: Status Style
  // -------------------------
  const getStatusInfo = (item) => {
    const preds = [
      item["Flood_T+1_Pred"],
      item["Flood_T+2_Pred"],
      item["Flood_T+3_Pred"]
    ].filter((v) => v !== undefined && v !== null);

    // เช็คเงื่อนไข (ปรับตาม Business Logic ของคุณ)
    if (preds.some((p) => p === 2)) return { label: "เกิดน้ำท่วม", className: "status-flood" };
    if (preds.some((p) => p === 1)) return { label: "เฝ้าระวัง", className: "status-warning" };
    return { label: "ปกติ", className: "status-normal" };
  };

  // -------------------------
  // Helper: Date Format (ไทย)
  // -------------------------
  const formatDateThai = (dateInput) => {
    if (!dateInput) return "ข้อมูลล่าสุด";
    const d = new Date(dateInput);
    if (isNaN(d)) return dateInput;
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="prediction-wrapper">
      {/* Table Card */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "20%", textAlign: "center" }}>จังหวัด</th>
                <th style={{ width: "20%", textAlign: "center" }}>อำเภอ</th>
                <th style={{ width: "30%", textAlign: "center" }}>ตำบล</th>
                <th style={{ width: "30%", textAlign: "center" }}>สถานการณ์</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const status = getStatusInfo(item);
                  return (
                    <tr key={idx}>
                      <td>{item.province}</td>
                      <td>{item.district}</td>
                      <td>{item.subdistrict}</td>
                      <td align="center">
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <div className="footer-left">
            <span>จำนวนแถวต่อหน้า</span>
            <select
              className="items-select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="footer-right">
            <span className="showing-text">
              แสดงรายการ {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + itemsPerPage, totalItems)} จาก {totalItems} รายการ
            </span>
            
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => changePage(-1)} 
                disabled={currentPage === 1}
              >
                ←
              </button>
              <input 
                type="number" 
                className="page-input" 
                value={pageInput} 
                onChange={handlePageInputChange}
                min={1}
                max={totalPages}
              />
              <button 
                className="page-btn" 
                onClick={() => changePage(1)} 
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Text Outside */}
      <div className="update-label">
        อัพเดทข้อมูลล่าสุด วันที่ {formatDateThai(selectedDate || new Date())}
      </div>
    </div>
  );
}