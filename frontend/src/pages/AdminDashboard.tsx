import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="glass p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">ANTS Trail</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/roadmap')}
              className="glass-button px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-300"
            >
              My Roadmap
            </button>
            <button
              onClick={handleLogout}
              className="glass-button px-4 py-2 rounded-lg text-red-400 hover:text-red-300 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Monitor user progress and roadmaps</p>
        </div>

        <div className="glass-card p-6 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-4 text-white font-semibold">Name</th>
                  <th className="text-left p-4 text-white font-semibold">Email</th>
                  <th className="text-left p-4 text-white font-semibold">Completion %</th>
                  <th className="text-left p-4 text-white font-semibold">Target Date</th>
                  <th className="text-left p-4 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.user_id} className="border-b border-gray-700 hover:bg-white/5 transition-colors duration-200">
                    <td className="p-4 text-gray-300">{row.name}</td>
                    <td className="p-4 text-gray-300">{row.email}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full"
                            style={{ width: `${row.completion_pct}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium">{row.completion_pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{row.target_date}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        row.roadmap_state === 'completed' ? 'bg-green-500/20 text-green-400' :
                        row.roadmap_state === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {row.roadmap_state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}