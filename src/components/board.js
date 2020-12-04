import React from 'react';
import { FaPlay, FaStepForward, FaArrowLeft, FaArrowRight, FaPause, FaForward, FaBackward, FaEquals, FaDiceD6 } from 'react-icons/fa';
import { BsGrid3X3 } from 'react-icons/bs';
import { MdSelectAll } from 'react-icons/md';

import Canvas from './canvas';
import Alive from './alive';
import Display from './display';
import PatternButton from './partternbutton';
import Toolbar from './toolbar';
import Tutorial from './tutorial';


class Board extends React.Component {
    constructor(props) {
        super(props);

        this.alive = new Alive();
        this.canvas = null; //initiated on component mount
        this.gridCanvas = null; //initiated on component mount
        this.cursorCanvas = null; //initiated on component mount
        this.display = null; //initiated on component mount
        this.tutorial = null; //initiated on component mount
        this.gridRef = React.createRef();
        this.boardRef = React.createRef();
        this.cursorRef = React.createRef();
        this.displayRef = React.createRef();
        this.gun = require('../models/glider_gun.json');
        this.glider = require('../models/glider.json');
        this.megaglider = require('../models/mega_glider.json');
        this.pulsar3 = require('../models/3_pulsar.json');
        this.rpentomino = require('../models/r_pentomino.json');
        this.ap11 = require('../models/achims_p11.json')
        this.data = {};
        
        this.state = {
            intervalid: null,
            size: 10,
            cursorcoord: { x: 0, y: 0 },
            fps: 300,
            patternLegal: true,
            capturing: false,
            capturingCoordinates: null,
            menuOut: true,
            showGrid: true,
            mouseDown: false,
            tutorial: null,
            paused: false,
            selected: null,
            ismobile: null,
            placing: { model: null, bounds: null },
            overModel: false,
            moving: false,
            showToolbar: false,
            tutorialStep: 0,
        };
    }

    dispatch = () => {
        let updated = this.state;
        Object.assign(updated, { ...this.data });
        this.setState({ ...updated })
        this.data = {};
        this.canvas.draw(this.alive.generation);
    }

    randomize = () => {
        this.alive.randomizeBoard();
        this.canvas.draw(this.alive.generation);
    }

    randomizeArea = (bounds) => {
        this.alive.randomizeArea(bounds);
        this.canvas.draw(this.alive.generation);
        this.cancelSelection();
    }

    runtime = (speed) => {
        const id = window.setInterval(() => this.step(), speed);
        this.setState({ intervalid: id })
        this.display.clear();
        this.display.createBackground(false);
        this.display.drawValues(this.alive.generation.size, (1000/this.state.fps).toFixed(2), false)
    }

    stop = () => {
        clearInterval(this.state.intervalid);
        this.setState({ intervalid: null })
        this.display.clear();
        this.display.createBackground(true);
        this.display.drawValues(this.alive.generation.size, (1000/this.state.fps).toFixed(2), false)
    }

    speed = (news) => {
        this.stop();
        this.runtime(news);
        this.setState({ fps: news })
    }

    step = () => {
        if (!this.alive.scan()) {
            this.stop();
        }
        this.canvas.draw(this.alive.generation);
        this.display.drawValues(this.alive.generation.size, (1000/this.state.fps).toFixed(2))
    }

    handleModel = (model) => {
        let x = Math.floor(this.state.ismobile ? (this.alive.bounds.x / 2) : (document.getElementById("control").getBoundingClientRect().x / this.state.size) / 2)
        let y = Math.floor(this.alive.bounds.y / 2)
        let centeredCoordinates = this.centerModel({ x: x, y: y }, model.area)

        this.placeModel(centeredCoordinates, model);
    }

    //mouseX and mouseY are already scaled down to canvas coordinates
    mouseOverModel = (mouseX, mouseY) => {
        let bounds = this.state.placing.bounds;
        if (mouseX >= bounds.start.x && mouseY >= bounds.start.y && mouseX <= bounds.end.x && mouseY <= bounds.end.y)
            return true
        return false
    }

