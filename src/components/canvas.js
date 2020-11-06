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

  this.drawModel = (model, coord) => {
    for (let [key, value] of Object.entries(model)) {
      this.ctx.beginPath();
      this.ctx.rect((value.x+coord.x)*this.size, (value.y+coord.y)*this.size, this.size-1, this.size-1)
      this.ctx.fillStyle = "#BBAAAA";
      this.ctx.fill();
    }
  }

  this.clear = () => {
    this.ctx.clearRect(0,0,this.dimentions, this.dimentions);
  }
}

export default Canvas