
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { MonthSettings, PhotoSlot, LayoutType, Sticker } from '../types';

interface PhotoAreaProps {
  settings: MonthSettings;
  onUpload: (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdate: (updates: Partial<MonthSettings>) => void;
  selectedSlotIdx: number;
  onSelectSlot: (idx: number) => void;
  monthName: string;
}

const PhotoArea: React.FC<PhotoAreaProps> = ({ settings, onUpload, onUpdate, selectedSlotIdx, onSelectSlot, monthName }) => {
  const { slots, layoutType, maskType, stickers } = settings;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{ type: 'photo' | 'sticker'; idx?: number; stickerId?: string } | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize'>('move');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startState, setStartState] = useState({ x: 0, y: 0, val: 0 });

  // Typographical variance generation
  const bgTextFragments = useMemo(() => {
    const fragments = [];
    const pool = [monthName, "RAY GUN", "EXPERIMENTAL", "EDITORIAL", "2026", "TRIBUNE", "COLLAGE", "FRAGMENT", "HEINEKEN", "LAYOUT", "CARSON", "GRID"];
    for (let i = 0; i < 15; i++) {
      fragments.push({
        text: pool[Math.floor(Math.random() * pool.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotate: Math.random() * 360,
        scale: 0.5 + Math.random() * 4,
        opacity: 0.05 + Math.random() * 0.1,
      });
    }
    return fragments;
  }, [monthName]);

  const getMaskStyle = (slotIdx: number): React.CSSProperties => {
    const activeMask = slots[slotIdx]?.maskOverride || maskType;
    switch (activeMask) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '24px' };
      case 'squircle': return { borderRadius: '35%' };
      case 'torn-1': 
        return { clipPath: `polygon(0% 0%, 15% 4%, 25% 1%, 40% 6%, 55% 2%, 70% 8%, 85% 3%, 100% 5%, 100% 100%, 85% 94%, 75% 98%, 60% 92%, 45% 97%, 30% 93%, 15% 99%, 0% 95%)` };
      case 'torn-2': 
        return { clipPath: `polygon(4% 0%, 96% 2%, 100% 94%, 92% 100%, 8% 98%, 0% 6%)` };
      case 'torn-3': 
        return { clipPath: `polygon(0% 12%, 18% 0%, 82% 4%, 100% 16%, 95% 88%, 78% 100%, 22% 96%, 5% 82%)` };
      case 'torn-4': 
        return { clipPath: `polygon(12% 0%, 88% 0%, 100% 40%, 85% 100%, 15% 100%, 0% 40%)` };
      default: return { borderRadius: '0' };
    }
  };

  const handleMouseDown = (e: React.MouseEvent, target: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (target.type === 'photo') {
      onSelectSlot(target.idx);
    }

    setIsDragging(true);
    setDragTarget(target);
    setDragMode(target.mode);
    setStartPos({ x: e.clientX, y: e.clientY });

    if (target.type === 'photo') {
      const slot = slots[target.idx];
      setStartState({ x: slot.offsetX, y: slot.offsetY, val: slot.zoom });
    } else {
      const sticker = stickers.find(s => s.id === target.stickerId);
      if (sticker) setStartState({ x: sticker.x, y: sticker.y, val: sticker.scale });
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !dragTarget) return;
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      if (dragTarget.type === 'photo') {
        const slotIdx = dragTarget.idx!;
        if (dragMode === 'move') {
          const nextSlots = [...slots];
          nextSlots[slotIdx] = { ...slots[slotIdx], offsetX: startState.x + (dx / 5), offsetY: startState.y + (dy / 5) };
          onUpdate({ slots: nextSlots });
        } else {
          const nextSlots = [...slots];
          nextSlots[slotIdx] = { ...slots[slotIdx], zoom: Math.max(10, startState.val + (dx / 2)) };
          onUpdate({ slots: nextSlots });
        }
      } else {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        if (dragMode === 'move') {
          const nextStickers = stickers.map(s => 
            s.id === dragTarget.stickerId ? { ...s, x: startState.x + (dx/rect.width)*100, y: startState.y + (dy/rect.height)*100 } : s
          );
          onUpdate({ stickers: nextStickers });
        } else {
          const nextStickers = stickers.map(s => 
            s.id === dragTarget.stickerId ? { ...s, scale: Math.max(0.1, startState.val + (dx / 200)) } : s
          );
          onUpdate({ stickers: nextStickers });
        }
      }
    };
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, dragTarget, dragMode, startPos, startState, slots, stickers, onUpdate]);

  const removeSticker = (id: string) => {
    onUpdate({ stickers: stickers.filter(s => s.id !== id) });
  };

  const renderSlot = (idx: number, className: string) => {
    const slot = slots[idx];
    if (!slot) return null;
    const isSelected = selectedSlotIdx === idx;
    const filters = slot.filters;
    
    // Simulate Black Point and White Point using brightness and contrast combinations
    const bp = filters.blackPoint / 100;
    const wp = filters.whitePoint / 100;
    const filterStr = `brightness(${filters.brightness - (bp * 50) + (wp * 50)}%) contrast(${filters.contrast + (bp * 50) + (wp * 50)}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;

    return (
      <div 
        key={idx} 
        className={`relative bg-neutral-200 overflow-hidden group/slot transition-all duration-700 ${className} ${isSelected ? 'ring-4 ring-black ring-inset z-10' : ''}`}
        onClick={() => onSelectSlot(idx)}
        style={getMaskStyle(idx)}
      >
        {!slot.imageUrl ? (
          <label className="absolute inset-0 cursor-pointer flex items-center justify-center p-8 hover:bg-neutral-300 transition-colors">
            <div className="text-black/20 text-center scale-150">
              <span className="block text-6xl font-black mb-2 leading-none">+</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">SLOT_{idx + 1}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(idx, e)} />
          </label>
        ) : (
          <div className="w-full h-full relative">
            <div 
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => handleMouseDown(e, { type: 'photo', idx, mode: 'move' })}
              style={{
                backgroundImage: `url(${slot.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${slot.zoom / 100}) translate(${slot.offsetX}%, ${slot.offsetY}%)`,
                filter: filterStr,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), filter 0.5s ease'
              }}
            />
            
            <div className="absolute top-6 left-6 flex gap-3 no-print opacity-0 group-hover/slot:opacity-100 transition-all duration-300">
              <label className="bg-black text-white p-3 rounded-full shadow-2xl cursor-pointer hover:scale-110 active:scale-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(idx, e)} />
              </label>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const nextSlots = [...slots];
                  nextSlots[idx] = { ...nextSlots[idx], imageUrl: null };
                  onUpdate({ slots: nextSlots });
                }}
                className="bg-white text-black p-3 rounded-full shadow-2xl cursor-pointer hover:bg-red-500 hover:text-white hover:scale-110 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const layouts: Record<LayoutType, React.ReactNode> = {
    'single': <div className="w-full h-full p-2">{renderSlot(0, 'w-full h-full')}</div>,
    'grid-2': <div className="grid grid-cols-2 h-full gap-2 p-2">{renderSlot(0, 'h-full')}{renderSlot(1, 'h-full')}</div>,
    'grid-3': <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-2">{renderSlot(0, 'row-span-2')}{renderSlot(1, '')}{renderSlot(2, '')}</div>,
    'grid-4': <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 p-2">{[0,1,2,3].map(i => renderSlot(i, ''))}</div>,
    'masonry-3': <div className="grid grid-cols-3 h-full gap-2 p-2">{renderSlot(0, 'col-span-2 h-full')}{renderSlot(1, 'h-1/2')}{renderSlot(2, 'absolute bottom-0 right-0 w-1/3 h-1/2')}</div>,
    'masonry-4': <div className="grid grid-cols-4 grid-rows-2 h-full gap-2 p-2">{renderSlot(0, 'col-span-2 row-span-2')}{renderSlot(1, 'col-span-2')}{renderSlot(2, '')}{renderSlot(3, '')}</div>,
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none" style={{ backgroundColor: settings.bgColor }}>
      {/* Background Typography Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {bgTextFragments.map((frag, i) => (
          <div
            key={i}
            className="absolute whitespace-nowrap font-black uppercase italic"
            style={{
              left: `${frag.x}%`,
              top: `${frag.y}%`,
              transform: `translate(-50%, -50%) rotate(${frag.rotate}deg) scale(${frag.scale})`,
              opacity: frag.opacity,
              fontSize: '40px',
              color: 'currentColor',
            }}
          >
            {frag.text}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full h-full">
        {layouts[layoutType]}
      </div>
      
      {/* Stickers Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {stickers.map(s => (
          <div 
            key={s.id}
            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group/sticker"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) scale(${s.scale})` }}
            onMouseDown={(e) => handleMouseDown(e, { type: 'sticker', stickerId: s.id, mode: 'move' })}
          >
            <div className="relative">
              <img src={`https://api.iconify.design/${s.icon}.svg`} className="w-32 h-32 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] select-none" alt="" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                className="absolute -top-6 -left-6 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-2xl opacity-0 group-hover/sticker:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div 
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-black rounded-full border-4 border-white cursor-nwse-resize opacity-0 group-hover/sticker:opacity-100 transition-all no-print shadow-2xl"
                onMouseDown={(e) => handleMouseDown(e, { type: 'sticker', stickerId: s.id, mode: 'resize' })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoArea;