    centerModel = (coordinates, area) => { return { x: coordinates.x - Math.ceil(area.x / 2), y: coordinates.y - Math.ceil(area.y / 2) } };

    placeModel = (coordinates, model) => {
        if(this.cursorCanvas.checkModelBound(coordinates, model, this.alive.bounds)){
            Object.assign(this.data, {
                placing:{
                    model: model,
                    bounds: {
                        start: coordinates,
                        end: {
                            x: coordinates.x+model.area.x,
                            y: coordinates.y+model.area.y
                        }
                    }
                },
                showToolbar: this.state.moving ? false : true,
            })
            this.cursorCanvas.drawModel(model, coordinates, "blue");
        }

        this.dispatch();
    }

    toggleGrid = () => {
        if (this.state.size >= 10) {
            if (this.state.showGrid)
                this.gridCanvas.clear();
            else
                this.gridCanvas.drawGrid();

            this.setState({ showGrid: !this.state.showGrid })
        }
    }

    handleMouseMove = (clientX, clientY) => {
        let scaledX = Math.floor(clientX / this.state.size)
        let scaledY = Math.floor(clientY / this.state.size)

        let coordinates = { x: scaledX, y: scaledY }

        if (this.state.mouseDown) {

            if (this.state.capturing){
                let start = { x: Math.min(this.state.capturingCoordinates.start.x, coordinates.x), y: Math.min(this.state.capturingCoordinates.start.y, coordinates.y) };
                let end = { x: Math.max(this.state.capturingCoordinates.start.x, coordinates.x), y: Math.max(this.state.capturingCoordinates.start.y, coordinates.y) };

                this.cursorCanvas.drawCaptureArea(start, end, "blue");
            } 
            else if(this.state.moving){
                let centeredCoord = this.centerModel(coordinates, this.state.placing.model.area);

                this.placeModel(centeredCoord, this.state.placing.model);
            }
            else
                this.handleClick();

        }
        else if(this.state.placing.model){

            this.setState({ overModel: this.mouseOverModel(coordinates.x, coordinates.y) });
        }
        else{

            if (this.state.selected) 
                this.cursorCanvas.drawCaptureArea(this.state.capturingCoordinates.start, this.state.capturingCoordinates.end, "green")
            else{
                this.cursorCanvas.drawCursor(coordinates);
                this.display.drawCoordinates(coordinates)
            }
        }
        if(this.state.cursorcoord.x !== coordinates.x || this.state.cursorcoord.y !== coordinates.y){
            Object.assign(this.data, { cursorcoord: coordinates });
            this.dispatch();
        }
    }

    handleClick = () => {
        if (!this.state.capturing && !this.state.selected && !this.state.placing.model) {
            if (this.state.placing.model) {
                let centeredModel = this.centerModel(this.state.cursorcoord, this.state.placing.model.area);
                if (this.cursorCanvas.checkModelBound(centeredModel, this.state.placing.model, this.alive.bounds)) {
                    this.alive.conceiveModel(this.state.placing.model, centeredModel);
                    this.cursorCanvas.clear();
                    Object.assign(this.data, { placing: null });
                }
            } else {
                let coord = this.state.cursorcoord;
                this.alive.generation.set(coord.x + '-' + coord.y, { x: coord.x, y: coord.y })
            }
            this.canvas.draw(this.alive.generation);
        }
    }

    clear = () => {
        this.stop();
        this.alive.killAll();
        this.canvas.clear();
        this.display.reset();
        this.display.drawValues(0,0);
    }

