
const express = require("express");
const { getAccessToken } = require("./contorller");
const { getKundliData, getCalendarData, getInauspiciousPeriod } = require("./components/components");
const app = express();
const cors = require('cors');
const { default: axios } = require("axios");
const { validationResult } = require('express-validator');

app.use(cors());

const PORT = 3001;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Simple GET endpoint
app.get("/", (req, res) => {
  console.log('Hello, Node.js Server is Running')
  res.send("Hello, Node.js Server is Running!");
});



// Endpoint to fetch Kundli data
app.get("/api/kundli", async (req, res) => {
  console.log('api/kundli')

  const { datetime, coordinates } = req.query;
  console.log("Received params:", datetime, coordinates);
  if (!datetime || !coordinates) {
    return res.status(400).json({ error: "datetime and coordinates are required" });
  }

  try {
    const accessToken = await getAccessToken();
    const kundliData = await getKundliData(accessToken, datetime, coordinates);
    // res.json(kundliData);
    console.log('kundliData', kundliData)
    res.status(200).json({ data: kundliData });

  } catch (error) {
    console.error('Error fetching Kundli data:', error);
    res.status(500).json({ error: "Failed to fetch Kundli data" });
  }
});
app.get("/inauspicious-period", async (req, res) => {
  const { datetime, coordinates } = req.query;
  console.log('inauspicious-period is working', datetime, coordinates)
  if (!datetime || !coordinates) {
    return res.status(400).json({ error: "datetime and coordinates are required" });
  }
  console.log('1');
  const [latitude, longitude] = coordinates.split(",");
  console.log('latitude', latitude)
  console.log('longitude', longitude)

  try {
    const accessToken = await getAccessToken();
    const kundliData = await getInauspiciousPeriod(accessToken, datetime, latitude, longitude);
    console.log("Kundli Data:", kundliData);
    res.status(200).json({ data: kundliData });

  } catch (error) {
    console.error("Error fetching Kundli data:", error);
    res.status(500).json({ error: "Failed to fetch Kundli data" });
  }
});


app.get("/calendar", async (req, res) => {
  const { datetime } = req.query;

  if (!datetime) {
    return res.status(400).json({ error: "datetime is required" });
  }

  try {
    const accessToken = await getAccessToken();
    const getCalendar = await getCalendarData(accessToken, datetime);
    console.log('kundliData', getCalendar)
    res.status(200).json({ data: getCalendar });

  } catch (error) {
    console.error('Error fetching calender data:', error);
    res.status(500).json({ error: "Failed to fetch calender data" });
  }
});



async function geocodePlace(place) {
  console.log('place in geocode', place)
  const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
    params: {
      text: place,
      apiKey: '45dbc8cf891f4d6fbea1c59a62e45972', // Get from https://myprojects.geoapify.com
    },
  });
  const { lat, lon } = response.data.features[0].properties;
  console.log('geocdeo response', lat, lon)

  return `${lat},${lon}`;
}

function prepareRequestData(body) {
  const { year, month, day } = body.birthDate;
  const { hours, minutes, period } = body.birthTime;

  // Convert to 24-hour format
  let hour24 = parseInt(hours, 10);
  if (period === 'PM' && hour24 < 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;

  // Create Date object (month is 0-indexed in JavaScript)
  const dateObj = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1, // Subtract 1 for JS month index
    parseInt(day, 10),
    hour24,
    parseInt(minutes, 10)
  );

  return {
    dateObj
  };
}


