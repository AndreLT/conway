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

  this.drawCaptureArea = (capture, cursor, color) => {
    this.clear();
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.3;
    this.ctx.rect(capture.x*this.size, capture.y*this.size, (cursor.x - capture.x)*this.size,(cursor.y - capture.y + 1)*this.size);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

  }

  this.drawGrid = () => {
    const limitX = Math.floor(this.dimentions.width/this.size);
    const limitY = Math.floor(this.dimentions.height/this.size);

    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "lightgray"
    for(let i=0; i<=limitX;i++){
      let scaled = i*this.size;
      this.ctx.moveTo(scaled, 0);
      this.ctx.lineTo(scaled, this.dimentions.height);
    }
    for(let j=0; j<=limitY;j++){
      let scaled = j*this.size;
      this.ctx.moveTo(0, scaled);
      this.ctx.lineTo(this.dimentions.width, scaled);
    }
    this.ctx.stroke();
  }

  this.drawCursor = (cursor) => {
    this.clear();
    this.ctx.beginPath();
    this.ctx.rect(cursor.x*this.size, cursor.y*this.size, this.size, this.size);
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
  }

  this.drawMouse = (clientX, clientY) => {
    let scaledX = Math.floor(clientX/this.size)
    let scaledY = Math.floor(clientY/this.size)
    this.clear();
    this.ctx.beginPath();
    this.ctx.rect(scaledX*this.size, scaledY*this.size, this.size, this.size);
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
  }

  this.drawModel = (model, coord, color) => {
    let entries = Object.entries(model)
    let adjustedCoord = {x:coord.x+1, y:coord.y+1}

    this.clear();

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

  this.mirrorModel = (model) => {
    let inverted = {};
    let size = Object.keys(model).length-1;
    let width = model["area"].x-1;


    for(let i=1; i<=size; i++){
      let element = model[i];
      inverted[i] = {x: width-element.x, y:element.y}
    }
    inverted["area"] = model["area"];

    return inverted;
  }

  this.rotateModel = (model) => {
    let area = model["area"]
    let rotated = {};
    let size = Object.keys(model).length-1;

    for (let i=1;i<=size;i++) {
        let element = model[i]
        rotated[i] = {x:area.y-element.y-1,y:element.x}
    }

    rotated.area = {x:area.y, y:area.x}
    return rotated
}

  this.checkModelBound = (difference, model, bounds) => {
    let patternArea = model["area"];

    if(patternArea.x+difference.x+1 > bounds.x || difference.x+1 < 0 || patternArea.y+difference.y+1 > bounds.y || difference.y+1 < 0){
        return false;
    }
    return true;
}

  this.clear = () => {
    this.ctx.clearRect(0,0,this.dimentions.width, this.dimentions.height);
  }
}

export default Canvas