    handleMouseUp(clientX, clientY) {
        let newState = {};
        const capture = (start, end) => {
            const area = { x: 0, y: 0 }
            const blueprint = {};
            let counter = 1;

            for (let i = start.x; i <= end.x; i++) {
                for (let j = start.y; j <= end.y; j++) {
                    if (this.alive.generation.has(i + '-' + j)) {
                        let relativeX = i - start.x;
                        let relativeY = j - start.y;

                        blueprint[counter] = { x: relativeX, y: relativeY };
                        counter++

                        if (relativeX > area.x)
                            area.x = relativeX
                        if (relativeY > area.y)
                            area.y = relativeY
                    }
                }
            }

            blueprint['area'] = { x: area.x + 1, y: area.y + 1 };

            return (blueprint);
        }

        if (this.state.capturing) {
            let scaledX = Math.floor(clientX / this.state.size)
            let scaledY = Math.floor(clientY / this.state.size)

            let coordinates = { x: scaledX, y: scaledY }
            let start = { x: Math.min(this.state.capturingCoordinates.start.x, coordinates.x), y: Math.min(this.state.capturingCoordinates.start.y, coordinates.y) };
            let end = { x: Math.max(this.state.capturingCoordinates.start.x, coordinates.x), y: Math.max(this.state.capturingCoordinates.start.y, coordinates.y) };
            let captured = capture(start, end);
            Object.assign(newState, { selected: captured, showToolbar: true, capturing: false, capturingCoordinates: { start: start, end: end } })
        }

        if (this.state.paused) {
            this.runtime(this.state.fps)
            Object.assign(newState, { paused: false })
        }

        if(this.state.moving){
            Object.assign(newState, { moving: false, showToolbar: true })
        }

        this.setState({ mouseDown: false, ...newState })
    }

    handleTouchCoord(clientX, clientY) {
        let newState = {};

        let scaledX = Math.floor(clientX / this.state.size);
        let scaledY = Math.floor(clientY / this.state.size);
        
        if(this.state.placing.model){
            let overModel = this.mouseOverModel(scaledX, scaledY)

            Object.assign(newState, {moving: overModel, overModel: overModel})
        }

        this.setState({ cursorcoord: { x: scaledX, y: scaledY }, ...newState});
        this.handleMouseDown({ x: scaledX, y: scaledY });
    }

    handleMouseDown(coordinates) {
        if (this.state.intervalid) {
            this.setState({ paused: true })
            this.stop();
        }

        if (this.state.capturing)
            this.setState({ capturingCoordinates: { start: coordinates, end: null } })

        if(this.state.overModel)
            this.setState({ moving: true, showToolbar: false})
        
        this.setState({ mouseDown: true })
    }

    handleMouseOut() {
        if (this.state.capturing)
            this.handleMouseUp();
        else
            this.setState({ mouseDown: false })
    }

    handleTutorial() {

        const addListener = (next) => {
            let nextListener = document.getElementById(next);
            nextListener.addEventListener('click', () => this.handleTutorial());
        }
        const removeListener = (current) => {
            let currentListener = document.getElementById(current);
            currentListener.removeEventListener('click', () => this.handleTutorial());
        }

        switch (this.state.tutorial) {
            case "menu":
                removeListener("menu");
                addListener("rpentomino");
                this.setState({ tutorial: "rpentomino" })
                break;
            case "rpentomino":
                removeListener("rpentomino");
                addListener("cursor");
                this.setState({ menuOut: true, tutorial: "skipped" })
                break;
            case "skipped":
                removeListener("cursor");
                addListener("play");
                document.getElementById("play").style.zIndex = 40
                this.setState({ menuOut: false, tutorial: "play" })
                break;
            case "play":
                removeListener("play")
                this.setState({ tutorial: false })
                break;
        }
    }

    cutSelection() {
        let capturingStart = this.state.capturingCoordinates.start;
        let capturingEnd = this.state.capturingCoordinates.end;
        let selected = this.state.selected

        if(this.cursorCanvas.checkModelBound(capturingStart, selected, this.alive.bounds)){
            Object.assign(this.data, {
                placing:{
                    model: selected,
                    bounds: {
                        start: {x: capturingStart.x - 1, y: capturingStart.y - 1},
                        end: {x: capturingEnd.x - 1, y: capturingEnd.y - 1},
                    }
                },
                selected: null,
            })
            this.cursorCanvas.drawModel(selected, this.data.placing.bounds.start, "blue");
        }
        this.dispatch();
        this.alive.clearArea(this.state.capturingCoordinates)
    }

