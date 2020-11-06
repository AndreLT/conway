function Canvas(ref, context, size, dimentions){
  this.ref = ref;
  this.ctx = context;
  this.size = size;
  this.dimentions = dimentions;
  this.background = document.createElement('canvas');

  this.draw = (alive) => {  

    this.clear();
    for (let [key, value] of alive) {
      const x = value.x*this.size;
      const y = value.y*this.size;

      this.ctx.beginPath();
      this.ctx.rect(x, y, this.size-1, this.size-1);
      this.ctx.fillStyle = "black";
      this.ctx.fill();
    }
  }

  this.drawCaptureArea = (capture, cursor) => {
    this.clear();
    this.ctx.beginPath();
    this.ctx.fillStyle = "blue";
    this.ctx.globalAlpha = 0.3;
    this.ctx.rect(capture.x*this.size, capture.y*this.size, (cursor.x - capture.x)*this.size,(cursor.y - capture.y + 1)*this.size);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

  }

  this.drawGrid = () => {
    const limit = Math.floor(this.dimentions/this.size);

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for(let i=0; i<=limit;i++){
      let scaled = i*this.size
      this.ctx.moveTo(0, scaled);
      this.ctx.lineTo(dimentions, scaled);
      this.ctx.moveTo(scaled,0);
      this.ctx.lineTo(scaled, dimentions);
    }
    this.ctx.strokeStyle = "lightgray"

    this.ctx.stroke();
  }

  this.drawCursor = (cursor) => {
    this.clear();
    this.ctx.beginPath();
    this.ctx.rect(cursor.x*this.size, cursor.y*this.size, this.size, this.size);
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
  }

  this.drawModel = (model, coord, color) => {
    let entries = Object.entries(model)
    let adjustedCoord = {x:coord.x+1, y:coord.y+1}

    this.ctx.beginPath();
    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = color;

    for (let i=0;i<entries.length-1;i++) {
      this.ctx.rect((entries[i][1].x+adjustedCoord.x)*this.size, (entries[i][1].y+adjustedCoord.y)*this.size, this.size, this.size)
    }
    
    this.ctx.fill();
    this.ctx.globalAlpha = 0.2;
    this.ctx.rect((adjustedCoord.x)*this.size, (adjustedCoord.y)*this.size, model["area"].x*this.size, model["area"].y*this.size);
    this.ctx.fill();

    this.ctx.globalAlpha = 1.0;
  }

  this.checkModelBound = (difference, model, bounds) => {
    let patternArea = model["area"];

    if(patternArea.x+difference.x > bounds || patternArea.y+difference.y > bounds){
        return false;
    }
    return true;
}

  this.clear = () => {
    this.ctx.clearRect(0,0,this.dimentions, this.dimentions);
  }
}

export default Canvas