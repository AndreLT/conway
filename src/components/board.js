import React from 'react';
import {FaPlay, FaStepForward, FaPause, FaForward, FaBackward} from 'react-icons/fa'

import Canvas from './canvas'
import Alive from './alive'


class Board extends React.Component {
    constructor(props) {
        super(props);

        this.alive = new Alive();
        this.canvas = null; //initiated on component mount
        this.gridCanvas = null; //initiated on component mount
        this.cursorCanvas = null; //initiated on component mount
        this.gridRef = React.createRef();
        this.boardRef = React.createRef();
        this.cursorRef = React.createRef();
        this.gun = require('../models/glider_gun.json');
        this.glider = require('../models/glider.json');
        this.data = {};

        this.state = {
            generation: 0,
            intervalid: null,
            size: 10,
            cursorcoord: {x:0, y:0},
            fps: 300,
            pattern: null,
            res: null,
            capturing: null,
       };
    }

    dispatch = () => {
        let updated = this.state;
        Object.assign(updated, {...this.data});
        this.setState({...updated})
        this.data = {};
    }

    handleKeyPress(key){

        const updateCursor = (difference) => {
            /// NEEDS TO VERIFY BOUNDS
            this.cursorCanvas.drawCursor(difference);
            if(difference.x >= 0 && difference.y >= 0)
                Object.assign(this.data, {cursorcoord: difference})
            if(this.state.pattern){
                this.cursorCanvas.drawModel(this.state.pattern, difference);
            }
            if(this.state.capturing){
                this.cursorCanvas.drawCaptureArea(this.state.capturing, difference)
            }
            this.setState({cursorcoord: difference});
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
                if(this.state.pattern){
                    this.alive.conceiveModel(this.state.pattern, this.state.cursorcoord);
                    this.cursorCanvas.clear();
                    Object.assign(this.data, {pattern: null});
                } else {
                    let coord = this.state.cursorcoord;
                    this.alive.generation.set(coord.x + '-' + coord.y,{x:coord.x, y:coord.y}) 
                }
                this.canvas.draw(this.alive.generation);
                break;
            case 'e':
                if(this.state.capturing){
                    const creation = this.capture(this.state.cursorcoord)
                    const name = prompt("How will your creation be called?")
                    localStorage.setItem(name, JSON.stringify(creation))
                }else{
                    Object.assign(this.data, {capturing: this.state.cursorcoord});
                }
                break;
            case 'c':
                Object.assign(this.data, {capturing: null });
                this.cursorCanvas.drawCursor();
                break;
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

    capture = (end) => {
        const start = this.state.capturing;
        const blueprint = {};
        let counter = 1;

        for(let i=start.x; i<=end.x; i++){
            for(let j=start.y; j<=end.y; j++){
                if(this.alive.generation.has(i + '-' + j)){ 
                    blueprint[counter] = {x:i-start.x, y:j-start.y};
                    counter++
                }
            }
        }
        blueprint['size'] = counter-1;
        return(blueprint);
    }

    step = () => {
        if(!this.alive.scan()){
            this.stop();
        }
        this.canvas.draw(this.alive.generation);
        this.dispatch();
    }
      
    placeModel = (model) => {
        Object.assign(this.data, {pattern: model})
        this.cursorCanvas.drawModel(model, this.state.cursorcoord);
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

    handleCustom = (name) => {
       let custom = localStorage.getItem(name)

       this.placeModel({...JSON.parse(custom)})
    }

    initCanvas(){
        let resolution = window.innerHeight - 40;
        this.canvas.ctx.canvas.width=resolution;
        this.canvas.ctx.canvas.height=resolution;

        this.gridCanvas.ctx.canvas.width=resolution;
        this.gridCanvas.ctx.canvas.height=resolution;

        this.cursorCanvas.ctx.canvas.width=resolution;
        this.cursorCanvas.ctx.canvas.height=resolution;

        this.gridCanvas.drawGrid();
        this.cursorCanvas.drawCursor(this.state.cursorcoord);
        this.canvas.draw(this.alive.generation);


    }

    componentDidMount(){
        this.canvas = new Canvas(this.boardRef, this.boardRef.current.getContext('2d'), 10, window.innerHeight-40);
        this.gridCanvas = new Canvas(this.gridRef, this.gridRef.current.getContext('2d'), 10, window.innerHeight-40);
        this.cursorCanvas = new Canvas(this.cursorRef, this.cursorRef.current.getContext('2d'), 10, window.innerHeight-40);

        window.addEventListener('resize', this.initCanvas());
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.initCanvas());
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
                        <button onClick={()=> this.placeModel(this.gun)}>Glider Gun</button>
                        <button onClick={()=> this.placeModel(this.glider)}>Glider</button>
                        <button onClick={()=> this.handleCustom('SteS2')}>Test</button>
                    </div>
                    <button onClick={()=> Canvas.test}>Test</button>
                </div>
            </div>
            <div class="m-auto">
                <canvas id="board" class={"p-2 bg-transparent absolute"} ref={this.boardRef}/>
                <canvas id="cursor" class={"p-2 bg-transparent absolute"} ref={this.cursorRef} />
                <canvas id="grid" class={"p-2 bg-white rounded-lg shadow-neusm"} ref={this.gridRef} />
            </div>
        </div>
    }
}

export default Board;