    toggleMenu(state) {
        this.setState({menuOut: state})
    }

    setupTutorial() {
        this.setState({ tutorial: true });
    }

    cancelSelection = () => {
       Object.assign(this.data, {
            selected: null,
            showToolbar: false,
            capturingCoordinates: null,
        })
        this.cursorCanvas.clear();
    }

    cancelPlacement = () => {
        Object.assign(this.data, {
             placing: { model: null, coord: null },
             showToolbar: false,
             overModel: null,
         })
         this.cursorCanvas.clear();
     }

    roatateModel = (model) => {
        this.placeModel(this.state.placing.bounds.start, this.canvas.rotateModel(model))
    }

    initCanvas() {
        let height = this.alive.bounds.y * this.state.size;
        let width = this.alive.bounds.x * this.state.size;

        this.canvas.ctx.canvas.width = width;
        this.canvas.ctx.canvas.height = height;

        this.gridCanvas.ctx.canvas.width = width;
        this.gridCanvas.ctx.canvas.height = height;

        this.cursorCanvas.ctx.canvas.width = width;
        this.cursorCanvas.ctx.canvas.height = height;

        this.gridCanvas.drawGrid();
        this.cursorCanvas.drawCursor(this.state.cursorcoord);
        this.canvas.draw(this.alive.generation);
    }

    displaySetup() {
        //Display dimentions will be calculated relative to 'ismobile' bool and tailwind's responsive attributes: lg:w-1/4 sm:w-1/2
        
        let ctx = this.displayRef.current.getContext('2d');
        
        let displayCanvas = document.getElementById('display')
  
        let dimentions = {width:displayCanvas.clientWidth*window.devicePixelRatio, height:displayCanvas.clientHeight*window.devicePixelRatio};
        
        displayCanvas.setAttribute('width', dimentions.width)
        displayCanvas.setAttribute('height', dimentions.height)

        this.display = new Display(this.displayRef, ctx, dimentions)
        this.display.createBackground();
        this.display.drawValues(0,0);
        this.display.drawCoordinates({x:0, y:0})
    }

    canvasSetup() {
        let canvasWidth = document.documentElement.clientWidth;
        let canvasHeight = document.documentElement.clientHeight;

        this.canvas = new Canvas(this.boardRef, this.boardRef.current.getContext('2d'), this.state.size, { width: canvasWidth, height: canvasHeight });
        this.gridCanvas = new Canvas(this.gridRef, this.gridRef.current.getContext('2d'), this.state.size, { width: canvasWidth, height: canvasHeight });
        this.cursorCanvas = new Canvas(this.cursorRef, this.cursorRef.current.getContext('2d'), this.state.size, { width: canvasWidth, height: canvasHeight });

        let width = Math.floor(canvasWidth / this.state.size);
        let height = Math.floor(canvasHeight / this.state.size);

        this.alive.bounds = { x: width, y: height };

        if (this.alive.generation.size)
            this.alive.removeOverBounds()

        this.initCanvas();
    }

