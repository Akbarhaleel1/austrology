import React, { useState } from 'react';

const ZodiacComponent = ({ data }) => {
  const [selectedZodiac, setSelectedZodiac] = useState(null);

  // Map the data to the expected structure
  const zodiacSigns = data.map((item, index) => ({
    id: item.id,
    name: item.name,
    bg: '#FFFFFF', // Default background color, adjust as needed
    icon: 'path/to/icon', // Default icon path, adjust as needed
    animationDelay: `${index * 0.1}s`, // Adjust animation delay as needed
  }));

  const handleZodiacClick = (index) => {
    setSelectedZodiac(index);
  };

  return (
    <div>
      {zodiacSigns.map((sign, index) => (
        <div
          key={sign.id}
          className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 transform hover:scale-110 animate-fadeIn ${
            selectedZodiac === index ? 'animate-bounce' : ''
          }`}
          style={{
            backgroundColor: sign.bg,
            animationDelay: sign.animationDelay,
            boxShadow: selectedZodiac === index ? '0 0 20px 5px rgba(255,255,255,0.7)' : 'none',
          }}
          onClick={() => handleZodiacClick(index)}
        >
          <img
            src={sign.icon}
            alt={`Zodiac Sign ${sign.name}`}
            className={`w-full h-full rounded-full object-cover transition-all duration-500 ${
              selectedZodiac === index ? 'animate-spin-slow' : ''
            }`}
          />
          {/* Glow effect for selected zodiac */}
          {selectedZodiac === index && (
            <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse z-0"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ZodiacComponent;