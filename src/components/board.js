import React from 'react';
import { FaPlay, FaStepForward, FaArrowLeft, FaArrowRight, FaPause, FaForward, FaBackward, FaEquals, FaDiceD6 } from 'react-icons/fa';
import { BsGrid3X3 } from 'react-icons/bs';
import { AiOutlineCloseSquare } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { GiSaveArrow } from 'react-icons/gi';
import { MdSelectAll } from 'react-icons/md';

import Canvas from './canvas';
import Alive from './alive';
import Display from './display';
import Ping from './ping';


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
        this.megaglider = require('../models/mega_glider.json');
        this.pulsar3 = require('../models/3_pulsar.json');
        this.rpentomino = require('../models/r_pentomino.json');
        this.ap11 = require('../models/achims_p11.json')
        this.data = {};

        this.state = {
            generation: 0,
            intervalid: null,
            size: 10,
            cursorcoord: { x: 0, y: 0 },
            fps: 300,
            pattern: null,
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
            testoffset: null,
        };
    }

    dispatch = () => {
        let updated = this.state;
        Object.assign(updated, { ...this.data });
        this.setState({ ...updated })
        this.data = {};
    }

    handleKeyPress(key) {

        const updateCursor = (difference) => {

            let boundAdjusted = this.alive.boundAdjusted(difference)

            this.cursorCanvas.drawCursor(boundAdjusted);

            if (this.state.pattern)
                this.placeModel(difference, this.state.pattern, this.alive.bounds);

            if (this.state.capturing)
                this.cursorCanvas.drawCaptureArea(this.state.capturing, boundAdjusted)

            Object.assign(this.data, { cursorcoord: boundAdjusted });
        }

        switch (key) {
            case 'ArrowUp':
                updateCursor({ x: this.state.cursorcoord.x, y: this.state.cursorcoord.y - 1 })
                break;
            case 'ArrowDown':
                updateCursor({ x: this.state.cursorcoord.x, y: this.state.cursorcoord.y + 1 })
                break;
            case 'ArrowRight':
                updateCursor({ x: this.state.cursorcoord.x + 1, y: this.state.cursorcoord.y })
                break;
            case 'ArrowLeft':
                updateCursor({ x: this.state.cursorcoord.x - 1, y: this.state.cursorcoord.y })
                break;
            case 'a':
                if (this.state.pattern) {
                    if (this.cursorCanvas.checkModelBound(this.state.cursorcoord, this.state.pattern, this.alive.bounds)) {
                        this.alive.conceiveModel(this.state.pattern, this.state.cursorcoord);
                        this.cursorCanvas.clear();
                        Object.assign(this.data, { pattern: null });
                    }
                } else {
                    let coord = this.state.cursorcoord;
                    this.alive.generation.set(coord.x + '-' + coord.y, { x: coord.x, y: coord.y })
                }
                this.canvas.draw(this.alive.generation);
                break;
            case 'e':
                console.log(this.state.testoffset)
                break;
            case 'c':
                Object.assign(this.data, { capturing: null, pattern: null });
                this.cursorCanvas.drawCursor(this.state.cursorcoord);
                break;
            case 'r':
                if (this.state.pattern) { }
                this.handleModel(this.canvas.rotateModel(this.state.pattern))
                break;
            case 'q':
                if (this.state.pattern)
                    this.handleModel(this.canvas.inverseModel(this.state.pattern))
                break;
        }
        this.dispatch();
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
    }

    stop = () => {
        clearInterval(this.state.intervalid);
        this.setState({ intervalid: null })
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
        Object.assign(this.data, { generation: this.state.generation + 1 });
        this.dispatch();
    }

    handleModel = (model) => {
        Object.assign(this.data, { pattern: model });
        this.placeModel(this.state.cursorcoord, model, this.alive.bounds);
        this.dispatch();
    }

    placeModel = (coordinates, model, bounds) => {
        let isLegal = this.cursorCanvas.checkModelBound(coordinates, model, bounds);
        this.cursorCanvas.drawModel(model, coordinates, isLegal ? "blue" : "red");
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
        this.cursorCanvas.drawCursor(coordinates);

        if (this.state.selected) {
            this.cursorCanvas.drawCaptureArea(this.state.capturingCoordinates.start, this.state.capturingCoordinates.end, "green")
        }

        if (this.state.pattern)
            this.placeModel(coordinates, this.state.pattern, this.alive.bounds);

        else if (this.state.mouseDown) {

            if (this.state.capturingCoordinates)
                this.cursorCanvas.drawCaptureArea(this.state.capturingCoordinates.start, coordinates, "blue")
            else
                this.handleClick();
        }

        Object.assign(this.data, { cursorcoord: coordinates });
        this.dispatch();
    }

    handleClick = () => {
        if (this.state.pattern) {
            if (this.cursorCanvas.checkModelBound(this.state.cursorcoord, this.state.pattern, this.alive.bounds)) {
                this.alive.conceiveModel(this.state.pattern, this.state.cursorcoord);
                this.cursorCanvas.clear();
                Object.assign(this.data, { pattern: null });
            }
        } else {
            let coord = this.state.cursorcoord;
            this.alive.generation.set(coord.x + '-' + coord.y, { x: coord.x, y: coord.y })
        }
        this.canvas.draw(this.alive.generation);
    }

    clear = () => {
        this.stop();
        this.alive.killAll();
        this.step();
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

    canvasSetup() {
        let canvasWidth = document.documentElement.clientWidth;
        let canvasHeight = document.documentElement.clientHeight;

        this.canvas = new Canvas(this.boardRef, this.boardRef.current.getContext('2d'), 10, { width: canvasWidth, height: canvasHeight });
        this.gridCanvas = new Canvas(this.gridRef, this.gridRef.current.getContext('2d'), 10, { width: canvasWidth, height: canvasHeight });
        this.cursorCanvas = new Canvas(this.cursorRef, this.cursorRef.current.getContext('2d'), 10, { width: canvasWidth, height: canvasHeight });

        let width = Math.floor(canvasWidth / this.state.size);
        let height = Math.floor(canvasHeight / this.state.size);
        this.alive.bounds = { x: width, y: height };

        if (this.alive.generation.size)
            this.alive.removeOverBounds()

        this.initCanvas();
    }

    handleMouseUp() {
        let newState = {};
        const capture = () => {
            const start = this.state.capturingCoordinates.start;
            const end = this.state.cursorcoord;
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
            let captured = capture();
            let start = { x: Math.min(this.state.capturingCoordinates.start.x, this.state.cursorcoord.x), y: Math.min(this.state.capturingCoordinates.start.y, this.state.cursorcoord.y) };
            let end = { x: Math.max(this.state.capturingCoordinates.start.x, this.state.cursorcoord.x), y: Math.max(this.state.capturingCoordinates.start.y, this.state.cursorcoord.y) };
            Object.assign(newState, { selected: captured, capturing: false, capturingCoordinates: { start: start, end: end } })
        }

        if (this.state.paused) {
            this.runtime(this.state.fps)
            Object.assign(newState, { paused: false })
        }

        this.setState({ mouseDown: false, ...newState })
    }

    handleTouchCoord(clientX, clientY) {
        let scaledX = Math.floor(clientX / this.state.size);
        let scaledY = Math.floor(clientY / this.state.size);

        this.setState({ cursor: { x: scaledX, y: scaledY } });
        this.handleMouseDown({ x: scaledX, y: scaledY });
    }

    handleMouseDown(coordinates) {
        console.log(coordinates)
        if (this.state.intervalid) {
            this.setState({ paused: true })
            this.stop();
        }
        if (this.state.capturing)
            this.setState({ capturingCoordinates: { start: coordinates, end: null } })

        this.setState({ mouseDown: true })
    }

    handleTouch(model) {
        Object.assign(this.data, { menuOut: true })
        this.handleModel(model)
    }

    toolbarYPlacement() {
        if (this.state.capturingCoordinates.start.y < 7)
            return this.state.capturingCoordinates.end.y + 1
        else
            return this.state.capturingCoordinates.start.y - 5
    }

    renderTutorialArrow() {
        let position = document.getElementById(this.state.tutorial).getBoundingClientRect();
        const steps = {
            "menu": 
                <div style={{position: "absolute", display: "flex", alignItems: "center", left: position.left+100, top: position.top, zIndex: 10}}>
                    <FaArrowLeft class="animate-bounce" size={35}/>
                    <span class="ml-10 text-lg font-mono">Start by opening the menu</span>
                </div>,
            "rpentomino": 
                <div style={{position: "absolute", display: "flex", right: position.width, top: position.top, zIndex: 10}}>
                    <span class="mr-10 text-lg font-mono w-30">Now select the R-Pentonimo pattern from the menu</span>
                    <FaArrowRight class="animate-bounce" size={35}/>
                </div>,
            "place":
                <span class="absolute left-50 text-2xl font-mono">Place your pattern anywere on the board</span>   
        }
        
        return steps[this.state.tutorial]
    }

    cancelSelection() {
        this.setState({
            selected: null,
            capturingCoordinates: null
        })
        this.cursorCanvas.clear();
    }

    componentDidMount() {
        this.canvasSetup();
        window.addEventListener('resize', () => this.canvasSetup());
        window.addEventListener('touchmove', function (event) {
            event.preventDefault();
            event.stopPropagation();
        }, { passive: false });

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.setState({ ismobile: navigator.userAgent })
        
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.canvasSetup());
    }

    render() {

        return <div class="bg-gray-200 overflow-hidden relative flex h-full w-full" onKeyDown={(e) => this.handleKeyPress(e.key)}>
            <div id="place" class="flex flex-row w-full h-full m-auto">
                {this.state.tutorial && this.renderTutorialArrow()}
                <div class="flex z-index-4 m-auto" tabIndex="-1">

                    <canvas id="board" class={"bg-transparent m-auto absolute"} ref={this.boardRef} />

                    <canvas
                        id="cursor"
                        class={"bg-transparent m-auto absolute"}
                        ref={this.cursorRef}
                        onTouchStart={(e) => this.handleTouchCoord(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={() => this.handleMouseUp()}
                        onTouchMove={e => this.handleMouseMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onMouseMove={e => this.handleMouseMove(e.clientX, e.clientY)}
                        onMouseDown={() => this.handleMouseDown(this.state.cursorcoord)}
                        onMouseUp={() => this.handleMouseUp()}
                        onClick={() => this.handleClick()}
                    />

                    <canvas id="grid" class={"bg-transparent"} ref={this.gridRef} />
                    {this.state.selected &&
                        <div style={{
                            display: "flex",
                            position: "absolute",
                            justifyContent: "space-between",
                            left: this.state.capturingCoordinates.start.x * this.state.size,
                            top: this.toolbarYPlacement() * this.state.size,
                            borderRadius: "10px",
                            padding: "5px"
                        }}>
                            <button 
                                class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                                onClick={() => {
                                    this.setState({ pattern: this.state.selected }); 
                                    this.cancelSelection() 
                                }}
                            >
                                    <FiCopy size={this.state.ismobile ? 20 : 15} color="green" />
                            </button>
                            <button 
                                class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} mx-1 bg-gray-100`} 
                                onClick={() => console.log(this.state.selected)}
                            >
                                <GiSaveArrow size={this.state.ismobile ? 20 : 15} color="blue" />
                            </button>
                            <button 
                                class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} mx-1 bg-gray-100`} 
                                onClick={() => this.randomizeArea(this.state.capturingCoordinates) }
                            >
                                <FaDiceD6 size={this.state.ismobile ? 20 : 15} color="turquoise" />
                            </button>
                            <button 
                                class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} ml-1 mr-2 bg-gray-100`} 
                                onClick={() => this.cancelSelection()}
                            >
                                <AiOutlineCloseSquare size={this.state.ismobile ? 20 : 15} color="red" />
                            </button>
                        </div>
                    }

                </div>

                <button
                    id="menu"
                    class="absolute flex transition duration-300 ease-in-out rounded-md m-2 shadow-md bg-gray-300 px-4 py-2 z-index-5 focus:outline-none hover:bg-white"
                    onClick={() => {
                        if (this.state.tutorial)
                            this.setState({ menuOut: !this.state.menuOut, tutorial: "rpentomino" })
                        else
                            this.setState({ menuOut: !this.state.menuOut })
                    }}
                >
                    <FaEquals size="20px" color={"#aaa"} />
                </button>

                <div class={`flex flex-col lg:w-3/12 sm:w-3/6 h-full bg-gray-200 shadow-xl right-0 absolute overflow-x-none px-4 transform transition ease-in-out duration-500 sm:duration-700 ${this.state.menuOut ? 'translate-x-full' : 'translate-x-0'}`}>
                    <Display
                        intervalid={this.state.intervalid}
                        alive={this.alive.generation.size}
                        generation={this.state.generation}
                        speed={this.state.fps}
                        cursor={this.state.cursorcoord}
                    />
                    <div class="flex flex-col relative">
                        <div class="flex justify-between">
                            <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 shadow-resting focus:shadow-button focus:outline-none`} onClick={() => this.step()}><FaStepForward size={20} /></button>
                            <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 focus:outline-none ${this.state.intervalid ? 'shadow-button' : 'shadow-resting'}`} onClick={() => this.runtime(this.state.fps)} disabled={this.state.intervalid}><FaPlay size={20} /></button>
                            <button class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 focus:outline-none ${this.state.intervalid ? 'shadow-resting' : 'shadow-button'}`} onClick={() => this.stop()}><FaPause size={20} /></button>
                        </div>
                        <div class="flex justify-between p-4">
                            <button class="my-auto" onClick={() => this.speed(this.state.fps + 50)} disabled={this.state.fps >= 600}><FaBackward /></button>
                            <div class="h-10 px-2 rounded-full shadow-neuinner w-4/5 bg-gray-200">
                                <div class={`transition-width h-6 w-${(650 - this.state.fps) / 50}/12 mt-2 bg-gray-100 rounded-full`}></div>
                            </div>
                            <button class="my-auto" onClick={() => this.speed(this.state.fps - 50)} disabled={this.state.fps <= 50}><FaForward /></button>
                        </div>
                        <div class="flex justify-between p-4">
                            <button
                                class="px-4 m-auto py-2 z-index-5 bg-transparent rounded-md m-2 shadow-neusm focus:outline-none"
                                onClick={() => {
                                    this.stop();
                                    this.setState({ menuOut: true, capturing: true })
                                }}
                            >
                                <MdSelectAll />
                            </button>
                            <button class="px-4 m-auto py-2 z-index-5 bg-transparent rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.randomize(this.alive.bounds)}><FaDiceD6 /></button>
                            <button class="px-4 m-auto py-2 z-index-5 rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.clear()}>Clear</button>
                            <button class="px-4 m-auto py-2 z-index-5 rounded-md m-2 shadow-neusm focus:outline-none" onClick={() => this.toggleGrid()}><BsGrid3X3 /></button>
                        </div>
                        <div class="w-11/12 flex flex-col mx-auto h-56 shadow-neuinner py-2 rounded-md overflow-y-scroll overflow-x-hidden">
                            <button 
                                id="rpentomino"
                                onClick={() => {
                                    this.handleModel(this.rpentomino)
                                    this.setState({ menuOut: true, tutorial: "place" })
                                }}
                                class={`transition duration-300 ease-in-out w-full bg-gray-100 rounded-sm px-5 py-2 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}
                            >
                                R-Pentomino
                            </button>
                            <button onClick={() => this.handleModel(this.gun)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>Glider Gun</button>
                            <button onClick={() => this.handleModel(this.glider)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>Glider</button>
                            <button onClick={() => this.handleModel(this.megaglider)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>Mega Glider</button>
                            <button onClick={() => this.handleModel(this.pulsar3)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>3-pulsar</button>
                            <button onClick={() => this.handleModel(this.ap11)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>Achim's p11</button>
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
                        <p class="flex flex-wrap mx-auto my-10 md:my-5 md:text-sm text-justify">
                            The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970. It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.
                        </p>
                        <div class="flex flex-row mx-auto w-4/6 justify-between">
                            <button onClick={() => this.setState({ tutorial: "menu" })} class="px-4 m-auto py-2 z-index-5 rounded-md m-2 shadow-neusm focus:outline-none">How to Play</button>
                            <button onClick={() => this.setState({ tutorial: false })} class="px-4 m-auto py-2 z-index-5 rounded-md m-2 shadow-neusm focus:outline-none">Skip Tutorial</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}

export default Board;