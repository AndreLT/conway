import React from 'react';

import Canvas from './canvas'

const Board = () => {
    let alive = new Map();

    alive.set('0', {coord: {x: 5, y:5}})
    alive.set('1', {coord: {x: 6, y:6}})
    alive.set('2', {coord: {x: 7, y:7}})
    alive.set('3', {coord: {x: 8, y:8}})
    alive.set('4', {coord: {x: 9, y:9}})
    alive.set('5', {coord: {x: 10, y:10}})

    return <Canvas alive={alive} size={50}/>
}

export default Board;