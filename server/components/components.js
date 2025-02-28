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
      console.log('caledner data for testing api',response.data)
      return response.data;
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
    language = "hi"
  ) => {
    console.log("getInauspiciousPeriod method is working");

    try {
      // Ensure datetime is properly formatted
      const formattedDate = new Date(date).toISOString(); // Ensures ISO 8601 format

      // Construct coordinates correctly
      const coordinates = `${latitude},${longitude}`;

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

      console.log("Fetched Data:", response.data.data.muhurat);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching inauspicious period:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  },
};
