import React, { useRef, useEffect } from 'react'

const Canvas = props => {
  const canvasRef = useRef(null)

  const draw = (ctx) => {
    props.alive.forEach(element => {
      const x = element.coord.x*props.size;
      const y = element.coord.y*props.size;

      ctx.beginPath();
      ctx.rect(x, y, props.size, props.size);
      ctx.fill();
    })
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.canvas.width=window.screen.width
    context.canvas.height=window.screen.height

    draw(context)
  })

  
  return <>
    <div class="view">
      <canvas className="canvas" ref={canvasRef} {...props}/>
    </div>
  </>
}

export default Canvas