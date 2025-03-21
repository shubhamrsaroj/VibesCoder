const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = 'AIzaSyCmihYburut2v6Jz8vAFu23XRsNWqRtaGQ'; // Using the existing API key from .env

export const searchYouTubeMusic = async (query) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to search YouTube Music');
    }

    const data = await response.json();
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('Error searching YouTube Music:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to get video details');
    }

    const data = await response.json();
    return data.items[0];
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
}; 