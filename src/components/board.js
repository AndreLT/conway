import React, {useState, useEffect} from 'react';
import { render } from 'react-dom';

import Canvas from './canvas'

let alive = new Map();
let gun = require('../models/glider_gun.json');
let glider = require('../models/glider.json');
let toLive = new Map();
let toDie = new Map();

const Board = () => {

    const [generation, setGeneration] = useState(0);
    const [intervalId, setIntervalId] = useState(false);
    const [size, setSize] = useState(10);
    const [cursorCoord, setCursorCoord] = useState({x:0,y:0});
    const [canvas, setCanvas] = useState(<Canvas cursor={cursorCoord} generation={generation} alive={alive} size={size}/>);
    const [fps, setFps] = useState(300);
    const [placement, setPlacement] = useState(null);
    const [pattern, setPattern] = useState(null);

    const canvasProps = () => {
        return {
            cursor: cursorCoord,
            generation: generation,
            alive: alive,
            size: size,
            model: placement
        }
    }


    const rNeighbours = (element, testdead) => {

        let neighbours = 0;
        for(let i=element.coord.x-1; i<=element.coord.x+1; i++){
            for(let j=element.coord.y-1; j<=element.coord.y+1; j++){
                if(alive.has(i + '-' + j)){
                    neighbours++;
                }
                else if(testdead && rNeighbours({coord:{x: i, y: j}}, false) === 2){
                    toLive.set(i + '-' + j,{x:i, y:j})
                }
            }
        }
        return neighbours -1;
    }

    const drawBoard = () => {
        console.log("drew board");
    }

    const handleKeyPress = (key) => {
        let newCursor = null;
        switch(key){
            case 'ArrowUp':
                newCursor = {x:cursorCoord.x ,y:cursorCoord.y - 1}
                break;
            case 'ArrowDown':
                newCursor = {x:cursorCoord.x ,y:cursorCoord.y + 1}
                break;
            case 'ArrowRight':
                newCursor = {x:cursorCoord.x + 1 ,y:cursorCoord.y}
                break;
            case 'ArrowLeft':
                newCursor = {x:cursorCoord.x - 1 ,y:cursorCoord.y}
                break;
            case 'a':
                if(placement){
                    setPlacement(null);
                    conceiveModel();
                } else {
                    alive.set(cursorCoord.x + '-' + cursorCoord.y,{coord:{x:cursorCoord.x, y:cursorCoord.y}}) 
                }
            default:
                console.log('key not implemented')
        }
        if(newCursor){
            let {cursor, ...newProps} = canvasProps();
            if(pattern)
                drawModel(pattern)
            updateCanvas({cursor: newCursor, ...newProps});
            setCursorCoord(newCursor)
        }
    }

    const runtime = (speed) => {
        const intId = window.setInterval(() => step(), speed);
        setIntervalId(intId);
    }

    const stop = () => {
        clearInterval(intervalId);
        setIntervalId(false);
    }

    const speed = (news) => {
        stop();
        runtime(news);
        setFps(news);
    }

    const conceiveModel = () => {
        placement.forEach(element => {
            alive.set(element.x + '-' + element.y, {coord: element})
        });
    }

    const drawModel = (pattern) => {
        let blueprint = [];
        for(let i=1; i<=pattern["size"];i++){
            blueprint.push({x:pattern[i].x + cursorCoord.x, y:pattern[i].y + cursorCoord.y})
        }
        setPlacement(blueprint);
        let {model, ...newProps} = canvasProps();
        updateCanvas({model: blueprint, ...newProps});
    } 

    const eConceive = () => {
        for (let [key, value] of toLive) {
            alive.set(key, {coord: value})
        }
        toLive.clear();
    }

    const eKill = () => {
        for (let [key, value] of toDie) {
            alive.delete(key)
        }
        toDie.clear();
    }

    const step = () => {
        
        for (let [key, value] of alive) {
            let neighbours = rNeighbours(value, true);

            if(neighbours > 3 || neighbours < 2)
                toDie.set(key, value);
        };
        setGeneration(generation+1)
        eConceive();
        eKill();
        updateCanvas(canvasProps());
    }

    const start = () => {
        setGeneration(1);
    }

    const updateCanvas = (newProps) => {
        setCanvas(<Canvas {...newProps}/>)
    }
      
    const placeModel = (model) => {
        setPattern(model);
        drawModel(model);
    }
        
    return <div class="main" onKeyDown={(e)=>handleKeyPress(e.key)}>
        <div class="side-menu">
            <text>Generation: {generation}</text>
            <div class="button-group">
                <button onClick={()=> start()}>Start</button>
                <button onClick={()=> step()}>Step</button>
                <button onClick={()=> placeModel(gun)}>Glider Gun</button>
                <button onClick={()=> placeModel(glider)}>Glider</button>
                <button onClick={()=> drawBoard()}>Clear Board</button>
                <button onClick={()=> runtime(fps)} disabled={intervalId}>Run Simulation</button>
                <button onClick={()=> stop()}>Stop Simulation</button>
            </div>
            <div>
                <text>Speed Control</text>
                <button onClick={()=> speed(fps+50)} disabled={fps >= 2000}>-</button>
                <button onClick={()=> speed(fps-50)} disabled={fps <= 50}>+</button>
            </div>
        </div>
        {canvas}
    </div>
}

export default Board;