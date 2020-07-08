import * as React from "react";
import "./styles.css";
import {
  useEventHandler,
  Editor,
  Frame,
  Element,
  useNode
} from "@craftjs/core";
import { LayerHandlers } from "./DragHandler";
import { Draggable } from "@shopify/draggable";

const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style
}) => {
  const {
    connectors: { connect, drag }
  } = useNode();

  const handler = useEventHandler();
  const {
    id
    // connectors: { drag, connect }
  } = useNode();

  const connectors = React.useMemo(
    () => handler.derive(LayerHandlers, id).connectors(),
    [handler, id]
  );
  return (
    <div ref={ref => connectors.drop(ref)} style={style}>
      {children}
    </div>
  );
};

interface BlockProps {
  pageX: number;
  pageY: number;
  backgroundColor?: string;
}

const Block: React.FC<BlockProps> = ({
  pageX,
  pageY,
  backgroundColor = "lemonchiffon"
}) => {
  const handler = useEventHandler();
  const {
    id
    // connectors: { drag, connect }
  } = useNode();

  const connectors = React.useMemo(
    () => handler.derive(LayerHandlers, id).connectors(),
    [handler, id]
  );

  return (
    <div
      className="box"
      ref={ref => connectors.drag(ref)}
      style={{
        position: "absolute",
        touchAction: "none",
        boxSizing: "border-box",
        top: pageY,
        left: pageX,
        width: 100,
        height: 100,
        border: "1px solid #000",
        backgroundColor
      }}
    />
  );
};

export default function App() {
  return (
    <div className="App">
      <Editor resolver={{ Container, Block }}>
        <div>
          <Frame>
            <Element
              canvas
              is={Container}
              style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "lavender"
              }}
            >
              <Element
                canvas
                is={Container}
                style={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "green"
                }}
              >
                <Block backgroundColor="blue" pageY={100} pageX={100} />
              </Element>
              <Block backgroundColor="red" pageY={100} pageX={100} />
              <Block pageY={200} pageX={300} />
            </Element>
          </Frame>
        </div>
      </Editor>
    </div>
  );
}
