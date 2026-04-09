import React from 'react';

export default function Intro() {
  return (
    <iframe 
      src="/3d-intro.html" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        border: 'none', 
        zIndex: 50,
        backgroundColor: '#000',
        margin: 0, 
        padding: 0
      }}
      title="Zero-G 3D Intro"
    />
  );
}
