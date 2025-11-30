import React, { useEffect, useState, useMemo } from "react";
import "../assets/css/Prediction.css";

export default function Prediction({ provinceFilter = null, districtFilter = null, selectedDate, selectedDayIndex = 0 }) {
  const [floodData, setFloodData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [pageInput, setPageInput] = useState(1);

  // 1. Fetch Data
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/FloodData")
      .then((res) => res.json())
      .then((data) => {
        setFloodData(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setFloodData([]);
        setLoading(false);
      });
  }, []);

  // 2. Filter Logic (สูตรคำนวณย้อนหลังตาม Model Logic)
  const filteredData = useMemo(() => {
    if (loading || floodData.length === 0) return [];

    let targetDateStr = "";

    if (selectedDate) {
      const d = new Date(selectedDate);
      
      // -------------------------------------------------------------
      // 🔥 LOGIC แก้ไขตามที่คุณอธิบาย:
      // โมเดลทำนายวันที่ 29 -> T+1 คือ 30, T+2 คือ 1, T+3 คือ 2
      // ดังนั้นถ้า User เลือกวันที่ 30 (Index 0) เราต้องย้อนกลับไปหา 29
      // สูตร: วันที่เลือก - (Index + 1)
      // -------------------------------------------------------------
      d.setDate(d.getDate() - (selectedDayIndex + 1));

      // แปลงเป็น String ปี 2024 เพื่อเทียบกับ Database (Demo Mode)
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      targetDateStr = `2024-${month}-${day}`;
      
      // console.log(`Button Index: ${selectedDayIndex}, Selected: ${selectedDate.getDate()}, Looking for Base Date: ${targetDateStr}`);
    }

    return floodData.filter((item) => {
      const provinceMatch = provinceFilter ? item.province === provinceFilter : true;
      const districtMatch = districtFilter ? item.district === districtFilter : true;
      
      // เทียบกับวันที่ Base Date (29) ที่เราคำนวณได้
      const dateMatch = targetDateStr ? item.date === targetDateStr : true;

      return provinceMatch && districtMatch && dateMatch;
    });
  }, [floodData, provinceFilter, districtFilter, selectedDate, selectedDayIndex, loading]);

  // 3. Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput(1);
  }, [provinceFilter, districtFilter, itemsPerPage, selectedDate, selectedDayIndex]);

  const changePage = (direction) => {
    let newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setPageInput(newPage);
    }
  };

  const handlePageInput = (e) => {
    const val = Number(e.target.value);
    setPageInput(e.target.value);
    if (val >= 1 && val <= totalPages) setCurrentPage(val);
  };

  // 4. Status Logic (เลือก T+1, T+2, T+3 ให้ตรงกับปุ่ม)
  const getStatusInfo = (item) => {
    const p1 = item["Flood_T+1_Pred"]; // ผลลัพธ์ของ T+1 (วันที่ 30)
    const p2 = item["Flood_T+2_Pred"]; // ผลลัพธ์ของ T+2 (วันที่ 1)
    const p3 = item["Flood_T+3_Pred"]; // ผลลัพธ์ของ T+3 (วันที่ 2)

    let targetValue;

    // ถ้ากดปุ่มแรก (Index 0) -> โชว์ค่า T+1
    if (selectedDayIndex === 0) {
        targetValue = p1; 
    } 
    // ถ้ากดปุ่มสอง (Index 1) -> โชว์ค่า T+2
    else if (selectedDayIndex === 1) {
        targetValue = p2; 
    } 
    // ถ้ากดปุ่มสาม (Index 2) -> โชว์ค่า T+3
    else {
        targetValue = p3; 
    }

    if (targetValue === 2) return { label: "เกิดน้ำท่วม", className: "status-flood" };
    if (targetValue === 1) return { label: "เฝ้าระวัง", className: "status-warning" };
    return { label: "ปกติ", className: "status-normal" };
  };

  // Helper date format
  const formatDateThai = (dateInput) => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="prediction-wrapper">
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>จังหวัด</th>
                <th style={{ width: "25%" }}>อำเภอ</th>
                <th style={{ width: "25%" }}>ตำบล</th>
                <th style={{ width: "25%", textAlign: "center" }}>สถานการณ์</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="no-data">กำลังโหลดข้อมูล...</td></tr>
              ) : paginatedData.length > 0 ? (
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
                    ไม่พบข้อมูลสำหรับวันที่ {formatDateThai(selectedDate)}
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
            <select className="items-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="footer-right">
            <span className="showing-text">แสดง {totalItems === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + itemsPerPage, totalItems)} จาก {totalItems}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => changePage(-1)} disabled={currentPage === 1}>←</button>
              <input type="number" className="page-input" value={pageInput} onChange={handlePageInput} />
              <button className="page-btn" onClick={() => changePage(1)} disabled={currentPage === totalPages}>→</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ส่วนวันที่ด้านล่าง */}
      <div className="update-label">
        ข้อมูลพยากรณ์ประจำวันที่ {formatDateThai(selectedDate || new Date())}
      </div>
    </div>
  );
}