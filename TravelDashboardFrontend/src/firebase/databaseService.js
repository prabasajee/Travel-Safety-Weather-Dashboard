// Frontend Database Service - handles all API calls for data persistence
import authService from './authService';
import firebaseAuth from './config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper function to get fresh Firebase token
const getFreshToken = async () => {
  const tokenResult = await firebaseAuth.getIdToken();
  if (tokenResult.success) {
    return tokenResult.token;
  }
  // Fallback to stored token
  return authService.getToken();
};

// ==================== TRAVEL HISTORY OPERATIONS ====================

// Save travel search to database
export const saveTravelData = async (travelData) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(travelData)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error saving travel data:', error);
    return { success: false, error: error.message };
  }
};

// Get user's travel history
export const getTravelHistory = async (limit = 50, skip = 0) => {
  try {
    const token = await getFreshToken();
    console.log('📍 getTravelHistory - Fresh token obtained, length:', token?.length);
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/history/history?limit=${limit}&skip=${skip}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} - ${errorData.message || ''}`);
    }

    const data = await response.json();
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Error fetching travel history:', error);
    return { success: false, error: error.message };
  }
};

// Get user's favorite destinations
export const getFavoriteDestinations = async () => {
  try {
    const token = await getFreshToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/history/favorites`, {
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
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    return { success: false, error: error.message };
  }
};

// Toggle favorite status
export const toggleFavorite = async (historyId, isFavorite) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/favorite/${historyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isFavorite })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: error.message };
  }
};

// Update travel notes
export const updateTravelNotes = async (historyId, notes) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/notes/${historyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error updating notes:', error);
    return { success: false, error: error.message };
  }
};

// Rate a destination
export const rateDestination = async (historyId, rating) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/rate/${historyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error rating destination:', error);
    return { success: false, error: error.message };
  }
};

// Delete travel history entry
export const deleteTravelHistory = async (historyId) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/${historyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting history:', error);
    return { success: false, error: error.message };
  }
};

// Get similar destinations
export const getSimilarDestinations = async (location, limit = 5) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(
      `${API_BASE_URL}/api/history/similar/${location}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching similar destinations:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ANALYTICS ====================

// Get user statistics
export const getUserStats = async () => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/history/stats/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }
};

// Get most visited destinations
export const getMostVisitedDestinations = async (limit = 10) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(
      `${API_BASE_URL}/api/history/stats/most-visited?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching most visited:', error);
    return { success: false, error: error.message };
  }
};

// ==================== PREFERENCES ====================

// Get user preferences
export const getUserPreferences = async () => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update user preferences
export const updateUserPreferences = async (updates) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message };
  }
};

// Add favorite destination to preferences
export const addFavoriteToPreferences = async (travelHistoryId) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/preferences/favorites/${travelHistoryId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error adding favorite to preferences:', error);
    return { success: false, error: error.message };
  }
};

// Remove favorite destination from preferences
export const removeFavoriteFromPreferences = async (travelHistoryId) => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_BASE_URL}/api/preferences/favorites/${travelHistoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error removing favorite from preferences:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveTravelData,
  getTravelHistory,
  getFavoriteDestinations,
  toggleFavorite,
  updateTravelNotes,
  rateDestination,
  deleteTravelHistory,
  getSimilarDestinations,
  getUserStats,
  getMostVisitedDestinations,
  getUserPreferences,
  updateUserPreferences,
  addFavoriteToPreferences,
  removeFavoriteFromPreferences
};