// Route handler
app.post('/birth-details', async (req, res) => {
  console.log('birth-details is tiggering',req.body)

  try {
    const { name, gender, birthDate, birthTime, placeOfBirth, language } = req.body;
    const { dateObj } = prepareRequestData(req.body);

    console.log('req.body', req.body)
    // 1. Geocode place to coordinates
    const coordinates = await geocodePlace(placeOfBirth);
    console.log('coordinates in birthdetails', coordinates)
    // 2. Parse datetime with timezone 
    console.log('birthDate', birthDate)
    console.log('new Date(`${birthDate}T${birthTime}`)', new Date(`${birthDate}T${birthTime}`))
    const datetime = formatDateWithOffset(dateObj);
    console.log('birthdetails coordinates', coordinates)
    console.log('datetimesssssss', datetime)
    // 3. Call Prokerala API
    const accessToken = await getAccessToken();
    const kundliData = await callKundliApi(accessToken, {
      datetime,
      coordinates,
      gender, // Include if required by the API
      language,
      ayanamsa: 1, // Lahiri
    });
    console.log('dataaa',JSON.stringify(kundliData, null, 2));
    res.json({ success: true, data: kundliData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function formatDateWithOffset(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  const offset = date.getTimezoneOffset();
  const absOffset = Math.abs(offset);

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1), 
    pad(date.getDate()),
  ].join('-') + 'T' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':') + 
  (offset > 0 ? '-' : '+') + 
  pad(Math.floor(absOffset / 60)) + ':' + 
  pad(absOffset % 60);
}

// Helper function to call Prokerala API
async function callKundliApi(accessToken, params) {
  console.log('callKundliApi is working', params)
  const response = await axios.get('https://api.prokerala.com/v2/astrology/kundli', {
    params: {
      datetime: params.datetime,
      coordinates: params.coordinates,
      gender: params.gender, // Include if required
      la: params.language,
      ayanamsa: params.ayanamsa,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.data; // Adjust based on actual response
}

// Route handler for Kundli Matching
app.post('/kundali-matching', async (req, res) => {
  console.log('kundali-matching request received', req.body);
  
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { girlDetails, boyDetails, language = 'en', ayanamsa = 1 } = req.body;
    
    // Get access token first
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Prepare request parameters
    const requestParams = await prepareRequestParams(girlDetails, boyDetails, language, ayanamsa);
    console.log('API Request Params:', requestParams);

    // Make API call to ProKerala
    const response = await callProKeralaAPI(accessToken, requestParams);
    console.log('response', response.data.data)
    // Process and format the response
    const formattedResponse = formatResponse(response.data);
console.log('formattedResponse', formattedResponse)
    res.json(response.data.data);
  } catch (error) {
    console.error('Kundali matching error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process kundali matching',
      details: error.response?.data?.message || error.message 
    });
  }
});


async function prepareRequestParams(girlDetails, boyDetails, language, ayanamsa) {
  const girlCoords = await getCoordinates(girlDetails.location);
  const boyCoords = await getCoordinates(boyDetails.location);

  return {
    ayanamsa: ayanamsa,
    girl_coordinates: `${girlCoords.latitude},${girlCoords.longitude}`,
    girl_dob: formatISODate(girlDetails.birthDate, girlDetails.birthTime, girlCoords.timezoneOffset),
    boy_coordinates: `${boyCoords.latitude},${boyCoords.longitude}`,
    boy_dob: formatISODate(boyDetails.birthDate, boyDetails.birthTime, boyCoords.timezoneOffset),
    la: language
  };
}

function formatISODate(birthDate, birthTime, timezoneOffset) {
  const pad = (n) => String(n).padStart(2, '0');
  
  // Ensure all values are numbers
  const year = parseInt(birthDate.year);
  const month = parseInt(birthDate.month);
  const day = parseInt(birthDate.day);
  const hour = parseInt(birthTime.hour);
  const minute = parseInt(birthTime.minute);
  const second = parseInt(birthTime.second || 0);
  
  // Format the date in ISO format without timezone
  const dateString = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
  
  // Add timezone offset (default to +05:30 for India if not provided)
  const offset = timezoneOffset || 330; // 330 minutes = +05:30
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${dateString}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`;
}


async function getCoordinates(location) {
  console.log('Fetching coordinates for:', location);
  
  try {
    const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: {
        text: `${location.city}, ${location.state}, ${location.country}`,
        apiKey: process.env.GEOAPIFY_API_KEY || '45dbc8cf891f4d6fbea1c59a62e45972',
      },
    });

    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon, timezone } = response.data.features[0].properties;
    console.log('Coordinates found:', lat, lon);

    // Calculate timezone offset in minutes
    const timezoneOffset = timezone ? 
      (timezone.offset_DST || timezone.offset_STD) * 60 : 
      330; // IST offset as fallback

    return {
      latitude: lat,
      longitude: lon,
      timezoneOffset: timezoneOffset
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to default coordinates (Ujjain, India)
    return {
      latitude: 23.1765,
      longitude: 75.7885,
      timezoneOffset: 330 // IST offset in minutes
    };
  }
}

async function callProKeralaAPI(accessToken, params) {
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    },
    params: params,
    timeout: 10000 // 10 seconds timeout
  };

  console.log('Calling ProKerala API with GET request...');
  return await axios.get(
    'https://api.prokerala.com/v2/astrology/kundli-matching/advanced',
    config
  );
}

function formatResponse(apiResponse) {
  const {data} = apiResponse;
  console.log('data isss', data);
  // Basic validation of API response
  if (!data || !data.guna_milan || !data.girl_info || !data.boy_info) {
    throw new Error('Invalid API response format');
  }

  return {
    success: true,
    compatibility: {
      score: data.guna_milan.total_points || 0,
      maximumScore: data.guna_milan.maximum_points || 36,
      message: {
        type: data.message.type || '',
        description: data.message.description || ''
      }
    },
    gunas: data.guna_milan.guna.map(guna => ({
      id: guna.id || 0,
      name: guna.name || '',
      girlKoot: guna.girl_koot || '',
      boyKoot: guna.boy_koot || '',
      maximumPoints: guna.maximum_points || 0,
      obtainedPoints: guna.obtained_points || 0,
      description: guna.description || ''
    })),
    girlInfo: {
      koot: data.girl_info.koot || {},
      nakshatra: {
        id: data.girl_info.nakshatra.id || 0,
        name: data.girl_info.nakshatra.name || '',
        lord: data.girl_info.nakshatra.lord || {},
        pada: data.girl_info.nakshatra.pada || 0
      },
      rasi: {
        id: data.girl_info.rasi.id || 0,
        name: data.girl_info.rasi.name || '',
        lord: data.girl_info.rasi.lord || {}
      }
    },
    boyInfo: {
      koot: data.boy_info.koot || {},
      nakshatra: {
        id: data.boy_info.nakshatra.id || 0,
        name: data.boy_info.nakshatra.name || '',
        lord: data.boy_info.nakshatra.lord || {},
        pada: data.boy_info.nakshatra.pada || 0
      },
      rasi: {
        id: data.boy_info.rasi.id || 0,
        name: data.boy_info.rasi.name || '',
        lord: data.boy_info.rasi.lord || {}
      }
    }
  };
}



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running onn http://localhost:${PORT}`);
});