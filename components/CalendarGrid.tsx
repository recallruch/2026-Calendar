
import React from 'react';
import { WEEK_DAYS, MARKER_ICONS } from '../constants';
import { generateGridDays } from '../utils/calendarUtils';
import { Marker } from '../types';

interface CalendarGridProps {
  monthIndex: number;
  fontFamily: string;
  markers: Record<number, Marker>;
  onDateClick: (day: number) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ monthIndex, fontFamily, markers, onDateClick }) => {
  const gridDays = generateGridDays(monthIndex, 2026);

  const renderMarker = (marker: Marker) => {
    if (marker.type === 'text') {
      return (
        <span className="text-[12px] leading-tight font-black uppercase opacity-90 truncate w-full block mt-1 text-center bg-black/10 rounded px-1 tracking-tighter">
          {marker.value}
        </span>
      );
    }
    const icon = MARKER_ICONS.find(i => i.id === marker.value);
    if (!icon) return null;
    return (
      <div className="w-6 h-6 mt-1 opacity-90 mx-auto transition-transform hover:scale-125 hover:rotate-6" dangerouslySetInnerHTML={{ __html: icon.svg }} />
    );
  };

  return (
    <div className="flex flex-col h-full w-full p-2 select-none" style={{ fontFamily }}>
      {/* Week Day Headers - Minimalist & Spaced */}
      <div className="grid grid-cols-7 mb-6 opacity-30">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center py-1 text-[12px] font-black uppercase tracking-[0.4em]">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid - Aggressive scale for dates */}
      <div className="grid grid-cols-7 grid-rows-6 flex-grow gap-px">
        {gridDays.map((day, idx) => (
          <div 
            key={idx} 
            onClick={() => day !== null && onDateClick(day)}
            className={`group/day p-2 flex flex-col items-center justify-start border border-black/5 hover:bg-black/[0.02] cursor-pointer transition-all duration-300 ${
              day === null ? 'opacity-0 pointer-events-none' : 'opacity-100 active:scale-90'
            }`}
          >
            {day && (
              <>
                <span className="text-4xl md:text-5xl font-black tracking-[-0.08em] leading-[0.8] mb-1 transition-all group-hover/day:scale-110 group-hover/day:-rotate-3">
                  {day}
                </span>
                <div className="flex flex-col items-center w-full min-h-[14px]">
                  {markers[day] && renderMarker(markers[day])}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
