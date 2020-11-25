import React from 'react';
import { FaDiceD6 } from 'react-icons/fa';
import { AiOutlineCloseSquare, AiOutlineRotateRight } from 'react-icons/ai';
import { CgEditFlipH } from 'react-icons/cg'
import { FiCopy } from 'react-icons/fi';
import { GiSaveArrow } from 'react-icons/gi';

const Toolbar = (props) => {

    return(
        <div style={{
            display: "flex",
            position: "absolute",
            justifyContent: "space-between",
            left: props.capCoordinates.start.x * props.size,
            top: ((props.capCoordinates.start.y < 7 && props.capCoordinates.end.y + 1) || props.capCoordinates.start.y - 5) * props.size,
            padding: "5px"
        }}>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                onClick={() => props.rotate()}
            >
                <AiOutlineRotateRight size={props.isMobile ? 20 : 15} color="green" />
            </button>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                onClick={() => props.invert()}
            >
                <CgEditFlipH size={props.isMobile ? 20 : 15} color="green" />
            </button>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                onClick={() => this.setState({selected: props.selected})}
            >
                <FiCopy size={props.isMobile ? 20 : 15} color="green" />
            </button>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} mx-1 bg-gray-100`}
                onClick={() => console.log(props.selected)}
            >
                <GiSaveArrow size={props.isMobile ? 20 : 15} color="blue" />
            </button>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} mx-1 bg-gray-100`}
                onClick={() => props.randomize(props.capCoordinates)}
            >
                <FaDiceD6 size={props.isMobile ? 20 : 15} color="turquoise" />
            </button>
            <button
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} ml-1 mr-2 bg-gray-100`}
                onClick={() => {props.cancel(); props.dispatch()}}
            >
                <AiOutlineCloseSquare size={props.isMobile ? 20 : 15} color="red" />
            </button>
        </div>
    )
}

export default Toolbar;