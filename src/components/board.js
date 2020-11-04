import React, {useState, useEffect} from 'react';
import {FaPlay, FaStepForward, FaPause, FaForward, FaBackward} from 'react-icons/fa'

import Canvas from './canvas'

let alive = new Map();
let gun = require('../models/glider_gun.json');
let glider = require('../models/glider.json');
let toLive = new Map();
let toDie = new Map();
let data = {};

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            generation: 0,
            intervalid: null,
            size: 10,
            cursorcoord: {x:0, y:0},
            canvas: <Canvas alive={alive} size={10} cursor={{x:0, y:0}} />,
            fps: 300,
            placement: null,
            pattern: null,
            res: null
       }
    }

    dispatch = () => {
        let updated = this.state;
        Object.assign(updated, {...data});
        Object.assign(updated, {canvas: <Canvas model={updated.placement} size={updated.size} cursor={updated.cursorcoord} alive={alive} />})
        this.setState({...updated})
        data = {};
    }

    rNeighbours = (element, testdead) => {
        let neighbours = 0;
        for(let i=element.coord.x-1; i<=element.coord.x+1; i++){
            for(let j=element.coord.y-1; j<=element.coord.y+1; j++){
                if(alive.has(i + '-' + j)){
                    neighbours++;
                }
                else if(testdead && this.rNeighbours({coord:{x: i, y: j}}, false) === 2){
                    toLive.set(i + '-' + j,{x:i, y:j})
                }
            }
        }
        return neighbours -1;
    }

    handleKeyPress(key){

        const updateCursor = (difference) => {
            /// NEEDS TO VERIFY BOUNDS
            if(difference.x >= 0 && difference.y >= 0)
                Object.assign(data, {cursorcoord: difference})
            if(this.state.pattern){
                this.drawModel(this.state.pattern, difference);
            }
        }

        switch(key){
            case 'ArrowUp':
                updateCursor({x:this.state.cursorcoord.x ,y:this.state.cursorcoord.y - 1})
                break;
            case 'ArrowDown':
                updateCursor({x:this.state.cursorcoord.x ,y:this.state.cursorcoord.y + 1})
                break;
            case 'ArrowRight':
                updateCursor({x:this.state.cursorcoord.x + 1 ,y:this.state.cursorcoord.y})
                break;
            case 'ArrowLeft':
                updateCursor({x:this.state.cursorcoord.x - 1 ,y:this.state.cursorcoord.y})
                break;
            case 'a':
                if(this.state.placement){
                    this.conceiveModel();
                    Object.assign(data, {placement: null, pattern: null})
                } else {
                    let coord = this.state.cursorcoord;
                    alive.set(coord.x + '-' + coord.y,{coord:{x:coord.x, y:coord.y}}) 
                }
        }
        this.dispatch();
    }

    runtime = (speed) => {
        const id = window.setInterval(() => this.step(), speed);
        this.setState({intervalid: id})
    }

    stop = () => {
        clearInterval(this.state.intervalid);
        this.setState({intervalid: null})
    }

    speed = (news) => {
        this.stop();
        this.runtime(news);
        this.setState({fps: news})
    }

    conceiveModel = () => {
        this.state.placement.forEach(element => {
            alive.set(element.x + '-' + element.y, {coord: element})
        });
    }

    drawModel = (pattern, coordinates) => {
        let blueprint = [];
        for(let i=1; i<=pattern["size"];i++){
            blueprint.push({x:pattern[i].x + coordinates.x, y:pattern[i].y + coordinates.y})
        }
        Object.assign(data, {placement: blueprint, cursorcoord: coordinates});
    } 

    eConceive = () => {
        for (let [key, value] of toLive) {
            alive.set(key, {coord: value})
        }
        toLive.clear();
    }

    eKill = () => {
        for (let [key, value] of toDie) {
            alive.delete(key)
        }
        toDie.clear();
    }

    step = () => {

        if(alive.size){
            for (let [key, value] of alive) {
                let neighbours = this.rNeighbours(value, true);
                
                if(neighbours > 3 || neighbours < 2)
                    toDie.set(key, value);
            };
            
            if(toDie.size && toLive.size){
                Object.assign(data, {generation: this.state.generation+1})
                this.eConceive();
                this.eKill();
            }else{
                alert("Stable")
                this.stop();
            }
            
        }else{
            this.stop();
        }
            this.dispatch();
    }
      
    placeModel = (model) => {
        Object.assign(data, {pattern: model})
        this.drawModel(model, data.cursorcoord ? data.cursorcoord : this.state.cursorcoord);
        this.dispatch();
    }

    speedDisplay = () => {
        return <>
            <FaPlay size={8} />
            <FaPlay class={this.state.fps > 600 && 'opacity-20'} size={8} />
            <FaPlay class={this.state.fps > 400 && 'opacity-20'} size={8} />
            <FaPlay class={this.state.fps > 200 && 'opacity-20'} size={8} />
            <FaPlay class={this.state.fps > 50 && 'opacity-20'} size={8} />
        </>
        
    }

    updateWindowDimensions = () => {
        this.setState({res: {width: window.innerWidth, height: window.innerHeight}});
    }

    componentDidMount(){
        window.addEventListener('resize', this.updateWindowDimensions());
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.updateWindowDimensions());
    }
    
    render() {

        return <div class="bg-gray-100 flex justify-between h-screen w-full" onKeyDown={(e)=> this.handleKeyPress(e.key)}>
            <div class="px-4 w-2/6 bg-gray-100 mr-4 shadow-2xl">
                <div class="w-11/12 flex flex-col rounded-md px-5 py-2 mt-8 mx-auto bg-retro border-solid border-4 border-white opacity-80 font-semibold font-mono shadow-screen">
                    <div class="flex justify-between">
                        <text class={!this.state.intervalid && "opacity-20 text-size-10"}>Auto</text>
                        <text class={this.state.intervalid && "opacity-20"}>Paused</text>
                    </div>
                    <div class="flex justify-between my-2 proportional-nums">
                        <text>Generation</text>
                        <text>{this.state.generation}</text>
                    </div>
                    <div class="flex justify-between my-2 proportional-nums">
                        <div>
                            <text>Speed</text>
                            <div class="flex">{this.speedDisplay()}</div>
                        </div>
                        <text>{(1000/this.state.fps).toFixed(2)} Gen./s</text>
                    </div>
                </div>
                <div class="flex flex-col">
                    <div class="flex justify-between">
                        <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 shadow-neusm focus:shadow-screen`} onClick={()=> this.step()}><FaStepForward size={20} /></button>
                        <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 ${this.state.intervalid ? 'shadow-screen' : 'shadow-neusm'}`} onClick={()=> this.runtime(this.state.fps)} disabled={this.state.intervalid}><FaPlay size={20} /></button>
                        <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 ${this.state.intervalid ? 'shadow-neusm' : 'shadow-screen'}`} onClick={()=> this.stop()}><FaPause size={20} /></button>
                    </div>
                    <div class="flex justify-between p-4">
                        <button class="my-auto" onClick={()=> this.speed(this.state.fps+50)} disabled={this.state.fps >= 750}><FaBackward /></button>
                        <div class="h-10 px-2 rounded-full shadow-neuinner w-4/5 bg-gray-200">
                            <div class={`transition duration-200 ease-in-out h-6 w-${(750-this.state.fps)/50}/12 mt-2 bg-gray-100 rounded-full`}></div>
                        </div>
                        <button class="my-auto" onClick={()=> this.speed(this.state.fps-50)} disabled={this.state.fps <= 50}><FaForward /></button>
                    </div>
                    <div class="w-11/12 h-56 mx-auto mt-5 bg-grey-200 rounded-md shadow-neuinner">
                        <button onClick={()=> this.placeModel(gun)}>Glider Gun</button>
                        <button onClick={()=> this.placeModel(glider)}>Glider</button>
                    </div>
                </div>
            </div>
            <div class="m-auto">
                {this.state.canvas}
            </div>
        </div>
    }
}

export default Board;