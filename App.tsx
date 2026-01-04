
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { MONTH_NAMES, FONT_OPTIONS, INITIAL_MONTH_SETTINGS, MARKER_ICONS, DESIGN_COLORS } from './constants';
import { CalendarData, MonthSettings, Marker, Sticker, LayoutType, PhotoSlot } from './types';
import CalendarGrid from './components/CalendarGrid';
import PhotoArea from './components/PhotoArea';

const App: React.FC = () => {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [monthsData, setMonthsData] = useState<CalendarData>(
    Array(12).fill(null).map(() => ({ ...INITIAL_MONTH_SETTINGS }))
  );
  const [history, setHistory] = useState<CalendarData[]>([]);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [markerText, setMarkerText] = useState('');
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSettings = monthsData[currentMonthIdx];

  const saveToHistory = useCallback(() => {
    setHistory(prev => [JSON.parse(JSON.stringify(monthsData)), ...prev].slice(0, 50));
  }, [monthsData]);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const [last, ...rest] = history;
      setMonthsData(last);
      setHistory(rest);
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  const updateCurrentMonth = useCallback((updates: Partial<MonthSettings>) => {
    saveToHistory();
    setMonthsData(prev => {
      const next = [...prev];
      next[currentMonthIdx] = { ...next[currentMonthIdx], ...updates };
      return next;
    });
  }, [currentMonthIdx, saveToHistory]);

  const updateSlot = useCallback((slotIdx: number, updates: Partial<PhotoSlot>) => {
    const nextSlots = [...currentSettings.slots];
    nextSlots[slotIdx] = { ...nextSlots[slotIdx], ...updates };
    updateCurrentMonth({ slots: nextSlots });
  }, [currentSettings, updateCurrentMonth]);

  const handleFileUpload = (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSlot(slotIdx, { imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateClick = (day: number) => {
    setEditingDay(day);
    setMarkerText(currentSettings.markers[day]?.type === 'text' ? currentSettings.markers[day].value : '');
  };

  const addMarker = (marker: Marker | null) => {
    if (editingDay === null) return;
    const newMarkers = { ...currentSettings.markers };
    if (marker) newMarkers[editingDay] = marker;
    else delete newMarkers[editingDay];
    updateCurrentMonth({ markers: newMarkers });
    setEditingDay(null);
  };

  const addSticker = (icon: string) => {
    const newSticker: Sticker = { id: Math.random().toString(36).substr(2, 9), icon, x: 50, y: 50, scale: 1 };
    updateCurrentMonth({ stickers: [...currentSettings.stickers, newSticker] });
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSlot = currentSettings.slots[selectedSlotIdx];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row print:bg-white print:block overflow-x-hidden">
      
      {/* Sidebar - Collage Controls */}
      <aside className="no-print w-full md:w-96 bg-white border-r-4 border-black p-10 flex-shrink-0 z-10 overflow-y-auto max-h-screen sticky top-0 custom-scrollbar">
        <div className="space-y-12 pb-20">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-black leading-none tracking-[-0.1em] italic uppercase">Collage_V2</h1>
            <div className="h-2 w-full bg-black"></div>
            <p className="text-[12px] font-black text-neutral-400 uppercase tracking-[0.4em]">Pro Studio Protocol</p>
          </div>

          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300">Architecture</h2>
            <div className="grid grid-cols-2 gap-4">
               <select 
                value={currentMonthIdx} 
                onChange={(e) => setCurrentMonthIdx(parseInt(e.target.value))}
                className="col-span-2 p-5 bg-black text-white rounded-3xl outline-none font-black text-2xl transition-all cursor-pointer shadow-2xl"
              >
                {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name.toUpperCase()}</option>)}
              </select>
              {(['single', 'grid-2', 'grid-3', 'grid-4', 'masonry-3', 'masonry-4'] as LayoutType[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => updateCurrentMonth({ layoutType: l })}
                  className={`py-4 border-4 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${currentSettings.layoutType === l ? 'bg-black text-white border-black scale-105 shadow-2xl' : 'bg-white text-black border-neutral-100 hover:border-black'}`}
                >
                  {l.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap pt-4 justify-between">
              {DESIGN_COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => updateCurrentMonth({ bgColor: c })}
                  className={`w-10 h-10 rounded-full border-4 shadow-xl transition-all hover:scale-125 active:rotate-12 ${currentSettings.bgColor === c ? 'border-black ring-4 ring-neutral-200' : 'border-white'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </section>

          <section className="space-y-6 p-8 bg-black rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2">Pro_Slot_Modification</h2>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {currentSettings.slots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlotIdx(i)}
                  className={`flex-shrink-0 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedSlotIdx === i ? 'bg-white text-black scale-110' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            {currentSlot && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Torn_Mask_Variation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'torn-1', 'torn-2', 'torn-3', 'torn-4', 'circle'] as const).map(m => (
                      <button 
                        key={m}
                        onClick={() => updateSlot(selectedSlotIdx, { maskOverride: m })}
                        className={`py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${currentSlot.maskOverride === m ? 'bg-white text-black border-white' : 'text-neutral-500 border-neutral-800'}`}
                      >
                        {m.replace('torn-', 'RIP ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 border-t border-neutral-800 pt-6">
                  {[
                    { label: 'Brightness', key: 'brightness', min: 0, max: 200 },
                    { label: 'Contrast', key: 'contrast', min: 0, max: 200 },
                    { label: 'Black Point', key: 'blackPoint', min: 0, max: 100 },
                    { label: 'White Point', key: 'whitePoint', min: 0, max: 100 },
                    { label: 'Saturation', key: 'saturation', min: 0, max: 200 },
                    { label: 'Grayscale', key: 'grayscale', min: 0, max: 100 },
                  ].map(f => (
                    <div key={f.key} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                        <span>{f.label}</span>
                        <span className="text-white">{currentSlot.filters[f.key as keyof typeof currentSlot.filters]}%</span>
                      </div>
                      <input 
                        type="range" min={f.min} max={f.max} 
                        value={currentSlot.filters[f.key as keyof typeof currentSlot.filters]} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateSlot(selectedSlotIdx, { filters: { ...currentSlot.filters, [f.key]: val } });
                        }}
                        className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300">Typography</h2>
            <div className="grid grid-cols-1 gap-3">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.family}
                  onClick={() => setSelectedFont(font)}
                  className={`px-8 py-5 rounded-[40px] text-left border-4 transition-all group ${
                    selectedFont.family === font.family ? 'border-black bg-neutral-100 text-black shadow-2xl scale-[1.02]' : 'border-neutral-50 text-neutral-400 hover:border-black bg-white'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <span className="block text-lg font-black tracking-tight uppercase italic">{font.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300">Collage_Elements</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                'fluent-emoji:high-voltage', 'fluent-emoji:collision', 'fluent-emoji:paperclip',
                'fluent-emoji:sun', 'fluent-emoji:sparkles', 'fluent-emoji:cloud',
                'fluent-emoji:pushpin', 'fluent-emoji:eye', 'fluent-emoji:ghost',
                'fluent-emoji:bandage', 'fluent-emoji:label', 'fluent-emoji:fire'
              ].map(icon => (
                <button key={icon} onClick={() => addSticker(icon)} className="p-4 bg-white rounded-3xl hover:scale-125 hover:rotate-6 active:scale-90 transition-all border-4 border-neutral-100 shadow-xl hover:border-black">
                  <img src={`https://api.iconify.design/${icon}.svg`} className="w-full aspect-square" alt="" />
                </button>
              ))}
            </div>
          </section>

          <div className="pt-10">
            <button 
              onClick={handlePrint}
              className="w-full bg-black text-white py-10 rounded-[60px] font-black text-xl uppercase tracking-[0.2em] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] hover:bg-neutral-800 transition-all active:scale-95 border-b-[16px] border-neutral-900"
            >
              EXECUTE_PRINT
            </button>
          </div>
        </div>
      </aside>

      {/* Main Collage Canvas */}
      <main className="flex-grow flex items-center justify-center p-16 print:p-0 bg-neutral-100 min-h-screen relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>

        <div 
          ref={canvasRef}
          className="print-canvas relative shadow-[0_120px_200px_-60px_rgba(0,0,0,0.6)] overflow-hidden print:shadow-none bg-white"
          style={{ 
            aspectRatio: '297 / 420',
            width: '100%',
            maxWidth: '900px',
            fontFamily: selectedFont.family,
            backgroundColor: currentSettings.bgColor,
            color: currentSettings.bgColor === '#000000' || currentSettings.bgColor === '#111827' ? '#FFFFFF' : '#000000',
            imageRendering: 'auto'
          }}
        >
          <div className="flex flex-col h-full w-full">
            {/* Top 2/3 - Collage Photos */}
            <div className="h-[65%] w-full relative z-10 border-b-8 border-current">
              <PhotoArea 
                settings={currentSettings} 
                onUpload={handleFileUpload} 
                onUpdate={updateCurrentMonth}
                selectedSlotIdx={selectedSlotIdx}
                onSelectSlot={setSelectedSlotIdx}
                monthName={MONTH_NAMES[currentMonthIdx]}
              />
            </div>

            {/* Bottom 1/3 - Experimental Grid */}
            <div className="h-[35%] w-full flex items-stretch relative overflow-hidden">
              
              <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
                 <span className="text-[25rem] font-black uppercase tracking-[-0.15em] leading-none whitespace-nowrap">
                    {MONTH_NAMES[currentMonthIdx]}
                  </span>
              </div>

              <div className="flex-grow p-10 relative z-20">
                <CalendarGrid 
                  monthIndex={currentMonthIdx} 
                  fontFamily={selectedFont.family} 
                  markers={currentSettings.markers}
                  onDateClick={handleDateClick}
                />
              </div>

              <div className="w-48 flex items-center justify-center border-l-8 border-current bg-current/[0.03] relative z-20 overflow-hidden group">
                <div className="rotate-90 whitespace-nowrap transition-all duration-700 group-hover:scale-125 group-hover:tracking-[0.2em]">
                  <span className="text-8xl font-black uppercase tracking-[-0.08em] italic">
                    {MONTH_NAMES[currentMonthIdx].substring(0, 3)}
                  </span>
                  <span className="text-8xl font-thin ml-6 opacity-40">/26</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Experimental Modals */}
      {editingDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl no-print p-10">
          <div className="bg-white p-16 rounded-[80px] shadow-2xl w-full max-w-2xl space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-8xl font-black tracking-[-0.1em] uppercase italic text-black leading-none">DAY_{editingDay}</h2>
              <div className="h-4 w-40 bg-black mx-auto"></div>
            </div>
            
            <input 
              autoFocus value={markerText}
              onChange={(e) => setMarkerText(e.target.value)}
              className="w-full p-10 bg-neutral-100 rounded-[60px] outline-none border-8 border-neutral-50 focus:border-black text-5xl font-black transition-all text-center uppercase tracking-tighter"
              placeholder="INPUT_LABEL"
            />

            <div className="flex flex-col gap-6 pt-10">
              <button 
                onClick={() => addMarker(markerText ? { type: 'text', value: markerText } : null)} 
                className="w-full bg-black text-white px-12 py-8 rounded-[60px] font-black text-2xl uppercase tracking-[0.4em] hover:bg-cyan-500 transition-all shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] active:scale-95"
              >
                SAVE_DATA
              </button>
              <button 
                onClick={() => setEditingDay(null)} 
                className="w-full text-neutral-300 font-black py-4 text-[12px] uppercase tracking-[0.5em] hover:text-black transition-colors"
              >
                DISCARD_CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
