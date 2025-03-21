const API_BASE_URL = 'https://musicapi.x007.workers.dev';

export const searchSongs = async (query, searchEngine = 'gaama') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&searchEngine=${searchEngine}`);
    
    if (!response.ok) {
      throw new Error('Failed to search songs');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

export const fetchSongUrl = async (songId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch?id=${songId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch song URL');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error fetching song URL:', error);
    throw error;
  }
};

export const getLyrics = async (songId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lyrics?id=${songId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    throw error;
  }
}; 