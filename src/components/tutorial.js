import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

function Tutorial(menuOut) {
    this.step = "menu";
    this.disabledButtons = [];
    this.addListener = (id) => {
        let element = document.getElementById(id)
        element.addEventListener('click', () => this.stateHandler())
        element.disabled = false;
    };
    this.removeListener = (id) => {
        let element = document.getElementById(id)

        element.removeEventListener('click', () => this.stateHandler())
        this.disabledButtons.push(id)
        element.disabled = true;
    };

    this.renderTutorial = () => {
        let position = (this.step === "placement" || this.step === null) ? null : document.getElementById(this.step).getBoundingClientRect();
        let tutorialStep;

        switch (this.step) {
            case "menu":
                tutorialStep = (
                    <div style={{ position: "absolute", display: "flex", alignItems: "center", left: position.left + 100, top: position.top, zIndex: 60 }}>
                        <FaArrowLeft class="animate-bounce" size={35} />
                        <span class="ml-10 text-lg font-mono">Start by opening the menu</span>
                    </div>
                )
                break;

            case "rpentomino":
                tutorialStep = (
                    <div style={{ position: "absolute", display: "flex", right: position.width, top: position.top, zIndex: 60 }}>
                        <span class="mr-10 text-lg font-mono w-30">Now select the R-Pentonimo pattern from the menu</span>
                        <FaArrowRight class="animate-bounce" size={35} />
                    </div>
                )
                break;

            case "placement":
                tutorialStep = <span style={{ position: "absolute", display: "flex", left: "50%", top: "30px", zIndex: 60 }}>Place your pattern anywere on the board</span>
                break;

            case "play":
                tutorialStep = (
                    <div style={{ position: "absolute", display: "flex", right: position.width * 3, top: position.top, zIndex: 60 }}>
                        <span class="mr-10 text-lg font-mono w-30">Press play and see what happens!</span>
                        <FaArrowRight class="animate-bounce" size={35} />
                    </div>
                )
                break;
        }
        return <span>{tutorialStep}</span>
    }


    this.stateHandler = () => {
        switch (this.step) {
            case "menu":
                this.removeListener("menu");
                this.addListener("rpentomino");
                document.getElementById("rpentomino").style.zIndex = 40
                document.querySelector("button").disabled = true;
                this.step = "rpentomino"
                break;
            case "rpentomino":
                this.removeListener("rpentomino");
                this.addListener("cursor");
                this.step = "placement";
                menuOut(true);
                break;
            case "placement":
                this.removeListener("cursor");
                this.addListener("play");
                document.getElementById("play").style.zIndex = 40
                this.step = "play";
                menuOut(false);
                break;
            case "play":
                this.removeListener("play")
                this.step = null;
                for (let buttonI in this.disabledButtons) {
                    document.getElementById(this.disabledButtons[buttonI]).disabled = false;
                }
                break;
        }

        this.renderTutorial();



    }

}

export default Tutorial;