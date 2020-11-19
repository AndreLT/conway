import React from 'react';
import {FaPlay} from 'react-icons/fa';

const Display = (props) => {

    const speedDisplay = () => {
        return <>
            <FaPlay size={8} />
            <FaPlay class={props.fps > 600 && 'opacity-20'} size={8} />
            <FaPlay class={props.fps > 400 && 'opacity-20'} size={8} />
            <FaPlay class={props.fps > 200 && 'opacity-20'} size={8} />
            <FaPlay class={props.fps > 50 && 'opacity-20'} size={8} />
        </>  
    }

    return <div class="w-11/12 flex flex-col rounded-md px-5 py-2 mt-8 mx-auto bg-retro border-solid border-4 border-white opacity-80 text-opacity-75 font-semibold font-mono text-sm shadow-screen">
        <div class="flex justify-between">
            <span class={!props.intervalid && "opacity-20"}>Auto</span>
            <span class={props.intervalid && "opacity-20"}>Paused</span>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <span>Alive</span>
            <span>{props.alive}</span>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <span>Generation</span>
            <span>{props.generation}</span>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <div>
                <span>Speed</span>
                <div class="flex">{speedDisplay()}</div>
            </div>
            <div class="flex flex-col">
                <span>{(1000/props.speed).toFixed(2)} Gen./s</span>
                <span class="text-sm">{`x: ${props.cursor.x}, y: ${props.cursor.y}`}</span>
            </div>
        </div>
    </div>
};

export default Display;