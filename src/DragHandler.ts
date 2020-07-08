import { NodeId, Node, DerivedEventHandlers } from "@craftjs/core";
import interact from "interactjs";
import MouseSensor from "./Draggable/MouseSensor";
import {
  ConnectorsForHandlers,
  defineEventListener,
  Handlers,
  CraftDOMEvent
} from "@craftjs/utils";

export class LayerHandlers extends DerivedEventHandlers<"drag" | "drop"> {
  private id;
  static draggedElement;
  static events: {
    indicator: any;
    currentCanvasHovered: Node;
  } = {
    indicator: null,
    currentCanvasHovered: null
  };
  static currentCanvasHovered;

  constructor(store, derived, id) {
    super(store, derived);
    this.id = id;
    // The event is added multiple time, once per item, I need to only register once
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const state = this.store.getState();
      const target = state.nodes[state.events.selected].dom;
      if (target) {
        console.log(target);
        var x =
          (parseFloat(target.getAttribute("data-x")) || target.style.left) + 1;
        var y =
          (parseFloat(target.getAttribute("data-y")) || target.style.top) + 0;

        // translate the element
        // target.style.webkitTransform = target.style.transform =
        //   "translate(" + x + "px, " + y + "px)";

        target.style.top = y + "px";
        target.style.left = x + "px";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      }
    });
  }

  getNode(id) {
    return this.store.getState().nodes[id];
  }

  handlers() {
    const parentConnectors = this.derived.connectors();

    return {
      drop: {
        init: el => {
          setupDropable(interact(el), this);
        }
      },
      drag: {
        init: el => {
          // el.setAttribute("draggable", true);
          // parentConnectors.drop(el, this.id);
          parentConnectors.select(el, this.id);
          // parentConnectors.hover(el, this.id);
          // parentConnectors.drag(el, this.id);
          // setupInteractable(interact(el), this);
          this.store.actions.setDOM(this.id, el);
          const sensor = new MouseSensor(el)
          sensor.attach()

          return () => {
            el.removeAttribute("draggable");
          };
        },
        events: []
      }
    };
  }
}

export type LayerConnectors = ConnectorsForHandlers<LayerHandlers>;

function dragMoveListener(event) {
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x =
    (parseFloat(target.getAttribute("data-x")) || target.style.left) + event.dx;
  var y =
    (parseFloat(target.getAttribute("data-y")) || target.style.top) + event.dy;

  // translate the element
  // target.style.webkitTransform = target.style.transform =
  //   "translate(" + x + "px, " + y + "px)";

  target.style.top = y + "px";
  target.style.left = x + "px";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}

function setupInteractable(item, handler) {
  item.draggable({
    listeners: {
      move: dragMoveListener,
      start: e => {
        e.preventDefault();
        e.stopPropagation();
        console.log("start drag", handler.id);
        handler.store.actions.setNodeEvent("dragged", handler.id);
        LayerHandlers.draggedElement = handler.id;
      },
      end: e => {
        e.preventDefault();
        e.stopPropagation();
        const { draggedElement, events } = LayerHandlers;
        if (events.indicator && !events.indicator.error) {
          const { placement } = events.indicator;
          const { parent, index, where } = placement;
          const { id: parentId } = parent;

          handler.store.actions.move(
            draggedElement as NodeId,
            parentId,
            index + (where === "after" ? 1 : 0)
          );
        }
      }
    },

    inertia: false,
    modifiers: [
      interact.modifiers.snap({
        targets: [interact.createSnapGrid({ x: 1, y: 1 })],
        range: Infinity,
        relativePoints: [{ x: 0, y: 0 }]
      }),
      interact.modifiers.restrictRect({
        restriction: item.parentNode,
        endOnly: true
      })
    ]
  });

  item.resizable({
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;

        // update the element's style
        target.style.width = event.rect.width + "px";
        target.style.height = event.rect.height + "px";

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.top = y + "px";
        target.style.left = x + "px";

        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
        target.textContent =
          Math.round(event.rect.width) +
          "\u00D7" +
          Math.round(event.rect.height);
      }
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: "parent"
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 }
      })
    ],

    inertia: true
  });
}

function setupDropable(item, handler) {
  item.dropzone({
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.75,
    // listen for drop related events:

    ondragenter: function(event) {
      const draggableElement = event.relatedTarget;
      const dropzoneElement = event.target;
      const dragId = LayerHandlers.draggedElement;
      console.log("on drag eneter", dragId);
      let target = handler.id;
      const indicatorInfo = handler.store.query.getDropPlaceholder(
        dragId,
        target,
        { x: event.clientX, y: event.clientY },
        node => {
          const layer = handler.getNode(node.id);
          return layer && layer.dom;
        }
      );

      if (indicatorInfo) {
        LayerHandlers.events.indicator = indicatorInfo;
      }
      console.log(indicatorInfo);

      //   // feedback the possibility of a drop
      //   dropzoneElement.classList.add("drop-target");
      //   draggableElement.classList.add("can-drop");
      //   draggableElement.textContent = "Dragged in";
    }
    // ondragleave: function(event) {
    //   // remove the drop feedback style
    //   event.target.classList.remove("drop-target");
    //   event.relatedTarget.classList.remove("can-drop");
    //   event.relatedTarget.textContent = "Dragged out";
    // },
  });
}
