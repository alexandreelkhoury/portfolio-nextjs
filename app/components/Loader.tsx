// Loader.js
'use client';
import React from 'react';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loader;