import { useNavigate } from 'react-router-dom';
import "./assets/css/agency.css";

function Agency() {
  const navigate = useNavigate();
  
  const organizations = [
    "organization 1",
    "organization 2",
    "organization 3",
    "organization 4",
    "organization 5",
  ];
    return (
    <div className="agency-bg">
      <main className="agency-content">
        {/* หัวข้อหลัก */}
        <div className="Container">
          <h1 className="text-topic">หน่วยงานที่สามารถติดตาม / แจ้งข่าวสาร</h1>
        </div>

        {/* ติดต่อฉุกเฉิน */}
        <h2 className="emc-contact">🚨 ติดต่อฉุกเฉิน</h2>

        {/* รายชื่อองค์กร */}
        <div className="organizations">
          {organizations.map((org, index) => (
            <div className="ag-Container" key={index}>
              <h1 className="text-ag">{org}</h1>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

}

export default Agency;
