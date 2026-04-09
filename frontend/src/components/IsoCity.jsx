import React, { useMemo } from 'react';

export default function IsoCity() {
  const buildings = useMemo(() => {
    const arr = [];
    // Generate 60 buildings for a dense city skyline
    for (let i = 0; i < 60; i++) {
        const layer = Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 2 : 3;
        arr.push({
            id: i,
            layer: layer, 
            w: 30 + Math.random() * 50,
            h: 150 + Math.random() * 300 + (layer === 3 ? 150 : 0), 
            d: 30 + Math.random() * 40,
            delay: Math.random() * -60, 
            duration: layer === 1 ? 25 + Math.random() * 10 : layer === 2 ? 40 + Math.random() * 10 : 60 + Math.random() * 20
        });
    }
    return arr.sort((a,b) => b.layer - a.layer);
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none overflow-hidden z-0 bg-[#020617]">
       {/* Background gradient sky */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b] opacity-80"></div>
       
       {/* Floor / Ground Plane fog */}
       <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#020617] to-transparent z-20"></div>
       
       <div className="relative w-full h-full">
         {buildings.map(b => (
             <div 
                key={b.id}
                className={`iso-building iso-layer-${b.layer}`}
                style={{
                  '--w': `${b.w}px`,
                  '--h': `${b.h}px`,
                  '--d': `${b.d}px`,
                  animationDuration: `${b.duration}s`,
                  animationDelay: `${b.delay}s`
                }}
             />
         ))}
       </div>
    </div>
  )
}
