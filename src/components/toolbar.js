import React from 'react';
import { FaDiceD6 } from 'react-icons/fa';
import { AiOutlineCloseSquare, AiOutlineRotateRight, AiOutlineDelete } from 'react-icons/ai';
import { CgEditFlipH } from 'react-icons/cg'
import { FiCopy } from 'react-icons/fi';
import { GiSaveArrow } from 'react-icons/gi';

const Toolbar = (props) => {

    let generciButton = (method, icon) => {
        return (
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                onClick={() => method()}
            >
                {icon}
            </button>
        )
    }       

    return(
        <div 
            style={{
                display: "flex",
                position: "absolute",
                justifyContent: "space-between",
                left: props.capCoordinates.start.x * props.size,
                top: ((props.capCoordinates.start.y < 7 && props.capCoordinates.end.y + 1) || props.capCoordinates.start.y - 5) * props.size,
                padding: "5px"
            }}
            onClick={() => props.dispatch()}
        >
            {generciButton(
                props.rotate, 
                <AiOutlineRotateRight size={props.isMobile ? 20 : 15} color="green" />
            )}
            {generciButton(
                props.invert, 
                <CgEditFlipH size={props.isMobile ? 20 : 15} color="green" />
            )}
            {generciButton(
                () => console.log('To be implemented'), 
                <FiCopy size={props.isMobile ? 20 : 15} color="green" />
            )}
            {generciButton(
                () => console.log(props.selected), 
                <GiSaveArrow size={props.isMobile ? 20 : 15} color="blue" />
            )}
            {generciButton(
                () => props.randomize(props.capCoordinates), 
                <FaDiceD6 size={props.isMobile ? 20 : 15} color="turquoise" />
            )}
            {generciButton(
                () => {
                    props.delete(props.capCoordinates);
                    props.dispatch();
                },
                <AiOutlineDelete size={props.isMobile ? 20 : 15} color="turquoise" />
            )}
            {generciButton(
                () => {
                    props.cancel();
                    props.dispatch();
                },
                <AiOutlineCloseSquare size={props.isMobile ? 20 : 15} color="red" />
            )}
        </div>
    )
}

export default Toolbar;