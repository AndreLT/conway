import React from 'react';
import { FaDiceD6, FaCut } from 'react-icons/fa';
import { AiOutlineCloseSquare, AiOutlineRotateRight, AiOutlineDelete, AiOutlineCheck} from 'react-icons/ai';
import { CgEditFlipH } from 'react-icons/cg'
import { FiCopy } from 'react-icons/fi';
import { GiSaveArrow } from 'react-icons/gi';

const Toolbar = (props) => {

    let generciButton = (method, icon, id=null) => {
        return (
            <button
                id= {id}
                class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} m-1 bg-gray-100`}
                onClick={() => method()}
            >
                {icon}
            </button>
        )
    }       
    
    if(props.render.model){
        return (
            <div style={{
                position: "absolute",
                displat: "flex",
                left: (props.coordinates.start.x * props.size) - (props.isMobile ? 60 : 38),
                top: (props.coordinates.start.y * props.size) - (props.isMobile ? 60 : 38),
            }}>
                <div 
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        position: "absolute",
                        alignContent: "space-between",
                        top: 38,
                        left: props.coordinates.start.x < 7 ? (props.render.model.area.x * props.size) + 48 : 0,
                        padding: "5px"
                    }}
                    onClick={() => props.dispatch()}
                >
                    <button
                        id="check"
                        class={`flex rounded-md ${props.isMobile ? 'p-4' : 'p-2'} m-1 bg-gray-100`}
                        onClick={() => {
                            props.conceive(props.render.model, props.coordinates.start);
                            props.cancel();
                        }}
                    >
                        <AiOutlineCheck size={props.isMobile ? 20 : 15} color="green" />
                    </button>
                    {generciButton(
                        () => {
                            props.cancel();
                            props.dispatch();
                        },
                        <AiOutlineCloseSquare size={props.isMobile ? 20 : 15} color="red" />
                    )}
                    
                </div>
                <div 
                    style={{
                        display: "flex",
                        position: "absolute",
                        justifyContent: "space-between",
                        top: props.coordinates.start.y < 7 ? (props.render.model.area.y * props.size) + 48 : 0,
                        left: 38,
                        padding: "5px"
                    }}
                    onClick={() => props.dispatch()}
                >
                    {generciButton(
                        () => props.rotate(), 
                        <AiOutlineRotateRight size={props.isMobile ? 20 : 15} color="green" />
                    )}
                    {generciButton(
                        () => props.mirror(), 
                        <CgEditFlipH size={props.isMobile ? 20 : 15} color="green" />
                    )}
                </div>
            </div>
        )
    }else
        return(
            
            <div 
                style={{
                    display: "flex",
                    position: "absolute",
                    justifyContent: "space-between",
                    left: props.coordinates.start.x * props.size,
                    top: ((props.coordinates.start.y < 7 && props.coordinates.end.y + 1) || props.coordinates.start.y - 5) * props.size,
                    padding: "5px"
                }}
                onClick={() => props.dispatch()}
            >
                {generciButton(
                    () => {
                        if(Object.keys(props.render).length > 1){
                            props.cancel()
                            props.copy()
                        }
                    }, 
                    <FiCopy size={props.isMobile ? 20 : 15} color="green" />,
                )}
                {generciButton(
                    () => {
                        if(Object.keys(props.render).length > 1){
                            props.cut();
                            props.dispatch();
                        }
                    },
                    <FaCut size={props.isMobile ? 20 : 15} color="purple" />
                )}
                {generciButton(
                    () => console.log(props.render), 
                    <GiSaveArrow size={props.isMobile ? 20 : 15} color="blue" />
                )}
                {generciButton(
                    () => props.randomize(props.coordinates), 
                    <FaDiceD6 size={props.isMobile ? 20 : 15} color="turquoise" />
                )}
                {generciButton(
                    () => {
                        props.delete(props.coordinates);
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