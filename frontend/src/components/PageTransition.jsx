import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, trigger }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Fade out
        setShow(false);
        
        // Fade in after a short delay
        const timer = setTimeout(() => {
            setShow(true);
        }, 50);

        return () => clearTimeout(timer);
    }, [trigger]);

    return (
        <div 
            className={`transition-all duration-300 ease-in-out ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            {children}
        </div>
    );
};

export default PageTransition;
