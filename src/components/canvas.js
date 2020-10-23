import React, { useRef, useEffect, useState } from 'react'

const Canvas = props => {
  const canvasRef = useRef(null)
  const cellSelected = {x:0, y:0};
  const [ctx, setCtx] = useState(null);
  let relativeLocation = null;

  const draw = () => {
    
    for (let [key, value] of props.alive) {
      const x = value.coord.x*props.size;
      const y = value.coord.y*props.size;

      ctx.beginPath();
      ctx.rect(x, y, props.size-1, props.size-1);
      ctx.fill();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    setCtx(context);

    //getting canvas width
    let width=Math.floor(window.innerWidth*0.7)
    let height=Math.floor(window.innerHeight*0.9)

    context.canvas.width=width
    context.canvas.height=height
    console.log(width, height)

    relativeLocation=({x:context.canvas.offsetLeft, y:context.canvas.offsetTop})

    draw()
  })

  
  return <canvas class="view" ref={canvasRef} {...props}/>
}

export default Canvas