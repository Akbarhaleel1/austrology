import React, { useState } from 'react';

const DynamicDataComponent = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Function to assign background colors based on position in the list
  const getBackgroundColor = (index) => {
    switch (index) {
      case 0:
        return '#4CAF50'; // Green for first item
      case 1:
        return '#2196F3'; // Blue for second item
      case 2:
        return '#9E9E9E'; // Grey for third item
      case 3:
        return '#1A237E'; // Dark blue for fourth item
      case 4:
        return '#F44336'; // Red for fifth item
      default:
        const colors = ['#4CAF50', '#2196F3', '#9E9E9E', '#1A237E', '#F44336'];
        return colors[index % colors.length];
    }
  };

  const formatTimeOnly = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const handleItemClick = (index) => {
    setSelectedItem(index);
  };
  
  // If data is not available yet, show a loading message
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">Loading data...</div>;
  }
  
  return (
    <div className="flex flex-row space-x-4 overflow-x-auto pb-2">
      {data.map((item, index) => {
        // Format the period array with time-only format
        const periodString = item.period
          .map((timeObj) => `${formatTimeOnly(timeObj.start)} to ${formatTimeOnly(timeObj.end)}`)
          .join(', ');
        
        return (
          <div
            key={item.id} // Use item.id as the key for better uniqueness
            className={`flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-white shadow-lg transform transition-all duration-500 hover:scale-105 animate-fadeIn ${
              selectedItem === index ? 'ring-4 ring-blue-500' : ''
            }`}
            style={{ animationDelay: `${index * 0.15}s` }}
            onClick={() => handleItemClick(index)}
          >
            <div
              className="text-white p-2 text-center font-bold text-lg animate-pulse"
              style={{ backgroundColor: getBackgroundColor(index) }}
            >
              {item.name}
            </div>
            <div className="p-4 text-[#1a237e] text-center">
              {periodString}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicDataComponent;