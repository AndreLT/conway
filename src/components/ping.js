import React from 'react';
import {FaArrowLeft,  FaArrowRight} from 'react-icons/fa'

const Ping = (props) => {
    if(props.isTutorial)
        return(
            <div class="flex align-center">
                <div class="relative w-full mx-2 my-1">
                    <span class="absolute animate-ping w-full h-full rounded-md bg-blue-300 opacity-75"/>
                    {props.children}
                </div>
                {props.direction == 'left' &&  <FaArrowRight size={30} class="animate-bounce mx-4 mt-2 absolute"/>}
                {props.direction == 'right' &&  <FaArrowLeft size={30} class="animate-bounce m-4"/>}
            </div>
        )
    else 
        return <div class="relative">{props.children}</div>
}
export default Ping;