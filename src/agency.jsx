import { useNavigate } from 'react-router-dom';
import "./assets/css/agency.css";

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
          <button className="btn text-light" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="btn text-light" onClick={() => navigate('/agency')}>
            Agency
          </button>
        </nav>
      </header>

      <main className="agency-content">
        <div className="Contener">
        <h1 className="text-topic">หน่วยงานที่สามารถติดตาม / แจ้งข่าวสาร</h1>
        </div>
        <h2 className='emc-contect'>🚨 ติดต่อฉุกเฉิน</h2>

      </main>
    </div>
  );
}

export default Agency;
