import React, {useState, useEffect} from 'react';

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
        
        for (let [key, value] of alive) {
            let neighbours = this.rNeighbours(value, true);

            if(neighbours > 3 || neighbours < 2)
                toDie.set(key, value);
        };

        Object.assign(data, {generation: this.state.generation+1})
        this.eConceive();
        this.eKill();
        this.dispatch();
    }
      
    placeModel = (model) => {
        Object.assign(data, {pattern: model})
        this.drawModel(model, data.cursorcoord ? data.cursorcoord : this.state.cursorcoord);
        this.dispatch();
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

        return <div class="main" onKeyDown={(e)=> this.handleKeyPress(e.key)}>
            <div class="side-menu">
                <text>Generation: {this.state.generation}</text>
                <div class="button-group">
                    <button onClick={()=> this.step()}>Step</button>
                    <button onClick={()=> this.placeModel(gun)}>Glider Gun</button>
                    <button onClick={()=> this.placeModel(glider)}>Glider</button>
                    <button onClick={()=> this.runtime(this.state.fps)} disabled={this.state.intervalid}>Run Simulation</button>
                    <button onClick={()=> this.stop()}>Stop Simulation</button>
                </div>
                <div>
                    <text>Speed Control</text>
                    <button onClick={()=> this.speed(this.state.fps+50)} disabled={this.state.fps >= 2000}>-</button>
                    <button onClick={()=> this.speed(this.state.fps-50)} disabled={this.state.fps <= 50}>+</button>
                </div>
            </div>
            {this.state.canvas}
        </div>
    }
}

export default Board;