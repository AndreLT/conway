function Alive(){
    this.bounds = 0;

    this.generation = new Map();

    this.scan = () => {
        let toLive = [];
        let toDie = [];

        for (let [key, value] of this.generation) {
            let adjustedToBounds = this.boundAdjusted(value)
            let neighbours = this.neighbours(adjustedToBounds, true);

            if(neighbours[0] > 3 || neighbours[0] < 2)
                toDie.push(key);
                
            if(neighbours[1])
                toLive = toLive.concat(neighbours[1]);
        };

        if(toDie.length || toLive.length){
            this.conceive(toLive);
            this.kill(toDie);
            return true;
        }else{
            alert("Stable")
            return false;
        }
    };

    this.boundAdjusted = (coordinates) => {
        let newcoordinates = coordinates

        if(coordinates.x < 0)
            newcoordinates.x = this.bounds
        else if(coordinates.x > this.bounds)
            newcoordinates.x = 0

        if(coordinates.y < 0)
            newcoordinates.y = this.bounds
        else if(coordinates.y > this.bounds)
            newcoordinates.y = 0

        return newcoordinates
    }

    this.neighbours = (element, testdead) => {
        let neighbours = 0;
        let toLive = [];

        for(let i=element.x-1; i<=element.x+1; i++){
            for(let j=element.y-1; j<=element.y+1; j++){
                let adjustedNeighbour = this.boundAdjusted({x:i, y:j})
                if(this.generation.has(adjustedNeighbour.x + '-' + adjustedNeighbour.y)){
                    neighbours++;
                }
                else if(testdead){
                    let [dneighbours, _] = this.neighbours(adjustedNeighbour, false)
                    if(dneighbours === 2)
                        toLive.push({x:adjustedNeighbour.x, y:adjustedNeighbour.y})
                }
            }
        }

        return [neighbours-1, toLive];
    };

    this.conceiveModel = (model, cursor) => {
        let entries = Object.entries(model)
        let adjustedCoord = {x:cursor.x+1, y:cursor.y+1}
        let x;
        let y;
        for (let i=0;i<entries.length-1;i++) {
            x = entries[i][1].x+adjustedCoord.x
            y = entries[i][1].y+adjustedCoord.y
            this.generation.set(x + '-' + y, {x: x, y: y})
        };
    };

    this.conceive = (fortunates) => {
        fortunates.forEach(element =>{
            this.generation.set(element.x + '-' + element.y, element)
        })
    };

    this.kill = (unfortunates) => {
        //R.I.P.
        unfortunates.forEach(element =>{
            this.generation.delete(element)
        })
    };

    this.size = () => {
        return this.generation.size;
    }
}

export default Alive;