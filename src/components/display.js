import React from 'react';
import { CgIcecream } from 'react-icons/cg';

function Display(ref, context, dimentions){
    this.ref = ref;
    this.ctx = context;
    this.dimentions = dimentions;
    this.generation = 0;
    this.padding = {x:15, y:10};

    this.fillTextWithPadding = (text, x, y) => {
        this.ctx.fillText(text, (this.ctx.textAlign === "start" ? x+this.padding.x : x-this.padding.x), y+this.padding.y)
    }

    this.createBackground = (paused = true) => {
        let ctx = this.ctx;
        
        let normalizedSize = Math.floor(this.dimentions.height/8)
        let vspacing = Math.floor(normalizedSize/2)

        ctx.font = `bold ${normalizedSize}px sans-serif`;

        ctx.textAlign = "start";

        ctx.globalAlpha = paused ? 0.4 : .85
        this.fillTextWithPadding("Auto", 0, normalizedSize); 

        ctx.textAlign = "end";

        ctx.globalAlpha = paused ? .85 : 0.4
        this.fillTextWithPadding("Paused", this.dimentions.width, normalizedSize);

        ctx.font = `bold ${Math.floor(normalizedSize*0.8)}px sans-serif`;

        ctx.globalAlpha = .85;
        ctx.textAlign = "start"
        this.fillTextWithPadding("Alive:", 0, (normalizedSize*3));
        this.fillTextWithPadding("Generation:", 0, (normalizedSize*4));
        this.fillTextWithPadding("Gen./s:", 0, (normalizedSize*5))
    }

    this.drawValues = (alive, speed, increaseGen=true) => {
        let ctx = this.ctx;
        
        let normalizedSize = Math.floor(this.dimentions.height/8)
        let vspacing = Math.floor(normalizedSize/2)

        ctx.clearRect(Math.floor(this.dimentions.width/2), normalizedSize*2, this.dimentions.width, normalizedSize*6)

        ctx.font = `bold ${Math.floor(normalizedSize*0.8)}px sans-serif`;

        ctx.textAlign = "end"

        this.fillTextWithPadding(alive, this.dimentions.width, normalizedSize*3);
        this.fillTextWithPadding((this.generation), this.dimentions.width, normalizedSize*4);

        this.fillTextWithPadding(speed, this.dimentions.width, normalizedSize*5)
        
        if(increaseGen)
            this.generation++;
    }

    this.drawCoordinates = (coordinates) => {
        let normalizedSize = Math.floor(this.dimentions.height/8)

        this.ctx.clearRect(Math.floor(this.dimentions.width/2), normalizedSize*6, this.dimentions.width, this.dimentions.height)

        this.fillTextWithPadding(`x: ${coordinates.x}, y: ${coordinates.y}`, this.dimentions.width, normalizedSize*7)
    }

    this.clear = () => {
        this.ctx.clearRect(0,0,this.dimentions.width, this.dimentions.height);
    }

    this.reset = () => {
        this.generation = 0;
    }
};

export default Display;