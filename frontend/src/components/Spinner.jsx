import React from 'react';

export const Spinner = ({ size = "h-5 w-5" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-t-2 border-white ${size}`}></div>
);