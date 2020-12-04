import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const Tutorial = (props) => {
    const stepids = ["menu", "patterns", "maincontrols", "speed", null]
    const position = (id) => document.getElementById(id).getBoundingClientRect();

    let stepid = stepids[props.step]
    let tutorialStep;
    let pos;

    switch (stepid) {
        case "menu":
            pos = position("menu");
            tutorialStep = (
                <div style={{ position: "absolute", display: "flex", alignItems: "center", left: pos.left + 100, top: pos.top, zIndex: 60 }}>
                    <FaArrowLeft class="animate-bounce" size={35} />
                    <span class="ml-10 lg:text-lg md:text-md text-sm font-mono">You can access the menu by clicking here</span>
                </div>
            )
            break;

        case "patterns":
            if(props.isMenuOut)
                props.menuOut(false);
            pos = position("patterns");
            document.getElementById("control").scrollTo(0, pos.top)
            pos = position("patterns");
            tutorialStep = (
                <div style={{ position: "absolute", display: "flex", right: pos.width, top: pos.top + 50, zIndex: 60 }}>
                    <span class="mr-10 text-lg font-mono w-30">Here is a list of patterns you can choose from.</span>
                    <FaArrowRight class="animate-bounce" size={35} />
                </div>
            )
            break;

        case "maincontrols":
            document.getElementById("control").scrollTo(0,0)
            pos = position("maincontrols");
            tutorialStep =( 
                <div style={{ position: "absolute", display: "flex",  right: pos.width, top: pos.top+50, zIndex: 60 }}>
                    <span class="mr-10 text-lg font-mono w-30">These are the simulation's main controls.<br/> You can Step, Play and Pause your simulation.</span>
                    <FaArrowRight class="animate-bounce" size={35} />
                </div>
            )
            break;

        case "speed":
            pos = position("speed");
            tutorialStep = (
                <div style={{ position: "absolute", display: "flex", right: pos.width, top: pos.top+10, zIndex: 60 }}>
                    <span class="mr-10 text-lg font-mono w-30">And here you can change the speed</span>
                    <FaArrowRight class="animate-bounce" size={35} />
                </div>
            )
            break;
        default:
            props.endTutorial();
    }
    return <span>{tutorialStep}</span>

}

export default Tutorial;