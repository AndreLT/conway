import React from 'react';
import { FaPlay, FaStepForward, FaArrowLeft, FaArrowRight, FaPause, FaForward, FaBackward, FaEquals, FaDiceD6 } from 'react-icons/fa';
import { BsGrid3X3 } from 'react-icons/bs';
import { AiOutlineCloseSquare, AiOutlineRotateRight } from 'react-icons/ai';
import { CgEditFlipH } from 'react-icons/cg'
import { FiCopy } from 'react-icons/fi';
import { GiSaveArrow } from 'react-icons/gi';
import { MdSelectAll } from 'react-icons/md';

import Canvas from './canvas';
import Alive from './alive';
import Display from './display';
import PatternButton from './partternbutton'


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
        switch (key) {
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

    centerModel = (coordinates, area) => {
        return { x: coordinates.x - Math.ceil(area.x / 2), y: coordinates.y - Math.ceil(area.y / 2) };
    }

    placeModel = (coordinates, model, bounds) => {
        let centeredCursor = this.centerModel(coordinates, model.area)
        let isLegal = this.cursorCanvas.checkModelBound(centeredCursor, model, bounds);
        this.cursorCanvas.drawModel(model, centeredCursor, isLegal ? "blue" : "red");
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
        if(!this.state.capturing && !this.state.selected){
            if (this.state.pattern) {
                let centeredModel = this.centerModel(this.state.cursorcoord, this.state.pattern.area);
                if (this.cursorCanvas.checkModelBound(centeredModel, this.state.pattern, this.alive.bounds)) {
                    this.alive.conceiveModel(this.state.pattern, centeredModel);
                    this.cursorCanvas.clear();
                    Object.assign(this.data, { pattern: null });
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
        this.setState({ generation: 0 })
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
            let start = { x: Math.min(this.state.capturingCoordinates.start.x, this.state.cursorcoord.x), y: Math.min(this.state.capturingCoordinates.start.y, this.state.cursorcoord.y) };
            let end = { x: Math.max(this.state.capturingCoordinates.start.x, this.state.cursorcoord.x), y: Math.max(this.state.capturingCoordinates.start.y, this.state.cursorcoord.y) };
            let captured = capture(start, end);
            console.log(start, end)
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
        if (this.state.intervalid) {
            this.setState({ paused: true })
            this.stop();
        }
        if (this.state.capturing)
            this.setState({ capturingCoordinates: { start: coordinates, end: null } })

        this.setState({ mouseDown: true })
    }

    handleMouseOut(){
        if(this.state.capturing)
            this.handleMouseUp();
        else
            this.setState({mouseDown: false})
    }

    handleTouch(model) {
        Object.assign(this.data, { menuOut: true })
        this.handleModel(model)
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

    setupTutorial() {
        let menub = document.getElementById("menu")
        menub.addEventListener('click', (e) => this.handleTutorial(e));
        this.setState({ tutorial: "menu" });
    }

    renderTutorialArrow() {
        console.log(this.state.tutorial)
        let position = document.getElementById(this.state.tutorial).getBoundingClientRect();
        const steps = {
            "menu":
                <div style={{ position: "absolute", display: "flex", alignItems: "center", left: position.left + 100, top: position.top, zIndex: 60 }}>
                    <FaArrowLeft class="animate-bounce" size={35} />
                    <span class="ml-10 text-lg font-mono">Start by opening the menu</span>
                </div>,
            "rpentomino":
                <div style={{ position: "absolute", display: "flex", right: position.width, top: position.top, zIndex: 60 }}>
                    <span class="mr-10 text-lg font-mono w-30">Now select the R-Pentonimo pattern from the menu</span>
                    <FaArrowRight class="animate-bounce" size={35} />
                </div>,
            "cursor":
                <span style={{ position: "absolute", display: "flex", left: "50%", top: "30px", zIndex: 10 }}>Place your pattern anywere on the board</span>,
            "play":
                <div style={{ position: "absolute", display: "flex", right: position.width * 3, top: position.top, zIndex: 60 }}>
                    <span class="mr-10 text-lg font-mono w-30">Press play and see what happens!</span>
                    <FaArrowRight class="animate-bounce" size={35} />
                </div>,
        }

        return steps[this.state.tutorial]
    }

    cancelSelection() {
        Object.assign(this.data, {
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
        const isTutorial = this.state.tutorial && this.state.tutorial !== "skipped"

        return <div class="bg-transparent overflow-hidden relative flex h-full w-full" onKeyDown={(e) => this.handleKeyPress(e.key)}>
            <div class="flex flex-row w-full h-full">
                {isTutorial && this.renderTutorialArrow()}
                <div class="flex justify-center align-center w-full h-full z-0 m-auto bg-gray-200" tabIndex="-1">
                    {isTutorial && <span style={{ position: "absolute", width: "100%", height: "100%", zIndex: 20, backgroundColor: "rgba(135,135,135,.8)" }} />}
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
                        onMouseOut={() => this.handleMouseOut()}
                        onClick={() => this.handleClick()}
                    />

                    <canvas id="grid" class={"bg-transparent"} ref={this.gridRef} />
                    {this.state.selected &&
                        <div class="bg-red-300">
                            <div style={{
                                display: "flex",
                                position: "absolute",
                                justifyContent: "space-between",
                                left: this.state.capturingCoordinates.start.x * this.state.size,
                                top: ((this.state.capturingCoordinates.start.y < 7 && this.state.capturingCoordinates.end.y + 1) || this.state.capturingCoordinates.start.y - 5) * this.state.size,
                                padding: "5px"
                            }}>
                                <button
                                    class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                                    onClick={() => this.handleModel(this.canvas.rotateModel(this.state.selected))}
                                >
                                    <AiOutlineRotateRight size={this.state.ismobile ? 20 : 15} color="green" />
                                </button>
                                <button
                                    class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} ml-2 mr-1 bg-gray-100`}
                                    onClick={() => this.handleModel(this.canvas.rotateModel(this.state.selected))}
                                >
                                    <CgEditFlipH size={this.state.ismobile ? 20 : 15} color="green" />
                                </button>
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
                                    onClick={() => this.randomizeArea(this.state.capturingCoordinates)}
                                >
                                    <FaDiceD6 size={this.state.ismobile ? 20 : 15} color="turquoise" />
                                </button>
                                <button
                                    class={`flex rounded-md ${this.state.ismobile ? 'p-4' : 'p-2'} ml-1 mr-2 bg-gray-100`}
                                    onClick={() => {
                                        this.cancelSelection()
                                        this.dispatch();
                                    }}
                                >
                                    <AiOutlineCloseSquare size={this.state.ismobile ? 20 : 15} color="red" />
                                </button>
                            </div>
                        </div>
                    }

                </div>

                <button
                    id="menu"
                    class="absolute flex transition duration-300 ease-in-out rounded-md m-2 shadow-md bg-gray-300 px-4 py-2 z-40 focus:outline-none hover:bg-white"
                    onClick={() => this.setState({ menuOut: !this.state.menuOut })}
                >
                    <FaEquals size="20px" color={"#aaa"} />
                </button>

                <div class={`flex flex-col lg:w-3/12 sm:w-3/6 h-full bg-gray-200 shadow-xl z-20 right-0 absolute overflow-x-none overflow-y-auto px-4 transform transition ease-in-out duration-500 sm:duration-700 ${this.state.menuOut ? 'translate-x-full' : 'translate-x-0'}`}>
                    {this.state.tutorial && <span id="controlmask" style={{ position: "absolute", width: "100%", height: "100%", zIndex: 31, backgroundColor: "rgba(135,135,135,.8)" }} class="w-full h-full absolute left-0 bg-gray-300 bg-opacity-75" />}
                    <Display
                        intervalid={this.state.intervalid}
                        alive={this.alive.generation.size}
                        generation={this.state.generation}
                        speed={this.state.fps}
                        cursor={this.state.cursorcoord}
                    />
                    <div class="flex flex-col relative">
                        <div class="flex justify-between">

                            <button 
                                class={`transition duration-300 ease-in-out border-4 border-transparent rounded-full m-auto p-5 my-8 shadow-resting focus:shadow-button focus:outline-none`} 
                                onClick={() => {
                                    if(this.state.selected)
                                        this.cancelSelection();
                                    this.step()
                                }}
                            >
                                <FaStepForward size={20} />
                            </button>

                            <button 
                                id="play" 
                                class={`transition duration-300 ease-in-out border-4 border-transparent bg-gray-200 rounded-full m-auto p-5 my-8 focus:outline-none ${this.state.intervalid ? 'shadow-button' : 'shadow-resting'}`} 
                                onClick={() => {
                                    if(this.state.selected)
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
                        <div class="flex justify-between p-4">
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
                        <div id="patterns" class="w-11/12 relative flex flex-col mx-auto h-56 shadow-neuinner py-2 rounded-md overflow-y-scroll overflow-x-hidden bg-gray-200">
                            <button id="rpentomino" onClick={() => this.handleModel(this.rpentomino)} class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 z-40 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}>R-Pentomino</button>
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
                            <button onClick={() => this.setState({ tutorial: false })} class="px-4 m-auto py-2 rounded-md m-2 shadow-neusm focus:outline-none">Skip Tutorial</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}

export default Board;