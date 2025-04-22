import React from 'react'

const SideCalender = () => {
  return (
    <div>
       <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="w-24 overflow-hidden rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-purple-600 text-white px-2 py-1">
          <div className="text-xl font-bold">2025</div>
          <div className="text-sm">January</div>
        </div>
        
        {/* Date Numbers */}
        <div className="bg-black text-white">
          {[26, 27, 28, 29, 30, 31].map((date) => (
            <div 
              key={date}
              className="px-4 py-2 text-center hover:bg-gray-800 cursor-pointer transition-colors"
            >
              {date}
            </div>
          ))}
        </div>
        
        {/* Today Button */}
        {/* <button className="w-full bg-purple-600 text-white py-2 text-sm font-medium hover:bg-purple-700 transition-colors">
          TODAY
        </button> */}
      </div>
    </div>
    </div>
  )
}

export default SideCalender
