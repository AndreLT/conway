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
            <text class={!props.intervalid && "opacity-20"}>Auto</text>
            <text class={props.intervalid && "opacity-20"}>Paused</text>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <text>Alive</text>
            <text>{props.alive}</text>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <text>Generation</text>
            <text>{props.generation}</text>
        </div>
        <div class="flex justify-between my-2 proportional-nums">
            <div>
                <text>Speed</text>
                <div class="flex">{speedDisplay()}</div>
            </div>
            <div class="flex flex-col">
                <text>{(1000/props.speed).toFixed(2)} Gen./s</text>
                <text class="text-sm">{`x: ${props.cursor.x}, y: ${props.cursor.y}`}</text>
            </div>
        </div>
    </div>
};

export default Display;