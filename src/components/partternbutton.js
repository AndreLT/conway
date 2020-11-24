import React from 'react';

const PatternButton = (props) => {
    return <button 
        class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}
        {...props}
    >
        {props.children}
    </button>
}

export default PatternButton;