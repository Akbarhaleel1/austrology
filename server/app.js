
const express = require("express");
const { getAccessToken } = require("./contorller");
const { getKundliData, getCalendarData, getInauspiciousPeriod } = require("./components/components");
const app = express();
const cors = require('cors');
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

  if (!datetime || !coordinates) {
      return res.status(400).json({ error: "datetime and coordinates are required" });
  }

  // Extract latitude and longitude from coordinates string
  const [latitude, longitude] = coordinates.split(",");

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
    // res.json(kundliData);
    console.log('kundliData', getCalendar)
    res.status(200).json({ data: getCalendar });

  } catch (error) {
      console.error('Error fetching calender data:', error);
      res.status(500).json({ error: "Failed to fetch calender data" });
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running onn http://localhost:${PORT}`);
});