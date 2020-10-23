import React, { useRef, useEffect, useState } from 'react'

const Canvas = props => {
  const canvasRef = useRef(null);

  const draw = (ctx) => {
    
    for (let [key, value] of props.alive) {
      const x = value.coord.x*props.size;
      const y = value.coord.y*props.size;

      ctx.beginPath();
      ctx.rect(x, y, props.size-1, props.size-1);
      ctx.fill();
    }
  }

  const drawCursor = (ctx) => {
    ctx.beginPath();
    ctx.rect(props.cursor.x*props.size, props.cursor.y*props.size, props.size, props.size);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  const drawModel = (ctx) => {
    props.model.forEach(element => {
      ctx.beginPath();
      ctx.rect(element.x*props.size, element.y*props.size, props.size, props.size)
      ctx.fillStyle = "grey";
      ctx.fill();
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    //getting canvas width
    let width=window.innerWidth*0.7
    let height=window.innerHeight-20

    context.canvas.width=width
    context.canvas.height=height

    if(props.cursor){
      drawCursor(context);
    }

    if(props.model){
      drawModel(context);
    }

    draw(context);
  })

  
  return <canvas id="board" class="view" ref={canvasRef} {...props}/>
}

export default Canvas