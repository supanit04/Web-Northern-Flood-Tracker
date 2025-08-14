import { useNavigate } from 'react-router-dom';

function Agency() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Agency</h1>
      <button onClick={() => navigate('/')}>
        Back
      </button>
    </div>
  );
}

export default Agency;
