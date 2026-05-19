import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/roadmap" className="text-xl font-bold text-blue-700">ANTS Trail</Link>
      <div className="flex items-center space-x-4">
        {user.role === 'admin' && <Link to="/admin" className="text-sm text-gray-700">Dashboard</Link>}
        <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
      </div>
    </nav>
  );
}