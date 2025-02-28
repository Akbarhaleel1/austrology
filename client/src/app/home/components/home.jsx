

"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import axios from "axios";
import ZodiacComponent from './ZodiacComponent'
import dayjs from "dayjs";

function App() {
  // Replace zodiacSigns with image URLs and animation properties
  const zodiacSigns = [
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e", 
      animationDelay: "0.1s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.2s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.3s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.4s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.5s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.6s",
    },
    {
      icon: "https://i.postimg.cc/hG7JchBY/Screenshot-2025-02-21-004601-removebg-preview.png",
      bg: "#1a237e",
      animationDelay: "0.7s",
    },
  ];
  
  const [panchangData, setPanchangData] = useState(null);
  const [calenderData, setCalenderData] = useState(null);
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 19));
  const [coordinates, setCoordinates] = useState("12.972442,77.580643");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [formattedDate, setFormattedDate] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [showStars, setShowStars] = useState(false);
  const [selectedZodiac, setSelectedZodiac] = useState(null);
  const [showPulse, setShowPulse] = useState(false);
  const [dataLastFetched, setDataLastFetched] = useState(null);

  // Constants for cache
  const CACHE_KEYS = {
    PANCHANG: 'panchang_data',
    CALENDAR: 'calendar_data',
    INAUSPICIOUS: 'inauspicious_data',
    LAST_FETCHED: 'data_last_fetched',
    COORDINATES: 'user_coordinates'
  };
  
  const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDatetime(now.toISOString().slice(0, 19));
      setCurrentTime(now.toLocaleTimeString());
      
      if (Math.floor(now.getSeconds() / 10) % 2 === 0) {
        setShowStars(true);
      } else {
        setShowStars(false);
      }
      
      // Pulse effect every 30 seconds
      if (now.getSeconds() === 0 || now.getSeconds() === 30) {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 2000);
      }
    }, 1000); // Updates every second

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  // Update month and year dynamically
  useEffect(() => {
    const date = new Date(datetime);
    const formatted = dayjs(date).format("DD-MM-YYYY");
    setFormattedDate(formatted);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    setCurrentMonth(month);
    setCurrentYear(year);
  }, [datetime]);

  // Load cached data on initial mount
  // useEffect(() => {
  //   loadCachedData();
  // }, []);

  // Function to load cached data
  const loadCachedData = () => {
    try {
      // Check if we have cached coordinates
      const cachedCoordinates = localStorage.getItem(CACHE_KEYS.COORDINATES);
      if (cachedCoordinates) {
        const [lat, lng] = cachedCoordinates.split(',');
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lng));
        setCoordinates(cachedCoordinates);
      }
      
      // Check when data was last fetched
      const lastFetched = localStorage.getItem(CACHE_KEYS.LAST_FETCHED);
      const now = new Date().getTime();
      
      // If cache is valid (less than 6 hours old)
      if (lastFetched && (now - parseInt(lastFetched)) < CACHE_EXPIRY) {
        // Load panchang data
        const cachedPanchang = localStorage.getItem(CACHE_KEYS.PANCHANG);
        if (cachedPanchang) {
          setPanchangData(JSON.parse(cachedPanchang));
        }
        
        // Load calendar data
        const cachedCalendar = localStorage.getItem(CACHE_KEYS.CALENDAR);
        if (cachedCalendar) {
          setCalenderData(JSON.parse(cachedCalendar));
        }
        
        setDataLastFetched(parseInt(lastFetched));
        setLoading(false);
        
        console.log("Using cached data from", new Date(parseInt(lastFetched)).toLocaleString());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error loading cached data:", error);
      return false;
    }
  };

  // Function to save data to cache
  // const saveToCache = (key, data) => {
  //   try {
  //     localStorage.setItem(key, JSON.stringify(data));
  //   } catch (error) {
  //     console.error(`Error saving ${key} to cache:`, error);
  //   }
  // };

  // Fetch user's geolocation
  useEffect(() => {
    if (navigator.geolocation && !latitude && !longitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setCoordinates(`${lat},${lng}`);
          
          // Cache coordinates
          localStorage.setItem(CACHE_KEYS.COORDINATES, `${lat},${lng}`);
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
          setError(error);
          
          // Try to load data with default coordinates if cached
          // if (!loadCachedData()) {
          //   setLoading(false);
          // }
        }
      );
    } else if (!latitude && !longitude) {
      console.error("Geolocation is not supported by this browser.");
      setError(new Error("Geolocation is not supported by this browser."));
      
      // Try to load data with default coordinates if cached
      // if (!loadCachedData()) {
      //   setLoading(false);
      // }
    }
  }, []);

  // Fetch Panchang data
  const fetchPanchangData = async () => {
    console.log('austrology.synxup.tech')
    try {
      const response = await axios.get(`https://api.austrology.synxup.tech/api/kundli`, {
        params: {
          datetime: datetime,
          coordinates: coordinates,
        },
      });
      const data = response.data.data.data;
      console.log('data',data)
      setPanchangData(data);
      // saveToCache(CACHE_KEYS.PANCHANG, data);
      return true;
    } catch (error) {
      console.error("Error fetching panchang data:", error);
      setError(error);
      return false;
    }
  };

  // Fetch Calendar data
  const fetchCalendarData = async () => {
    try {
      const response = await axios.get(`https://api.austrology.synxup.tech/calendar`, {
        params: {
          datetime: datetime,
        },
      });
      const data = response.data.data.data;
      setCalenderData(data);
      // saveToCache(CACHE_KEYS.CALENDAR, data);
      return true;
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setError(error);
      return false;
    }
  };

  // Fetch Inauspicious Period data
  const fetchInauspiciousPeriod = async () => {
    try {
      if (!latitude || !longitude) {
        console.error("Latitude or longitude is not available.");
        return false;
      }

      const response = await axios.get("https://api.austrology.synxup.tech/inauspicious-period", {
        params: {
          datetime: datetime,
          coordinates: `${latitude},${longitude}`,
        },
      });

      if (response.data?.data) {
        const data = response.data;
        // saveToCache(CACHE_KEYS.INAUSPICIOUS, data);
        console.log('data is', data)
        setSelectedZodiac(data)
        if (data?.calendar_date) {
          console.log("Calendar Date:", data.calendar_date);
        } else {
          console.warn("calendar_date not found in response");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error fetching inauspicious period:", error);
      setError(error);
      return false;
    }
  };

  // Check if data needs to be refreshed
  const shouldRefreshData = () => {
    // If no data last fetched timestamp exists, refresh is needed
    if (!dataLastFetched) return true;
    
    const now = new Date().getTime();
    // Refresh if cache is older than expiry time
    return (now - dataLastFetched) > CACHE_EXPIRY;
  };

  // Fetch all data
  const fetchData = async () => {
    // Skip fetching if cache is valid
    if (!shouldRefreshData() && panchangData && calenderData) {
      console.log("Using cached data, no need to fetch again");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("Fetching fresh data from API");
    
    const results = await Promise.all([
      fetchPanchangData(),
      fetchCalendarData(),
      fetchInauspiciousPeriod()
    ]);
    
    // Update last fetched timestamp
    const now = new Date().getTime();
    setDataLastFetched(now);
    localStorage.setItem(CACHE_KEYS.LAST_FETCHED, now.toString());
    
    setLoading(false);
    
    // Return true if all fetches were successful
    return results.every(result => result === true);
  };

  // Fetch data when coordinates are available or on refresh if cache expired
  useEffect(() => {
    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude]);
  
  // Manual refresh function for user-triggered refresh
  const handleRefresh = () => {
    fetchData();
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Adjust timezone if needed
    }).format(new Date(timestamp));
  };

  // Click handler for zodiac signs
  const handleZodiacClick = (index) => {
    console.log(`Zodiac sign ${index + 1} clicked`);
    setSelectedZodiac(index);
    
    // Reset selection after 5 seconds
    setTimeout(() => {
      setSelectedZodiac(null);
    }, 5000);
  };

  // Custom loading component with animation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500 mb-6"></div>
        <div className="text-2xl font-bold animate-pulse">Loading your cosmic data...</div>
        <div className="mt-8 text-lg animate-bounce">Connecting with the stars...</div>
      </div>
    );
  }

  // Error state with animation
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-red-500 text-6xl mb-4 animate-pulse">⚠️</div>
        <div className="text-2xl font-bold mb-4">Error fetching cosmic data</div>
        <div className="bg-red-900/50 p-4 rounded-lg animate-bounce">{error.message}</div>
        <button 
          className="mt-6 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white flex bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `url('https://i.postimg.cc/gcLgQHQy/BG-1.jpg')`,
      }}
    >
      {/* Cache status indicator */}
      {dataLastFetched && (
        <div className="absolute top-2 right-2 z-50 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          {new Date().getTime() - dataLastFetched < 60000 
            ? "Fresh data loaded" 
            : `Using cached data (${Math.floor((new Date().getTime() - dataLastFetched) / 60000)} min old)`}
          <button 
            onClick={handleRefresh} 
            className="ml-2 bg-purple-600 px-2 py-1 rounded hover:bg-purple-700"
            aria-label="Refresh data"
          >
            ↻
          </button>
        </div>
      )}
      
      {/* Animated stars background */}
      {showStars && (
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="flex-1 backdrop-blur-sm bg-black/30 relative z-10">
        {/* Glowing pulse effect */}
        {showPulse && (
          <div className="absolute inset-0 bg-purple-500/10 animate-pulse z-0"></div>
        )}
      
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center animate-fadeIn">
            <div className="bg-[#800080] px-5 py-5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#9c27b0]">
              <div className="text-xl">{currentYear}</div>
              <div className="text-sm animate-pulse">{currentMonth}</div>
            </div>
            <div className="ml-14 bg-[#f89635] text-white px-14 py-1 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#ff9800]">
              <div className="text-xl font-bold">Your horoscope</div>
              <div className="text-lg">for today</div>
            </div>
          </div>
          <div className="text-4xl font-bold bg-black p-5 -ml-80 rounded-b-3xl shadow-lg animate-slideDown">
            <span className="animate-pulse">{currentTime}</span>
          </div>
          <div className="flex items-center">
            <div className="bg-[#3f51b5] text-white px-10 py-1 absolute -ml-72 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#5c6bc0]">
              <div className="text-xl font-bold">Your horoscope</div>
              <div className="text-lg">for today</div>
            </div>
            <div className="bg-[#800080] px-[26px] py-2 rounded-sm text-right absolute shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-[#9c27b0]">
              <div className="text-xl">{currentYear}</div>
              <div className="text-sm animate-pulse">Rashi</div>
              <div className="text-sm">Phala</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[auto,1fr] gap-4">
          {/* Left Dates Column */}
          <div className="space-y-5 bg-black w-[90px]">
            {[26, 27, 28, 29, 30, 31].map((date, index) => (
              <div
                key={date}
                className="bg-white text-black w-16 h-16 ml-3 mt-5 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 shadow-lg animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {date}
              </div>
            ))}
            <div className="bg-[#800080] text-white px-2 py-2 rounded-lg shadow-lg animate-pulse">
              <span className="text-xl">TODAY</span>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="grid grid-rows-[auto,1fr] gap-10">
            <div className="min-h-4 p-8">
              <div className="grid ml-28">
                {/* Left side with two yellow components */}
                <div className="grid grid-cols-2 gap-60">
                  {/* First yellow component */}
                  <div className="bg-[#fdf59c] rounded-2xl overflow-hidden p-8 w-[700px] shadow-2xl transform transition-all duration-500 hover:scale-102 animate-fadeIn">
                    <div className="flex gap-10">
                      {/* Left Section */}
                      <div className="space-y-6 text-[#1a237e]">
                        {/* Sunrise/Sunset Times */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 transition-all duration-300 transform hover:translate-x-2">
                            <Sun className="w-6 h-6 animate-spin-slow text-yellow-500" />
                            <span className="text-lg font-semibold">
                              {panchangData?.sunrise
                                ? new Date(panchangData.sunrise).toLocaleTimeString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 transition-all duration-300 transform hover:translate-x-2">
                            <Moon className="w-6 h-6 animate-pulse text-indigo-800" />
                            <span className="text-lg font-semibold">
                              {panchangData?.sunset
                                ? new Date(panchangData.sunset).toLocaleTimeString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        {/* Krishna Paksha */}
                        <div className="flex items-start gap-3 transition-all duration-300 transform hover:translate-y-1">
                          <span className="text-2xl animate-spin-slow">☸</span>
                          <div className="text-base">
                            <div className="font-semibold text-2xl">Krishna Paksha</div>
                            {panchangData?.tithi?.[0] && (
                              <>
                                <div className="text-2xl">{panchangData.tithi[0].name} till</div>
                                <div className="text-[#1565c0] text-2xl font-semibold animate-pulse">
                                  {new Date(panchangData.tithi[0].end).toLocaleTimeString()} next
                                </div>
                                <div className="text-2xl">{panchangData.tithi[1]?.name}</div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Nakshatra */}
                        <div className="flex items-start gap-3 transition-all duration-300 transform hover:translate-y-1">
                          <span className="text-2xl animate-twinkle">⭐</span>
                          <div className="text-2xl">
                            {panchangData?.nakshatra?.[0] && (
                              <>
                                <div>{panchangData.nakshatra[0].name} till</div>
                                <div className="animate-pulse">
                                  {new Date(panchangData.nakshatra[0].end).toLocaleTimeString()} next
                                </div>
                                <div>{panchangData.nakshatra[1]?.name}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Vertical Line */}
                      <div className="w-px bg-[#1a237e]/20 my-2 animate-glow"></div>
                      {/* Right Section */}
                      <div className="text-[#1a237e] flex flex-col justify-center">
                        <div className="text-3xl font-bold animate-fadeIn">{currentMonth}</div>
                        <div className="text-3xl font-bold animate-fadeIn">
                          {panchangData?.vaara || "N/A"}
                        </div>
                        <div className="text-5xl font-bold mt-3 animate-pulse">{formattedDate}</div>
                        <div className="mt-6 space-y-2">
                          <div className="font-semibold text-xl transition-all duration-300 transform hover:translate-x-2">
                            {calenderData && calenderData.calendar_date?.year_name
                              ? `Year - ${calenderData.calendar_date?.year_name}`
                              : "Loading..."}
                          </div>
                          <div className="font-semibold text-xl transition-all duration-300 transform hover:translate-x-2">
                            {calenderData && calenderData.calendar_date?.month_name
                              ? `Month - ${calenderData.calendar_date?.month_name}`
                              : "Loading..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second black component with image */}
                  <div className="bg-black ml-6 rounded-2xl overflow-hidden w-[450px] border-4 border-white shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slideRight">
                    <div className="relative">
                      <img
                        src="https://i.postimg.cc/c4vyC3vX/1-1.jpg"
                        alt="Krishna"
                        className="w-full aspect-square object-cover transition-all duration-700 transform hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
                      {/* Floating stars around the image */}
                      {showStars && Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-float"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 3 + 3}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Kaala Times Grid */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { title: "Amrit Kaal", bg: "#00c853", times: ["04:10 AM", "to", "05:46 AM"] },
                { title: "Dur Muhurath", bg: "#2196f3", times: ["12:51 PM to", "01:36 PM,", "03:05 PM to", "03:50 PM"] },
                { title: "Rahu Kaal", bg: "#9c27b0", times: ["8:16 AM", "to", "9:40 AM"] },
                { title: "Varjyam", bg: "#3f51b5", times: ["07:24 AM to", "09:02 AM,", "06:36 PM to", "08:12 PM"] },
                { title: "Yamaganda", bg: "#f44336", times: ["11:04 AM", "to", "12:28 PM"] }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="rounded-2xl overflow-hidden bg-white shadow-lg transform transition-all duration-500 hover:scale-105 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div 
                    className="text-white p-2 text-center font-bold text-lg animate-pulse"
                    style={{ backgroundColor: item.bg }}
                  >
                    {item.title}
                  </div>
                  <div className="p-4 text-[#1a237e] text-center space-y-1">
                    {item.times.map((time, idx) => (
                      <div 
                        key={idx} 
                        className="transition-all duration-300 transform hover:translate-y-1"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Zodiac Signs Column */}
      <div className="space-y-2 mt-20 bg-black p-4 rounded-lg relative">
        {/* Cosmic energy animation */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-20 bg-purple-500/30 rounded-full animate-float-slow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDuration: `${Math.random() * 5 + 5}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <ZodiacComponent data={selectedZodiac} />
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(15px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideRight {
          animation: slideRight 1s ease-out forwards;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 1s ease-out forwards;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.5); }
          50% { box-shadow: 0 0 20px rgba(255,255,255,0.8); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default App;


