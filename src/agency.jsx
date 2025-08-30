import { useNavigate } from 'react-router-dom';
import './agency.css'; // ✅ import css แยกของหน้านี้

function Agency() {
  const navigate = useNavigate();

  return (
    <div className="agency-bg">
      <header className="agency-header">
        <div className="logo-area">
          <img src="/mfu-logo.png" alt="โลโก้" width={50} height={50} />
          <div className="title">
            <div className="th">ติดตามสถานการณ์อุทกภัยภาคเหนือ</div>
            <div className="en">Northern Flood Forecasting System</div>
          </div>
        </div>
        <nav>
          <button className="btn text-light" onClick={() => navigate('/App')}>
            Home
          </button>
          <button className="btn text-light" onClick={() => navigate('/agency')}>
            Agency
          </button>
        </nav>
      </header>

      <main className="agency-content">
        <h1>หน่วยงานที่เกี่ยวข้อง</h1>
        <p>ข้อมูลและรายชื่อหน่วยงานที่เข้าร่วมในระบบติดตามอุทกภัย</p>
      </main>
    </div>
  );
}

export default Agency;
