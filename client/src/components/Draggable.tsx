import React, { Component } from "react";

type DraggableProps = {
    node: React.ReactNode,
    x?: number,
    y?: number,
};

type DraggableState = {
    x: number,
    y: number,
    isDragging: boolean,
};

class Draggable extends Component<DraggableProps, DraggableState> {
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: Readonly<DraggableProps>) {
        super(props);

        this.state = { 
            x: props.x || 0,
            y: props.y || 0,
            isDragging: false 
        };
        this.ref = React.createRef();
    }

    get width(): number {
        const width = this.ref.current?.offsetWidth;
        return width !== undefined ? width : -1;
    }

    get height(): number {
        const height = this.ref.current?.offsetHeight;
        return height !== undefined ? height : -1;
    }

    get x(): number {
        const x = this.ref.current?.offsetLeft;
        return x !== undefined ? x : -1;
    }

    set x(x: number) {
        this.setState({ x: x });
    }

    get y(): number {
        const y = this.ref.current?.offsetTop;
        return y !== undefined ? y : -1;
    }

    set y(y: number) {
        this.setState({ y: y });
    }

    get isDragging(): boolean {
        return this.state.isDragging;
    }

    set isDragging(isDragging: boolean) {
        this.setState({ isDragging: isDragging });
    }

    containsPoint(x: number, y: number): boolean {
        if (!this.ref.current) {
            return false;
        }

        return x >= this.x && y >= this.y && x < this.x+this.width && y < this.y+this.height;
    }

    render(): JSX.Element {
        const { node } = this.props;
        const { x, y } = this.state;

        return (
            <div style={{ left: x+'px', top: y+'px', position: 'absolute', border: '1px solid black' }} ref={this.ref}>{node}</div>
        );
    }
}

export default Draggable