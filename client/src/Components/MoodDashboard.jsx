import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const MoodDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [moodData, setMoodData] = useState([]);
  const [moodFrequency, setMoodFrequency] = useState({});
  const [pieData, setPieData] = useState([]);
  const [stats, setStats] = useState({
    mostCommon: { mood: 'Neutral', count: 0 },
    average: 4.0,
    recent: 'Neutral',
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Helper function to extract mood category from your backend's mood object
  const getMoodCategory = (moodObject) => {
    if (!moodObject) return 'Neutral';
    
    // Get the first key from the mood object
    const moodKey = Object.keys(moodObject)[0];
    if (!moodKey) return 'Neutral';
    
    // Map to standard categories
    const moodMap = {
      'joyful': 'Joyful',
      'happy': 'Happy',
      'calmAndContent': 'Calm',
      'anxious': 'Anxious',
      'angry': 'Angry',
      'sad': 'Sad',
      'depressed': 'Depressed'
    };
    
    return moodMap[moodKey] || 'Neutral';
  };

  // Helper function to calculate mood score from your backend's mood object
  const getMoodScore = (moodObject) => {
    const moodCategory = getMoodCategory(moodObject);
    
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
    
    return moodScores[moodCategory] || 4;
  };

  // Helper function to get display label from your backend's mood object
  const getMoodLabel = (moodObject) => {
    if (!moodObject) return 'Neutral';
    
    const moodKey = Object.keys(moodObject)[0];
    if (!moodKey) return 'Neutral';
    
    // Get the value (like "Grateful", "Radiant", etc.)
    const moodValue = moodObject[moodKey];
    
    // If it's a string value, use that, otherwise use the key
    return typeof moodValue === 'string' ? moodValue : moodKey.charAt(0).toUpperCase() + moodKey.slice(1);
  };

  // Fetch mood data based on time range
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch mood data from backend
        const response = await fetch(`http://localhost:8080/journal/mood-data`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch mood data');
        }
        
        const backendData = await response.json();
        
        // Transform backend data to frontend format
        const transformedData = backendData.map(entry => ({
          date: entry.createdAt.split('T')[0], // Format date
          score: getMoodScore(entry.mood),
          moodLabel: getMoodLabel(entry.mood),
          originalData: entry // Keep original for reference
        }));
        
        // Check if there's enough data (7+ entries)
        if (transformedData.length >= 7) {
          setMoodData(transformedData);
          setHasEnoughData(true);
          
          // Fetch mood frequency data
          const freqResponse = await fetch('http://localhost:8080/journal/mood-frequency', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!freqResponse.ok) {
            throw new Error('Failed to fetch mood frequency data');
          }
          
          const freqData = await freqResponse.json();
          setMoodFrequency(freqData);
        } else {
          // Use demo data if not enough entries
          setMoodData(demoMoodData);
          setMoodFrequency(demoMoodFrequency);
          setHasEnoughData(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        
        // Use demo data in case of error
        setMoodData(demoMoodData);
        setMoodFrequency(demoMoodFrequency);
        setHasEnoughData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Process mood frequency data for pie chart
  useEffect(() => {
    // Transform mood frequency object to array for pie chart
    const data = Object.entries(moodFrequency).map(([name, value]) => ({
      name,
      value
    }));
    setPieData(data);

    // Calculate statistics
    if (data.length > 0) {
      // Most common mood
      const mostCommon = data.reduce((max, item) => 
        item.value > max.value ? item : max, data[0]);
      
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
      
      const averageScore = totalEntries > 0 ? (totalScore / totalEntries).toFixed(2) : '4.00';
      
      // Recent mood (from the transformed mood data array)
      const recentMood = moodData.length > 0 ? moodData[moodData.length - 1].moodLabel : 'Neutral';
      
      setStats({
        mostCommon: { mood: mostCommon.name, count: mostCommon.value },
        average: averageScore,
        recent: recentMood,
        total: totalEntries
      });
    }
  }, [moodFrequency, moodData]);

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
      2: 'Sad/Angry',
      3: 'Anxious',
      4: 'Neutral',
      5: 'Calm',
      6: 'Happy',
      7: 'Joyful'
    };
    return moodLabels[value] || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p className="font-bold">Error</p>
        <p className="block sm:inline">{error}</p>
        <p className="mt-2">Please try refreshing the page or checking your connection.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Time Range Selector */}
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setTimeRange('7days')}
          className={`px-4 py-2 rounded ${timeRange === '7days' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('30days')}
          className={`px-4 py-2 rounded ${timeRange === '30days' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Last 30 Days
        </button>
      </div>

      {!hasEnoughData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Not enough data</p>
          <p>You need at least 7 mood entries to see personalized charts. We're showing demo data for now.</p>
        </div>
      )}

      {moodData.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">No mood entries found for this time period</p>
          <p>Start journaling to see your mood trends!</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Mood Trend</h2>
              <div className="h-64">
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
              </div>
            </div>

            {/* Mood Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Mood Distribution</h2>
              <div className="h-64">
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
              </div>
            </div>
          </div>

          {/* Mood Insights */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Mood Insights</h2>
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
        </>
      )}
    </div>
  );
};

export default MoodDashboard;