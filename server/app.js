
const express = require("express");
const { getAccessToken } = require("./contorller");
const { getKundliData, getCalendarData, getInauspiciousPeriod } = require("./components/components");
const app = express();
const cors = require('cors');
const { default: axios } = require("axios");
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
  console.log('geocdeo response', response)
  const { lat, lon } = response.data.features[0].properties;
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running onn http://localhost:${PORT}`);
});