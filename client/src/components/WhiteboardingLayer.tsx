import React, { Component, MouseEvent } from "react";
import "./WhiteboardingLayer.scss";

type WhiteboardingLayerProps = {

};

type WhiteboardingLayerState = {
    pixels: number[][],
    message: string,
};

class WhiteboardingLayer extends Component<WhiteboardingLayerProps, WhiteboardingLayerState> {
    state: WhiteboardingLayerState = {
        pixels: [[]],
        message: "nothing happening...",
    };

    mouseDownHandler = (event: MouseEvent<HTMLDivElement>): void => {
        this.setState({message: `mouse down: (${event.pageX}, ${event.pageY})`});
    }

    mouseMoveHandler = (event: MouseEvent<HTMLDivElement>): void => {
        this.setState({message: `mouse moving: (${event.pageX}, ${event.pageY})`});
    }

    mouseUpHandler = (event: MouseEvent<HTMLDivElement>): void => {
        this.setState({message: `mouse up: (${event.pageX}, ${event.pageY})`});
    }

    render(): JSX.Element {
        const { message } = this.state;

        return (
            <div className="overlay" onMouseDown={this.mouseDownHandler} onMouseMove={this.mouseMoveHandler} onMouseUp={this.mouseUpHandler}>
                {message}
            </div>
        );
    }
}

export default WhiteboardingLayer;