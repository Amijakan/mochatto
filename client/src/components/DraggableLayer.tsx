import React, { Component, MouseEvent, ReactNode } from "react";
import "./DraggableLayer.scss";

type DraggableLayerProps = {
    children: React.ReactNode | React.ReactNode[],
};

class DraggableLayer extends Component<DraggableLayerProps> {
    mouseDownHandler = (event: MouseEvent<HTMLDivElement>): void => {
        const { children } = this.props;
        React.Children.map(children, (child : ReactNode) => {
            console.log(child);
        });
        console.log(event);
    }

    mouseMoveHandler = (event: MouseEvent<HTMLDivElement>): void => {
        const { children } = this.props;
        React.Children.map(children, (child : ReactNode) => {
            console.log(child);
        });
        console.log(event);
    }

    mouseUpHandler = (event: MouseEvent<HTMLDivElement>): void => {
        const { children } = this.props;
        React.Children.map(children, (child : ReactNode) => {
            console.log(child);
        });
        console.log(event);
    }

    render(): JSX.Element {
        console.log(this.props.children);

        return (
            <div className="overlay" onMouseDown={this.mouseDownHandler} onMouseMove={this.mouseMoveHandler} onMouseUp={this.mouseUpHandler}>
                {"yeah"}
            </div>
        );
    }
}

export default DraggableLayer;