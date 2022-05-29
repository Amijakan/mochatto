import React, { Children, Component, MouseEvent, ReactNode } from "react";
import Draggable from "./Draggable";
import "./DraggableLayer.scss";

type DraggableLayerProps = {
    children: ReactNode | ReactNode[],
};

class DraggableLayer extends Component<DraggableLayerProps> {
    childRefs: Array<React.RefObject<Draggable>>;
    draggableChildren: Array<JSX.Element> | null | undefined;

    constructor(props: Readonly<DraggableLayerProps>) {
        super(props);

        this.childRefs = [];
        this.draggableChildren = Children.map(props.children, (child: ReactNode) => {
            const ref: React.RefObject<Draggable> = React.createRef();
            this.childRefs.push(ref);
            return <Draggable x={150} y={150} ref={ref} node={child} />;
        });
    }

    // componentDidMount(): void {
    // }

    mouseDownHandler = (event: MouseEvent<HTMLDivElement>): void => {
        this.childRefs.map((child) => {
            console.log(child);
            if (child.current?.containsPoint(event.clientX, event.clientY)) {
                child.current.isDragging = true;
            }
        });
    }

    mouseMoveHandler = (event: MouseEvent<HTMLDivElement>): void => {
        this.childRefs.map((child) => {
            if (child.current?.isDragging) {
                child.current.x = event.clientX;
                child.current.y = event.clientY;
            }
        });
    }

    mouseUpHandler = (): void => {
        this.childRefs.map((child) => {
            if (child.current) {
                child.current.isDragging = false;
            }
        });
    }

    render(): JSX.Element {
        return (
            <div className="overlay" onMouseDown={this.mouseDownHandler} onMouseMove={this.mouseMoveHandler} onMouseUp={this.mouseUpHandler}>
                {this.draggableChildren}
            </div>
        );
    }
}

export default DraggableLayer;