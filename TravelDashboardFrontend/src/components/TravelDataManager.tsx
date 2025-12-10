import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
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

export function TravelDataManager() {
  // Form states
  const [formData, setFormData] = useState({
    location: '',
    safetyScore: 80,
    safetyLevel: 'Safe',
    weatherCondition: 'Sunny',
    temperature: 22,
    notes: ''
  });

  // Records states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  /**
   * Load all records from backend
   */
  const loadRecords = async () => {
    try {
      setLoading(true);
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/records`, {
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
        setRecords(data.data);
        console.log(`✅ Loaded ${data.data.length} records from backend`);
      } else {
        throw new Error(data.message || 'Failed to load records');
      }
    } catch (error) {
      console.error('Error loading records:', error);
      showMessage(`Error loading records: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit new travel data to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location.trim()) {
      showMessage('Location is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getFreshToken();

      const submitData = {
        location: formData.location.trim(),
        weather: {
          current: {
            temp: parseFloat(formData.temperature),
            condition: formData.weatherCondition,
            humidity: 65,
            windSpeed: 12
          },
          forecast: [],
          weeklyData: []
        },
        safety: {
          score: parseFloat(formData.safetyScore),
          level: formData.safetyLevel,
          advisory: `Travel advisory for ${formData.location}`,
          trends: []
        },
        countryInfo: {
          population: 'N/A',
          currency: 'N/A',
          flag: '🌍',
          capital: 'N/A',
          language: 'N/A',
          timezone: 'N/A'
        },
        notes: formData.notes
      };

      console.log('📤 Submitting data to backend:', submitData);

      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage(`✅ Data submitted successfully for ${formData.location}!`, 'success');
        console.log('📦 Record saved:', data.data);

        // Reset form
        setFormData({
          location: '',
          safetyScore: 80,
          safetyLevel: 'Safe',
          weatherCondition: 'Sunny',
          temperature: 22,
          notes: ''
        });

        // Reload records
        await loadRecords();
      } else {
        throw new Error(data.message || 'Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Delete a record
   */
  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const token = await getFreshToken();

      const response = await fetch(`${API_BASE_URL}/api/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage('Record deleted successfully', 'success');
        await loadRecords();
      } else {
        throw new Error(data.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showMessage(`Error: ${error.message}`, 'error');
    }
  };

  /**
   * Show message to user
   */
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Travel Data Manager
          </h1>
          <p className="text-muted-foreground">Submit and manage your travel information</p>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Submit Travel Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      type="text"
                      placeholder="e.g., Paris, London, Tokyo"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Safety Score */}
                  <div>
                    <label className="text-sm font-medium">Safety Score (0-100)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.safetyScore}
                      onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Safety Level */}
                  <div>
                    <label className="text-sm font-medium">Safety Level</label>
                    <select
                      value={formData.safetyLevel}
                      onChange={(e) => setFormData({ ...formData, safetyLevel: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                      <option>Safe</option>
                      <option>Caution</option>
                      <option>Warning</option>
                    </select>
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="text-sm font-medium">Weather Condition</label>
                    <select
                      value={formData.weatherCondition}
                      onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
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
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      placeholder="Additional information..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                      rows="3"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 mt-4 border-t">
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#1d4ed8')}
                      onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#2563eb')}
                    >
                      {submitting ? 'Submitting...' : 'Submit Travel Data'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Records Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stored Records ({records.length})</CardTitle>
                <Button
                  onClick={loadRecords}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-muted-foreground">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No records found. Submit some data to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-card/50 rounded-lg border border-border/50 hover:border-blue-500 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{record.location}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDelete(record._id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Safety:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={
                                record.safety?.level === 'Safe' ? 'default' :
                                record.safety?.level === 'Caution' ? 'secondary' :
                                'destructive'
                              }>
                                {record.safety?.level || 'N/A'}
                              </Badge>
                              <span className="font-medium">{record.safety?.score || 0}/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weather:</span>
                            <p className="mt-1 font-medium">{record.weather?.current?.condition || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Temperature:</span>
                            <p className="mt-1 font-medium">{record.weather?.current?.temp || 'N/A'}°C</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <p className="mt-1 font-medium text-xs">{record._id.substring(0, 8)}...</p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                            <p className="text-muted-foreground">Notes:</p>
                            <p>{record.notes}</p>
                          </div>
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
