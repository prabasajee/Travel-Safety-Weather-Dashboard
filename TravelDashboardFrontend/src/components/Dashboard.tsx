import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, TrendingUp, AlertTriangle, Sun, Cloud, CloudRain, Users, DollarSign, Thermometer, Heart, Trash2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import authService from '../firebase/authService';
import firebaseAuth from '../firebase/config';
import databaseService from '../firebase/databaseService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get fresh Firebase token
const getFreshToken = async () => {
  const tokenResult = await firebaseAuth.getIdToken();
  if (tokenResult.success) {
    return tokenResult.token;
  }
  return authService.getToken();
};

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelHistory, setTravelHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [isServing, setIsServing] = useState(false);

  // Mock data for demonstration (fallback only)
  const mockData = {
    location: 'Tokyo, Japan',
    travelSafety: {
      score: 85,
      level: 'Safe',
      advisory: 'Exercise normal precautions when traveling to Japan. The country maintains excellent safety standards.',
      color: 'green',
      trends: [
        { month: 'Jan', score: 82 },
        { month: 'Feb', score: 84 },
        { month: 'Mar', score: 83 },
        { month: 'Apr', score: 85 },
        { month: 'May', score: 87 },
        { month: 'Jun', score: 85 }
      ]
    },
    weather: {
      current: {
        temp: 22,
        condition: 'Sunny',
        icon: 'sun',
        humidity: 65,
        windSpeed: 12
      },
      forecast: [
        { day: 'Tomorrow', temp: 24, condition: 'Partly Cloudy', high: 26, low: 18 },
        { day: 'Friday', temp: 19, condition: 'Rainy', high: 21, low: 16 },
        { day: 'Saturday', temp: 21, condition: 'Cloudy', high: 23, low: 17 },
        { day: 'Sunday', temp: 25, condition: 'Sunny', high: 27, low: 19 }
      ],
      weeklyData: [
        { day: 'Mon', temp: 20 },
        { day: 'Tue', temp: 22 },
        { day: 'Wed', temp: 18 },
        { day: 'Thu', temp: 24 },
        { day: 'Fri', temp: 19 },
        { day: 'Sat', temp: 21 },
        { day: 'Sun', temp: 25 }
      ]
    },
    countryInfo: {
      population: '125,416,877',
      currency: 'Japanese Yen (JPY)',
      flag: '🇯🇵',
      capital: 'Tokyo',
      language: 'Japanese',
      timezone: 'JST (UTC+9)'
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      setSavedMessage('');
      try {
        const token = await getFreshToken();
        const response = await fetch(`${API_BASE_URL}/api/travel/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ location: searchQuery })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch travel information');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch travel information. Please try again.');
        // Fallback to mock data if API fails
        setSearchResults(mockData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Save current search results to database
  const handleSaveTravel = async () => {
    if (!searchResults) return;

    setIsSaving(true);
    try {
      const result = await databaseService.saveTravelData(searchResults);
      if (result.success) {
        setSavedMessage('✅ Travel data saved to MongoDB!');
        setTimeout(() => setSavedMessage(''), 3000);
        // Refresh favorites list
        loadFavorites();
      } else {
        setSavedMessage('❌ Failed to save travel data');
      }
    } catch (error) {
      console.error('Error saving travel data:', error);
      setSavedMessage('❌ Error saving travel data');
    } finally {
      setIsSaving(false);
    }
  };

  // Add country to served list
  const handleServeCountry = async () => {
    if (!searchResults) return;

    setIsServing(true);
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_BASE_URL}/api/served-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country: searchResults.location.split(',')[0].trim(), // Extract country name from location
          safetyScore: searchResults.safety?.score || 75,
          safetyLevel: searchResults.safety?.level || 'Safe',
          weather: searchResults.weather?.current?.condition || 'Sunny',
          temperature: searchResults.weather?.current?.temp || 20,
          notes: searchResults.safety?.advisory || ''
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSavedMessage('✅ Country added to Served List!');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setSavedMessage('❌ Failed to add to Served List');
      }
    } catch (error) {
      console.error('Error adding to served list:', error);
      setSavedMessage('❌ Error adding to Served List');
    } finally {
      setIsServing(false);
    }
  };

  // Load travel history from database
  const loadTravelHistory = async () => {
    try {
      const result = await databaseService.getTravelHistory(50, 0);
      if (result.success) {
        setTravelHistory(result.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Load favorite destinations
  const loadFavorites = async () => {
    try {
      const result = await databaseService.getFavoriteDestinations();
      if (result.success) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (historyId: string, currentFavorite: boolean) => {
    try {
      const result = await databaseService.toggleFavorite(historyId, !currentFavorite);
      if (result.success) {
        loadFavorites();
        loadTravelHistory();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Delete travel history entry
  const handleDeleteHistory = async (historyId: string) => {
    try {
      const result = await databaseService.deleteTravelHistory(historyId);
      if (result.success) {
        loadTravelHistory();
        loadFavorites();
      }
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadTravelHistory();
    loadFavorites();
  }, []);

  const getSafetyColor = (level) => {
    switch (level.toLowerCase()) {
      case 'safe': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'warning': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { type: "spring", stiffness: 400, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-6 py-8">
        {/* Hero Search Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discover Your Next Adventure
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get comprehensive travel insights, weather forecasts, and safety information for any destination worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex max-w-2xl mx-auto"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter city or country name... (e.g., Tokyo, London, Paris)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-2 border-transparent focus:border-blue-500 shadow-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="ml-4 h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons - Save & History */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-6 flex gap-4 justify-center flex-wrap"
          >
            <Button
              onClick={handleSaveTravel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save to Database'}
            </Button>
            <Button
              onClick={handleServeCountry}
              disabled={isServing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <MapPin className="h-4 w-4" />
              {isServing ? 'Adding...' : '➕ Add to Served List'}
            </Button>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Travel History ({travelHistory.length})
            </Button>
          </motion.div>
        )}

        {/* Save Confirmation Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center text-sm"
          >
            {savedMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Travel History Display */}
        {showHistory && travelHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-12"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Your Travel History ({travelHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {travelHistory.map((history: any) => (
                    <div
                      key={history._id}
                      className="p-4 bg-card/50 rounded-lg border border-border/50 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{history.location}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleFavorite(history._id, history.isFavorite)}
                            className="p-1 hover:bg-yellow-100 rounded transition-colors"
                            title={history.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart className={`h-4 w-4 ${history.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(history._id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Safety: </span>
                          <Badge variant="secondary">{history.safety?.level || 'N/A'}</Badge>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Weather: </span>
                          <span className="font-medium">{history.weather?.current?.condition || 'N/A'}</span>
                        </p>
                        {history.rating > 0 && (
                          <p>
                            <span className="text-muted-foreground">Rating: </span>
                            <span className="font-medium">⭐ {history.rating}/5</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg text-muted-foreground">Gathering travel information...</p>
          </motion.div>
        )}

        {/* Results Display */}
        {searchResults && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl mb-2"
              >
                Travel Information for {searchResults.location}
              </motion.h2>
              <Badge variant="outline" className="text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Travel Safety Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                        <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      Travel Safety
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span>Safety Level</span>
                      <Badge className={`${getSafetyColor(searchResults.safety?.level || 'Caution')} text-white shadow-lg`}>
                        {searchResults.safety?.level || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Safety Score</span>
                        <span className="font-medium">{searchResults.safety?.score || 0}/100</span>
                      </div>
                      <div className="relative">
                        <Progress value={searchResults.safety?.score || 0} className="h-3" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${searchResults.safety?.score || 0}%` }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{searchResults.safety?.advisory || 'No advisory available'}</p>
                    </div>

                    {/* Safety Trend Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        6-Month Safety Trend
                      </h4>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={searchResults.safety?.trends || []}>
                            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                            <Tooltip />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weather Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                        <Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Weather Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Weather */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                        className="flex items-center justify-center mb-3"
                      >
                        {getWeatherIcon(searchResults.weather?.current?.condition || 'Sunny')}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="text-4xl font-light mb-2"
                      >
                        {searchResults.weather?.current?.temp || 0}°C
                      </motion.div>
                      <p className="text-muted-foreground">{searchResults.weather?.current?.condition || 'N/A'}</p>
                      <div className="flex justify-center space-x-4 mt-3 text-sm text-muted-foreground">
                        <span>Humidity: {searchResults.weather?.current?.humidity || 0}%</span>
                        <span>Wind: {searchResults.weather?.current?.windSpeed || 0} km/h</span>
                      </div>
                    </div>
                    
                    {/* 4-Day Forecast */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">4-Day Forecast</h4>
                      <div className="space-y-2">
                        {(searchResults.weather?.forecast || []).map((day, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 + index * 0.1 }}
                            className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm font-medium">{day.day}</span>
                            <div className="flex items-center space-x-2">
                              {getWeatherIcon(day.condition || 'Sunny')}
                              <span className="text-sm">{day.temp}°C</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{day.condition || 'N/A'}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Temperature Chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Weekly Temperature</h4>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={searchResults.weather?.weeklyData || []}>
                            <Bar dataKey="temp" fill="#3b82f6" radius={4} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                            <Tooltip />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Country Info Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full bg-gradient-to-br from-purple-50 to-indigo-100/50 dark:from-purple-900/20 dark:to-indigo-800/10 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Country Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.4, type: "spring" }}
                      className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl"
                    >
                      <div className="text-6xl mb-3">{searchResults.countryInfo?.flag || '🌍'}</div>
                      <h3 className="text-xl font-medium">{searchResults.location || 'Location'}</h3>
                      <p className="text-sm text-muted-foreground">{searchResults.countryInfo?.capital || 'N/A'}</p>
                    </motion.div>
                    
                    <div className="space-y-4">
                      {[
                        { icon: Users, label: 'Population', value: searchResults.countryInfo?.population || 'N/A' },
                        { icon: DollarSign, label: 'Currency', value: searchResults.countryInfo?.currency || 'N/A' },
                        { icon: MapPin, label: 'Language', value: searchResults.countryInfo?.language || 'N/A' },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.6 + index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/80 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-background mr-3">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.9 }}
                      className="p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground text-center">
                        Timezone: {searchResults.countryInfo?.timezone || 'N/A'}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!searchResults && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              className="inline-block mb-6"
            >
              <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <MapPin className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl mb-4">Ready to Explore?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Search for any destination to discover comprehensive travel information, real-time weather updates, 
              and safety insights to help plan your perfect journey.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}