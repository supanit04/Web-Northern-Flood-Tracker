import React, { useEffect, useState, useMemo } from "react";
import "../assets/css/Prediction.css";

export default function Prediction({ provinceFilter = null, districtFilter = null }) {
  const [floodData, setFloodData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch JSON
  useEffect(() => {
    fetch("http://127.0.0.1:8000/FloodData")
      .then((res) => res.json())
      .then((data) => {
        console.log("FloodData fetched:", data);
        setFloodData(data.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // กำหนดสถานะ badge (รองรับทั้ง Flood_T+1_Pred และ Flood_T_1_Pred)
  const getStatus = (item) => {
    const preds = [
      item["Flood_T+1_Pred"] ?? item["Flood_T_1_Pred"],
      item["Flood_T+2_Pred"] ?? item["Flood_T_2_Pred"],
      item["Flood_T+3_Pred"] ?? item["Flood_T_3_Pred"],
    ].filter(v => v !== undefined && v !== null);

    if (preds.some(p => p === 2)) return "น้ำท่วม";
    if (preds.some(p => p === 1)) return "เฝ้าระวัง";
    return "ปกติ";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "น้ำท่วม": return "status-badge status-flood";
      case "เฝ้าระวัง": return "status-badge status-watch";
      default: return "status-badge status-ok";
    }
  };

  // Filter province / district
  const filteredData = useMemo(() => {
    return floodData.filter(d => {
      const provinceMatch = provinceFilter ? d.province === provinceFilter : true;
      const districtMatch = districtFilter ? d.district === districtFilter : true;
      return provinceMatch && districtMatch;
    });
  }, [floodData, provinceFilter, districtFilter]);

  // Pagination
  const totalPages = filteredData.length > 0 ? Math.ceil(filteredData.length / itemsPerPage) : 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => setCurrentPage(1), [provinceFilter, districtFilter, itemsPerPage]);

  return (
    <div className="prediction-panel">
      <div className="prediction-table-wrap">
        <table className="prediction-table">
          <thead>
            <tr>
              <th>จังหวัด</th>
              <th>อำเภอ</th>
              <th>ตำบล</th>
              <th>สถานการณ์</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => {
                const status = getStatus(item);
                return (
                  <tr key={idx} className={status !== "ปกติ" ? "highlight-row" : ""}>
                    <td>{item.province}</td>
                    <td>{item.district}</td>
                    <td>{item.subdistrict}</td>
                    <td>
                      <span className={getStatusClass(status)}>{status}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "12px" }}>
                  ไม่มีข้อมูลแสดง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="prediction-footer">
        <div className="footer-left-controls">
          <span className="label">จำนวนต่อหน้า</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="items-per-page-dropdown"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="footer-right-controls">
          <span className="summary">
            แสดงรายการ {filteredData.length === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredData.length)} จาก {filteredData.length} รายการ
          </span>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ←
            </button>
            <span className="page-number-input">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) setCurrentPage(page);
                }}
              />
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              →
            </button>
          </div>
        </div>

        <div className="date-caption">
          จัดทำข้อมูล ณ วันที่ {floodData[0]?.date || "-"}
        </div>
      </div>
    </div>
  );
}
