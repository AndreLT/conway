import React from 'react';

function Display(ref, context, dimentions, pxRatio){
    this.ref = ref;
    this.ctx = context;
    this.dimentions = dimentions;
    this.generation = 0;

    this.createBackground = (paused = true) => {
        let normalizedSize = Math.floor(this.dimentions.height/8)
        let ctx = this.ctx;

        ctx.font = `bold ${normalizedSize}px Courier New, sans-serif`;

        ctx.textAlign = "start";

        ctx.globalAlpha = paused ? 0.4 : 1
        ctx.fillText("Auto", 0, normalizedSize); 

        ctx.textAlign = "end";

        ctx.globalAlpha = paused ? 1 : 0.4
        ctx.fillText("Paused", this.dimentions.width, normalizedSize);

        ctx.globalAlpha = 1;
        ctx.textAlign = "start"
        ctx.fillText("Alive:", 0, normalizedSize*4);
        ctx.fillText("Generation:", 0, normalizedSize*6);

        ctx.fillText("Gen./s:", 0, normalizedSize*8)
    }

    this.drawValues = (alive, speed, increaseGen=true) => {
        let normalizedSize = Math.floor(this.dimentions.height/8)
        let ctx = this.ctx;

        ctx.clearRect(Math.floor(this.dimentions.width/2), normalizedSize*2, this.dimentions.width, this.dimentions.height)

        ctx.font = `bold ${normalizedSize}px Courier New, sans-serif`;

        ctx.textAlign = "end"

        ctx.fillText(alive, this.dimentions.width, normalizedSize*4);
        ctx.fillText((this.generation), this.dimentions.width, normalizedSize*6);

        ctx.fillText(speed, this.dimentions.width, normalizedSize*8)
        
        if(increaseGen)
            this.generation++;
    }

    this.clear = () => {
        this.ctx.clearRect(0,0,this.dimentions.width, this.dimentions.height);
    }

    this.reset = () => {
        this.generation = 0;
    }
};

export default Display;