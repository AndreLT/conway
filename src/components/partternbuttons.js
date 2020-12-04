import React from 'react';
import ReactTooltip from 'react-tooltip';

function PatternButtons(handleModel, size) {
    this.patternList = [
        [ 'Glider Gun', 'glider_gun' ],
        [ 'Glider', 'glider' ],
        [ 'Mega Glider', 'mega_glider' ],
        [ '3 Pulsar', '3_pulsar' ],
        [ 'R-Pentomino', 'r_pentomino' ],
        [ 'Achim\'s p11', 'achims_p11' ],
    ]

    this.patterns = {};

    this.loadPatterns = () => {
        this.patternList.forEach(element => this.patterns[element[0]] = require(`../models/${element[1]}.json`))
    }

    this.createSvg = (key) => {
        if(key !== null){
            const element = this.patterns[key]
            const area = element.area;
            return (<svg width={area.x*size} height={area.y*size} style={{borderRadius:"2px", zIndex:"60", stroke: "none"}}>
                    <rect width={area.x*size} height={area.y*size} style={{fill:"white"}}/>
                {Object.keys(element).map(cell => 
                    <rect 
                        x={element[cell].x*size} 
                        y={element[cell].y*size} 
                        width={size}
                        height={size}
                    />
                )}
                </svg>
            )
        }
    }

    this.renderButtons = () => {
        return <div id="patterns" class="w-11/12 relative flex flex-col mx-auto h-56 shadow-neuinner py-2 rounded-md z-60 scrolling-touch overflow-x-hidden bg-gray-200">
            {Object.keys(this.patterns).map(key => (<button 
                    class={`transition duration-300 ease-in-out bg-gray-100 rounded-sm px-5 py-2 mx-2 my-1 shadow-popup transform focus:scale-95 focus:shadow-popdown focus:outline-none`}
                    onClick={() => handleModel(this.patterns[key])}
                    data-for="patterns"
                    data-tip={key}
                >
                    {key}
                </button>)
            )}
            <ReactTooltip id="patterns" getContent={(dataTip) => this.createSvg(dataTip)} backgroundColor="white"/>
        </div>
    }
}

export default PatternButtons;