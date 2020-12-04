function Alive(){
    this.bounds = {x:0, y:0};

    this.generation = new Map();

    this.scan = () => {
        let toLive = [];
        let toDie = [];
        let adjacent = new Map();

        for (let [key, value] of this.generation) {
            for(let i=value.x-1; i<=value.x+1; i++){
                for(let j=value.y-1; j<=value.y+1; j++){
                    let adjusted = this.boundAdjusted({x:i, y:j})
                    let element = adjusted.x + '-' + adjusted.y;
                    let current = adjacent.get(element)

                    if(current?.neighbours)
                        adjacent.set(element, {neighbours: current.neighbours+1, coordinates: current.coordinates});
                    else 
                        adjacent.set(element, {neighbours: 1, coordinates: {x:adjusted.x, y:adjusted.y}});
                }
            }
            let own = adjacent.get(key);
            adjacent.set(key,{neighbours: own.neighbours-1, coordinates: own.coordinates})
        };

        for (let [key, value] of adjacent){
            if(value.neighbours < 2 || value.neighbours > 3){
                toDie.push(key)
            }else if(value.neighbours === 3){
                toLive.push(value.coordinates)
            }
        }
        

        if(toDie.length || toLive.length){
            this.conceive(toLive);
            this.kill(toDie);
            return true;
        }else{
            return false;
        }
    };

    this.removeOverBounds = () => {
        let overBounds = [];

        for (let [key, value] of this.generation) {
            if(value.x > this.bounds.x || value.y > this.bounds.y)
                overBounds.push(key)
        }

        this.kill(overBounds);
    }

    this.randomizeBoard = () => {
        this.randomizeArea({
            start: {x:0, y:0},
            end: {x:this.bounds.x, y:this.bounds.y}
        })
    }
    
    this.randomizeArea = (bounds) => {
        for(let i=bounds.start.x; i<bounds.end.x; i++){
            for(let j=bounds.start.y; j<bounds.end.y; j++){
                if(Math.floor(Math.random() * Math.floor(2))){
                    this.generation.set(i + '-' + j, {x:i, y:j})
                }
            }
        }
    }

    this.clearArea = (bounds) => {
        let victims = [];
        for(let i=bounds.start.x; i<=bounds.end.x; i++){
            for(let j=bounds.start.y; j<=bounds.end.y; j++){
                let cellName = i + '-' + j
                if(this.generation.has(cellName))
                    victims.push(cellName)
            }
        }
        this.kill(victims);
    }

    this.boundAdjusted = (coordinates) => {
        let newcoordinates = coordinates

        if(coordinates.x < 0)
            newcoordinates.x = this.bounds.x
        else if(coordinates.x > this.bounds.x)
            newcoordinates.x = 0

        if(coordinates.y < 0)
            newcoordinates.y = this.bounds.y
        else if(coordinates.y > this.bounds.y)
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

    this.killAll = () => {
        this.generation.clear();
    }

}

export default Alive;