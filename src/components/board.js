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
    const [canvas, setCanvas] = useState(<Canvas onClick={e => addManually(e)} generation={generation} alive={alive} size={size}/>);
    const [fps, setFps] = useState(300);


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

    const addManually = (e) => {

        let relativeW = e.target.offsetLeft;
        let relativeH = e.target.offsetTop;

        let x = Math.floor((e.clientX - relativeW)/size)
        let y = Math.floor((e.clientY - relativeH)/size)

        
        
        if(intervalId)
            toLive.set(x + '-' + y,{x: x, y: y})
        else{
            alive.set(x + '-' + y, {coord:{x:x, y:y}})
            updateCanvas();
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

    const createModel = (model) => {

        for(let i=1; i<=model["size"];i++){
            toLive.set(model[i].x + '-' + model[i].y,model[i])
        }
        eConceive();
        updateCanvas();
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
        updateCanvas();
    }

    const start = () => {
        setGeneration(1);
    }

    const updateCanvas = () => {
        setCanvas(<Canvas onClick={e => addManually(e)} generation={generation} alive={alive} size={size}/>)
    }
      
        
    return <div class="main">
        <text>Generation: {generation}</text>
        {canvas}
        <div class="button-group">
            <button onClick={()=> start()}>Start</button>
            <button onClick={()=> step()}>Step</button>
            <button onClick={()=> createModel(gun)}>Glider Gun</button>
            <button onClick={()=> createModel(glider)}>Glider</button>
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
}

export default Board;