    componentDidMount() {

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.setState({ ismobile: navigator.userAgent })

        this.canvasSetup();
        this.displaySetup();

        window.addEventListener('resize', () => {
            this.canvasSetup();
            this.displaySetup();
        });

        document.getElementById('cursor').addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });

    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.canvasSetup());
    }

    render() {
        return <div class="bg-transparent overflow-x-hidden relative flex h-full w-full">
            <div class="flex flex-row w-full h-full">
                {this.state.tutorial && 
                    <span id="tutorialmask" onClick={()=> this.setState({tutorialStep: this.state.tutorialStep+1})} style={{ position: "absolute", width: "100%", height: "100%", zIndex: 30}}>
                        <Tutorial 
                            step={this.state.tutorialStep}
                            menuOut={(state) => this.toggleMenu(state)}
                            isMenuOut={this.state.menuOut}
                            endTutorial={() => this.setState({tutorial: false})}
                        />
                    </span>
                }
                <div class="flex justify-center align-center w-full h-full m-auto bg-gray-200" tabIndex="-1">
                    <canvas id="board" class={"bg-transparent m-auto absolute"} ref={this.boardRef} />

                    <canvas
                        id="cursor"
                        class={`bg-transparent m-auto absolute ${this.state.overModel && 'cursor-move'}`}
                        ref={this.cursorRef}
                        onTouchStart={(e) => this.handleTouchCoord(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={() => this.handleMouseUp()}
                        onTouchMove={(e) => this.handleMouseMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onMouseMove={(e) => this.handleMouseMove(e.clientX, e.clientY)}
                        onMouseDown={() => this.handleMouseDown(this.state.cursorcoord)}
                        onMouseUp={(e) => this.handleMouseUp(e.clientX, e.clientY)}
                        onMouseOut={() => this.handleMouseOut()}
                        onClick={() => this.handleClick()}
                    />

                    <canvas id="grid" class={"bg-transparent"} ref={this.gridRef} />

                    {(this.state.showToolbar) &&
                        <Toolbar
                            render={this.state.selected ? this.state.selected : this.state.placing}
                            coordinates={this.state.selected ? this.state.capturingCoordinates : this.state.placing.bounds}
                            size={this.state.size}
                            isMobile={this.state.ismobile}
                            rotate={() => this.placeModel(this.state.placing.bounds.start, this.canvas.rotateModel(this.state.placing.model))}
                            mirror={() => this.placeModel(this.state.placing.bounds.start, this.canvas.mirrorModel(this.state.placing.model))}
                            randomize={this.randomizeArea}
                            copy={() => this.handleModel(this.state.selected)}
                            cancel={this.state.selected ? this.cancelSelection : this.cancelPlacement}
                            dispatch={this.dispatch}
                            delete={this.alive.clearArea}
                            conceive={this.alive.conceiveModel}
                            cut={() => this.cutSelection()}
                        />
                    }

                </div>

                <button
                    id="menu"
                    class="absolute flex transition duration-300 ease-in-out rounded-md m-2 shadow-md bg-gray-300 px-4 py-2 z-10 focus:outline-none hover:bg-white"
                    onClick={() => this.setState({ menuOut: !this.state.menuOut })}
                >
                    <FaEquals size="20px" color={"#aaa"} />
                </button>

                <div id="control" class={`flex flex-col ${(this.state.ismobile === null) ? 'w-3/12' : (window.innerHeight < window.innerWidth) ? 'w-3/6' : 'w-5/6'} h-full bg-gray-200 shadow-xl right-0 absolute overflow-y-auto px-4 transform transition ease-in-out duration-500 sm:duration-700 ${this.state.menuOut ? 'translate-x-full' : 'translate-x-0'}`}>
                    <div class="flex flex-col relative">
                        <canvas id="display" ref={this.displayRef} class="w-11/12 h-32 flex flex-col rounded-md mt-8 mx-auto bg-retro border-solid border-4 border-white opacity-80 text-opacity-75 font-semibold font-mono text-sm shadow-screen"/>
                        <div id="maincontrols" class="flex justify-between">

                            <button
                                class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 shadow-resting focus:shadow-button focus:outline-none`}
                                onClick={() => {
                                    if (this.state.selected)
                                        this.cancelSelection();
                                    this.step()
                                }}
                            >
                                <FaStepForward size={20} />
                            </button>

                            <button
                                class={`transition duration-300 ease-in-out border-4 border-transparent bg-gray-200 rounded-full m-auto p-5 my-8 focus:outline-none ${this.state.intervalid ? 'shadow-button' : 'shadow-resting'}`}
                                onClick={() => {
                                    if (this.state.selected)
                                        this.cancelSelection();
                                    this.runtime(this.state.fps)
                                }}
                                disabled={this.state.intervalid}
                            >
                                <FaPlay size={20} />
                            </button>

                            <button
                                class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 focus:outline-none ${this.state.intervalid ? 'shadow-resting' : 'shadow-button'}`}
                                onClick={() => this.stop()}
                            >
                                <FaPause size={20} />
                            </button>

                        </div>
                        <div id="speed" class="flex justify-between p-4">
                            <button class="my-auto" onClick={() => this.speed(this.state.fps + 50)} disabled={this.state.fps >= 600}><FaBackward /></button>
                            <div class="h-10 px-2 rounded-full shadow-neuinner w-4/5 bg-gray-200">
                                <div class={`transition-width h-6 w-${(650 - this.state.fps) / 50}/12 mt-2 bg-gray-100 rounded-full`}></div>
                            </div>
                            <button class="my-auto" onClick={() => this.speed(this.state.fps - 50)} disabled={this.state.fps <= 50}><FaForward /></button>
                        </div>
                        <div class="flex justify-between p-4">
                            <button
                                class="px-4 m-auto py-2 bg-transparent rounded-md m-2 shadow-neusm focus:outline-none"
                                onClick={() => {
                                    this.stop();
                                    this.setState({ menuOut: true, capturing: true })
                                }}
                            >
                                <MdSelectAll />
                            </button>
                            <button class="px-4 m-auto py-2 bg-transparent rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.randomize(this.alive.bounds)}><FaDiceD6 /></button>
                            <button class="px-4 m-auto py-2 rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.clear()}>Clear</button>
                            <button class="px-4 m-auto py-2 rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.toggleGrid()}><BsGrid3X3 /></button>
                        </div>
                        <div id="patterns" class="w-11/12 relative flex flex-col mx-auto h-56 shadow-neuinner py-2 rounded-md scrolling-touch overflow-x-hidden bg-gray-200">
                            <PatternButton onClick={() => this.handleModel(this.rpentomino)}>R-Pentomino</PatternButton>
                            <PatternButton onClick={() => this.handleModel(this.gun)}>Glider Gun</PatternButton>
                            <PatternButton onClick={() => this.handleModel(this.glider)}>Glider</PatternButton>
                            <PatternButton onClick={() => this.handleModel(this.megaglider)}>Mega Glider</PatternButton>
                            <PatternButton onClick={() => this.handleModel(this.pulsar3)}>3-pulsar</PatternButton>
                            <PatternButton onClick={() => this.handleModel(this.ap11)}>Achim's p11</PatternButton>
                        </div>
                    </div>
                </div>
            </div>
            {this.state.tutorial === null &&
                <div
                    style={{
                        display: "flex",
                        position: "absolute",
                        alignContent: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(247,247,247,.8)"
                    }}>
                    <div class="flex flex-col shadow-resting my-auto bg-gray-100 sm:w-10/12 md:w-4/6 lg:w-1/2 rounded-2xl p-8">
                        <span class="font-bold text-center text-gray-800 mx-auto sm:text-lg md:text-2xl text-4xl">Welcome to Conway's Game of Life</span>
                        <p class="flex flex-wrap mx-auto my-10 md:my-5 md:text-sm text-justify text-serif">
                            The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970. It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.
                        </p>
                        <div class="flex flex-row mx-auto w-4/6 justify-between">
                            <button onClick={() => this.setupTutorial()} class="px-4 m-auto py-2 rounded-md m-2 shadow-neusm focus:outline-none">How to Play</button>
                            <button onClick={() => this.setState({ tutorial: false, menuOut: false })} class="px-4 m-auto py-2 rounded-md m-2 shadow-neusm focus:outline-none">Skip Tutorial</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}

export default Board;