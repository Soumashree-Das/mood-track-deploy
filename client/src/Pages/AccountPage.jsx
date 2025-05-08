
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [moodFrequency, setMoodFrequency] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [hasEnoughData, setHasEnoughData] = useState(false);

  // Color scheme for pie chart
  const COLORS = {
    'Joyful': '#FF9900',
    'Happy': '#66BB6A',
    'Calm': '#4FC3F7',
    'Neutral': '#FF69B4',
    'Anxious': '#FFC107',
    'Angry': '#F44336',
    'Sad': '#9C27B0',
    'Depressed': '#607D8B'
  };

  // Demo data for when backend data is insufficient
  const demoMoodData = [
    { date: '2025-04-27', score: 5, moodLabel: 'Calm' },
    { date: '2025-04-28', score: 6, moodLabel: 'Happy' },
    { date: '2025-04-29', score: 4, moodLabel: 'Neutral' },
    { date: '2025-04-30', score: 3, moodLabel: 'Anxious' },
    { date: '2025-05-01', score: 5, moodLabel: 'Calm' },
    { date: '2025-05-02', score: 7, moodLabel: 'Joyful' },
    { date: '2025-05-03', score: 6, moodLabel: 'Happy' },
    { date: '2025-05-04', score: 5, moodLabel: 'Calm' }
  ];

  const demoMoodFrequency = {
    'Joyful': 1,
    'Happy': 2,
    'Calm': 3,
    'Neutral': 1,
    'Anxious': 1,
    'Sad': 0,
    'Angry': 0,
    'Depressed': 0
  };

  // Fetch user data and mood data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Redirect to login in a real app
          window.location.href = '/login';
          return;
        }
  
        // Fetch user profile data
        const userResponse = await fetch('http://localhost:8080/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch mood data based on time range
        const moodDataResponse = await fetch(`http://localhost:8080/journal/mood-data?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!moodDataResponse.ok) {
          throw new Error('Failed to fetch mood data');
        }
        
        const moodDataResult = await moodDataResponse.json();
        
        // Check if there's enough data (7+ entries)
        if (moodDataResult.length >= 7) {
          setMoodData(moodDataResult);
          setHasEnoughData(true);
          
          // Fetch mood frequency data
          const moodFrequencyResponse = await fetch(`http://localhost:8080/journal/mood-frequency?range=${timeRange}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!moodFrequencyResponse.ok) {
            throw new Error('Failed to fetch mood frequency data');
          }
          
          const moodFrequencyResult = await moodFrequencyResponse.json();
          setMoodFrequency(moodFrequencyResult);
        } else {
          // Use demo data if not enough entries
          setMoodData(demoMoodData);
          setMoodFrequency(demoMoodFrequency);
          setHasEnoughData(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        
        // Use demo data in case of error
        setMoodData(demoMoodData);
        setMoodFrequency(demoMoodFrequency);
        setHasEnoughData(false);
        
        setLoading(false);
      }
    };
  
    fetchData();
  }, [timeRange]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Calculate mood statistics
  const calculateStats = () => {
    // Most common mood
    let mostCommonMood = { mood: 'Neutral', count: 0 };
    Object.entries(moodFrequency).forEach(([mood, count]) => {
      if (count > mostCommonMood.count) {
        mostCommonMood = { mood, count };
      }
    });
    
    // Calculate average mood score
    const moodScores = {
      'Joyful': 7,
      'Happy': 6,
      'Calm': 5,
      'Neutral': 4,
      'Anxious': 3,
      'Angry': 2,
      'Sad': 2,
      'Depressed': 1
    };
    
    let totalScore = 0;
    let totalEntries = 0;
    
    Object.entries(moodFrequency).forEach(([mood, count]) => {
      if (moodScores[mood]) {
        totalScore += moodScores[mood] * count;
        totalEntries += count;
      }
    });
    
    const averageScore = totalEntries > 0 ? (totalScore / totalEntries).toFixed(2) : '0.00';
    
    // Recent mood
    const recentMood = moodData.length > 0 ? moodData[moodData.length - 1].moodLabel : 'N/A';
    
    return {
      mostCommon: mostCommonMood,
      average: averageScore,
      recent: recentMood,
      total: totalEntries
    };
  };

  // Get statistics
  const stats = calculateStats();

  // Create data for pie chart
  const pieData = Object.entries(moodFrequency).map(([name, value]) => ({
    name,
    value
  }));

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-sm">{payload[0].payload.moodLabel}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Y-axis tick formatter to show mood labels instead of numbers
  const formatYAxis = (value) => {
    const moodLabels = {
      1: 'Depressed',
      2: 'Sad/Anxious',
      3: 'Angry',
      4: 'Neutral',
      5: 'Calm',
      6: 'Happy',
      7: 'Joyful'
    };
    return moodLabels[value] || '';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-xl text-blue-600">Loading your account data...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-xl text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Phone:</span> {user?.phoneNumber || 'Not provided'}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </section>

        {/* Mood Analytics Section */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Mood Analytics</h2>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg ${timeRange === '7days' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg ${timeRange === '30days' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg ${timeRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Time
            </button>
          </div>

          {/* Demo Data Notice */}
          {!hasEnoughData && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-bold">Not enough data</p>
              <p>You need at least 7 mood entries to see personalized charts. We're showing demo data for now.</p>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Mood Trend</h3>
              <div className="h-64">
                {moodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={[1, 7]} 
                        tickCount={7} 
                        tickFormatter={formatYAxis} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#fff' }}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No mood data available for this time period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mood Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Mood Distribution</h3>
              <div className="h-64">
                {Object.keys(moodFrequency).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#999'} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No mood distribution data available for this time period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mood Insights Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mood Insights</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Most Common Mood */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-600 text-lg font-semibold">Most Common Mood</h3>
              <p className="text-gray-700">{stats.mostCommon.mood} ({stats.mostCommon.count} entries)</p>
            </div>

            {/* Average Mood */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-600 text-lg font-semibold">Average Mood</h3>
              <p className="text-gray-700">{stats.average}</p>
            </div>

            {/* Recent Mood */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-purple-600 text-lg font-semibold">Recent Mood</h3>
              <p className="text-gray-700">{stats.recent}</p>
            </div>

            {/* Total Entries */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-yellow-600 text-lg font-semibold">Total Entries</h3>
              <p className="text-gray-700">{stats.total}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;