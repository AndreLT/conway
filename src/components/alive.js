function Alive(){
    this.generation = new Map();

    this.scan = () => {
        let toLive = [];
        let toDie = [];

        for (let [key, value] of this.generation) {
            let neighbours = this.neighbours(value, true);

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

    this.neighbours = (element, testdead) => {
        let neighbours = 0;
        let toLive = [];

        for(let i=element.x-1; i<=element.x+1; i++){
            for(let j=element.y-1; j<=element.y+1; j++){
                if(this.generation.has(i + '-' + j)){
                    neighbours++;
                }
                else if(testdead){
                    let [dneighbours, _] = this.neighbours({x: i, y: j}, false)
                    if(dneighbours === 2)
                        toLive.push({x:i, y:j})
                }
            }
        }

        return [neighbours-1, toLive];
    };

    this.conceiveModel = (model, cursor) => {
        let x;
        let y;
        for (let [key, value] of Object.entries(model)) {
            x = value.x + cursor.x
            y = value.y + cursor.y
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