import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, MapPin, Shield, Cloud, Clock, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import authService from '../firebase/authService';
import firebaseAuth from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get fresh Firebase token
const getFreshToken = async () => {
  const tokenResult = await firebaseAuth.getIdToken();
  if (tokenResult.success) {
    return tokenResult.token;
  }
  return authService.getToken();
};

interface ServedCountry {
  _id: string;
  userId: string;
  country: string;
  safetyScore: number;
  safetyLevel: string;
  weather: string;
  temperature: number;
  notes: string;
  dateAdded: string;
  visited: boolean;
}

export function ServedList() {
  const [servedList, setServedList] = useState<ServedCountry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newSafetyScore, setNewSafetyScore] = useState(75);
  const [newSafetyLevel, setNewSafetyLevel] = useState('Safe');
  const [newWeather, setNewWeather] = useState('Sunny');
  const [newTemperature, setNewTemperature] = useState(20);
  const [newNotes, setNewNotes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ServedCountry>>({});

  // Load served list on mount
  useEffect(() => {
    loadServedList();
  }, []);

  /**
   * Load all served countries
   */
  const loadServedList = async () => {
    try {
      setLoading(true);
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/served-list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setServedList(data.data);
        console.log(`📍 Loaded ${data.data.length} served countries`);
      } else {
        throw new Error(data.message || 'Failed to load served list');
      }
    } catch (error) {
      console.error('Error loading served list:', error);
      showMessage(`Error loading served list: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add country to served list
   */
  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCountry.trim()) {
      showMessage('Country name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/served-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          country: newCountry.trim(),
          safetyScore: parseFloat(newSafetyScore.toString()),
          safetyLevel: newSafetyLevel,
          weather: newWeather,
          temperature: parseFloat(newTemperature.toString()),
          notes: newNotes.trim(),
          visited: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage(`✅ "${newCountry}" added to served list!`, 'success');
        setNewCountry('');
        setNewSafetyScore(75);
        setNewSafetyLevel('Safe');
        setNewWeather('Sunny');
        setNewTemperature(20);
        setNewNotes('');
        loadServedList();
      } else {
        throw new Error(data.message || 'Failed to add country');
      }
    } catch (error) {
      console.error('Error adding country:', error);
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete country from served list
   */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/served-list/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage('🗑️ Country deleted from served list', 'success');
        loadServedList();
      } else {
        throw new Error(data.message || 'Failed to delete country');
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  /**
   * Update country in served list
   */
  const handleUpdate = async (id: string) => {
    try {
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/served-list/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage('✅ Country updated successfully', 'success');
        setEditingId(null);
        setEditData({});
        loadServedList();
      } else {
        throw new Error(data.message || 'Failed to update country');
      }
    } catch (error) {
      console.error('Error updating country:', error);
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  /**
   * Show message
   */
  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const getSafetyColor = (level: string) => {
    if (level === 'Safe') return 'bg-green-100 text-green-800';
    if (level === 'Caution') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Sunny')) return '☀️';
    if (condition.includes('Cloud')) return '☁️';
    if (condition.includes('Rain')) return '🌧️';
    if (condition.includes('Snow')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Served Countries Manager
          </h1>
          <p className="text-muted-foreground">Search, add, and manage your served destinations</p>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Country Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCountry} className="space-y-4">
                  {/* Country Name */}
                  <div>
                    <label className="text-sm font-medium">Country Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g., France, Japan, Brazil"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Safety Score */}
                  <div>
                    <label className="text-sm font-medium">Safety Score (0-100)</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={newSafetyScore}
                        onChange={(e) => setNewSafetyScore(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="font-bold text-lg text-blue-600 w-12">{newSafetyScore}</span>
                    </div>
                  </div>

                  {/* Safety Level */}
                  <div>
                    <label className="text-sm font-medium">Safety Level</label>
                    <select
                      value={newSafetyLevel}
                      onChange={(e) => setNewSafetyLevel(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option>Safe</option>
                      <option>Caution</option>
                      <option>Warning</option>
                    </select>
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="text-sm font-medium">Weather</label>
                    <select
                      value={newWeather}
                      onChange={(e) => setNewWeather(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option>Sunny</option>
                      <option>Cloudy</option>
                      <option>Rainy</option>
                      <option>Snowy</option>
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-sm font-medium">Temperature (°C)</label>
                    <Input
                      type="number"
                      value={newTemperature}
                      onChange={(e) => setNewTemperature(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      placeholder="Additional info..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                      rows="2"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#a855f7',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#9333ea')}
                      onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#a855f7')}
                    >
                      {loading ? 'Adding...' : '➕ Add to Served List'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Served Countries List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Served Countries ({servedList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-muted-foreground">Loading served list...</p>
                  </div>
                ) : servedList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No served countries yet.</p>
                    <p className="text-sm mt-2">Add your first country using the form on the left!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {servedList.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-card/50 rounded-lg border border-border/50 hover:border-purple-500 transition-all"
                      >
                        {editingId === item._id ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <Input
                              value={editData.country || item.country}
                              onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                              placeholder="Country name"
                              className="text-lg font-bold"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editData.safetyScore || item.safetyScore}
                                onChange={(e) => setEditData({ ...editData, safetyScore: Number(e.target.value) })}
                                placeholder="Safety Score"
                              />
                              <select
                                value={editData.safetyLevel || item.safetyLevel}
                                onChange={(e) => setEditData({ ...editData, safetyLevel: e.target.value })}
                                className="px-2 py-1 border rounded bg-background text-sm"
                              >
                                <option>Safe</option>
                                <option>Caution</option>
                                <option>Warning</option>
                              </select>
                            </div>
                            <textarea
                              value={editData.notes || item.notes}
                              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                              placeholder="Notes"
                              className="w-full px-2 py-1 border rounded bg-background text-sm"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(item._id)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}
                              >
                                <Check className="inline h-4 w-4 mr-1" /> Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}
                              >
                                <X className="inline h-4 w-4 mr-1" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{item.country}</h3>
                                <p className="text-xs text-muted-foreground">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {new Date(item.dateAdded).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(item._id);
                                    setEditData(item);
                                  }}
                                  className="p-2 hover:bg-muted rounded transition"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="p-2 hover:bg-muted rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Safety:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getSafetyColor(item.safetyLevel)}>
                                    {item.safetyLevel}
                                  </Badge>
                                  <span className="font-bold">{item.safetyScore}/100</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Weather:</span>
                                <p className="mt-1 font-medium">
                                  {getWeatherIcon(item.weather)} {item.weather}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Temperature:</span>
                                <p className="mt-1 font-medium">{item.temperature}°C</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={item.visited ? 'default' : 'secondary'} className="mt-1">
                                  {item.visited ? '✅ Visited' : '⏳ Planned'}
                                </Badge>
                              </div>
                            </div>

                            {item.notes && (
                              <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                                <p className="text-muted-foreground text-xs">Notes:</p>
                                <p>{item.notes}</p>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
