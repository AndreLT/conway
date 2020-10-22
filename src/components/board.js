import React, {useState} from 'react';
import { render } from 'react-dom';

import Canvas from './canvas'

let alive = new Map();
let gun = require('../models/glider_gun.json');
let glider = require('../models/glider.json');
let toLive = new Map();
let toDie = new Map();

const Board = () => {
    
    const [generation, setGeneration] = useState(0);


    const rNeighbours = (element, testdead) => {

        let neighbours = 0;
        for(let i=element.coord.x-1; i<=element.coord.x+1; i++){
            for(let j=element.coord.y-1; j<=element.coord.y+1; j++){
                if(alive.has(i + '-' + j)){
                    neighbours++;
                }
                else if(testdead && rNeighbours({coord:{x: i, y: j}}, false) == 2){
                    toLive.set(i + '-' + j,{x:i, y:j})
                }
            }
        }
        return neighbours -1;
    }

    const createModel = (model) => {

        for(let i=1; i<=model["size"];i++){
            toLive.set(model[i].x + '-' + model[i].y,model[i])
        }
        eConceive();
    } 

    const eConceive = () => {
        for (let [key, value] of toLive) {
            alive.set(key, {coord: value})
        }
        toLive.clear();
    }

    const eKill = () => {
        console.log(toDie)
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
        eConceive();
        eKill();
        setGeneration(generation+1);
    }

    const start = () => {
        setGeneration(1);
    }
        
    return <>
        <text>Generation: {generation}</text>
        {alive.size ? 
            <Canvas alive={alive} size={10}/>
            : null
        }
        <button onClick={()=> start()}>Start</button>
        <button onClick={()=> step()}>Step</button>
        <button onClick={()=> createModel(gun)}>Glider Gun</button>
        <button onClick={()=> createModel(glider)}>Glider</button>
    </>
}

export default Board;