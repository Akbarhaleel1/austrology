const axios = require("axios");
module.exports = {
  getKundliData: async function (accessToken, datetime, coordinates) {
    try {
      const isoDatetime = new Date(datetime).toISOString();
      const response = await axios.get(
        "https://api.prokerala.com/v2/astrology/panchang",
        {
          params: {
            ayanamsa: 1,
            coordinates: coordinates,
            datetime: isoDatetime,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching Kundli data:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },

  getCalendarData: async function (
    accessToken,
    date,
    calendarType = "vikram-samvat",
    language = "hi"
  ) {
    try {
      // Ensure date is in YYYY-MM-DD format
      const formattedDate = new Date(date).toISOString().split("T")[0];
      console.log("formattedDate", formattedDate);

      const response = await axios.get(
        "https://api.prokerala.com/v2/calendar",
        {
          params: {
            date: formattedDate, // Use the properly formatted date
            calendar: calendarType, // Add the calendar parameter
            la: language, // Add the language parameter
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('caledner data for testing apisss', response.data.data)
      return response.data.data;
    } catch (error) {
      console.error(
        "Error fetching Calendar data:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
  getInauspiciousPeriod: async (
    accessToken,
    date,
    latitude,
    longitude,
    ayanamsa = 1,
    language = "en"
  ) => {
    console.log("getInauspiciousPeriod method is working..................");

    try {
      // Ensure datetime is properly formatted
      const formattedDate = new Date(date).toISOString(); // Ensures ISO 8601 format
      console.log('formattedDate', formattedDate)
      // Construct coordinates correctly
      const coordinates = `${latitude},${longitude}`;
      console.log('coordinates', coordinates)
      const response = await axios.get(
        "https://api.prokerala.com/v2/astrology/inauspicious-period",
        {
          params: {
            ayanamsa, // Lahiri = 1, Raman = 3, KP = 5
            coordinates,
            datetime: formattedDate, // Pass ISO formatted datetime
            la: language, // Language option
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );


      console.log("Fetched Datasssssssssssssss:", response);
      console.log("Fetched Data:");
      response.data.data.muhurat.forEach(item => {
        console.log(`- Name: ${item.name}`);
        console.log(`  Type: ${item.type}`);
        console.log(`  Period:`);

        item.period.forEach(period => {
          const formattedStart = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata' // Convert to IST (Adjust as needed)
          }).format(new Date(period.start));

          const formattedEnd = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
          }).format(new Date(period.end));

          console.log(`    - ${formattedStart} to ${formattedEnd}`);
        });

        console.log("--------------------------");
      });

      return response.data.data.muhurat;
    } catch (error) {
      console.error(
        "Error fetching inauspicious period:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
  getDailyHoroscope: async function (accessToken, datetime, signs = 'all', types = 'all') {
    try {
      const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      const validTypes = ['general', 'career', 'love', 'money'];

      // Process signs parameter
      let selectedSigns = signs.toLowerCase() === 'all' ? validSigns : signs.toLowerCase().split(',');
      // Validate each sign
      selectedSigns.forEach(sign => {
        if (!validSigns.includes(sign.trim())) {
          throw new Error(`Invalid sign: ${sign}. Must be one of: ${validSigns.join(', ')}`);
        }
      });

      // Process types parameter
      let selectedTypes = types.toLowerCase() === 'all' ? validTypes : types.toLowerCase().split(',');
      // Validate each type
      selectedTypes.forEach(type => {
        if (!validTypes.includes(type.trim())) {
          throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
        }
      });
      console.log('1')
      // Calculate credits
      const creditsPerRequest = 250;
      const totalCredits = selectedSigns.length * selectedTypes.length * creditsPerRequest;
      console.log('totalCredits', totalCredits)
      // Use a fixed date within the valid range (2025-04-11 to 2025-04-13)
      const validDate = new Date('2025-04-13T00:00:00.000Z');
      console.log('validDate', validDate)
      // Make parallel requests for all combinations
      const requests = selectedSigns.flatMap(sign =>
        selectedTypes.map(type =>
          axios.get("https://api.prokerala.com/v2/horoscope/daily/advanced", {
            params: {
              datetime: validDate.toISOString(),
              sign: sign.trim(),
              type: type.trim()
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json'
            }
          })
        )
      );

      const responses = await Promise.all(requests);

      // Format the response
      const result = {
        credits: {
          total: totalCredits,
          breakdown: {
            signs: selectedSigns.length,
            types: selectedTypes.length,
            base_rate: creditsPerRequest
          }
        },
        predictions: {}
      };

      // Process responses
      responses.forEach((response, index) => {
        const signIndex = Math.floor(index / selectedTypes.length);
        const typeIndex = index % selectedTypes.length;
        const sign = selectedSigns[signIndex];
        const type = selectedTypes[typeIndex];

        if (!result.predictions[sign]) {
          result.predictions[sign] = {};
        }
        result.predictions[sign][type] = response.data.data;
      });

      return result;
    } catch (error) {
      console.error(
        "Error fetching daily horoscope:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
};
