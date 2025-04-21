const NodeCache = require('node-cache');

// Initialize cache with 24 hour TTL
const cache = new NodeCache({ stdTTL: 86400 });

// Function to normalize coordinates (round to 4 decimal places for ~11m precision)
const normalizeCoordinates = (coordinates) => {
  return coordinates
    .split(',')
    .map(coord => parseFloat(coord).toFixed(4))
    .join(',');
};

// Function to normalize date (strip time component)
const normalizeDate = (datetime) => {
  return new Date(datetime).toISOString().split('T')[0];
};

// Generate cache key from normalized parameters
const generateCacheKey = (endpoint, params) => {
  const { datetime, coordinates, ...otherParams } = params;
  console.log('params',params)
  const normalizedDate = datetime ? normalizeDate(datetime) : null;
  const normalizedCoords = coordinates ? normalizeCoordinates(coordinates) : null;
  console.log('normalizedDate', normalizedDate)
  console.log('normalizedCoords', normalizedCoords)
  return JSON.stringify({
    endpoint,
    date: normalizedDate,
    coordinates: normalizedCoords,
    ...otherParams
  });
};

module.exports = {
  // Get data from cache
  get: (endpoint, params) => {
    const key = generateCacheKey(endpoint, params);
    return cache.get(key);
  },

  // Set data in cache
  set: (endpoint, params, data) => {
    const key = generateCacheKey(endpoint, params);
    return cache.set(key, data);
  },

  // Clear entire cache
  clear: () => {
    return cache.flushAll();
  }
};