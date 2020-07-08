import Sensor from "./Sensor";
import {
  SensorEvent,
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent
} from "./SensorEvent";

const onContextMenuWhileDragging = Symbol("onContextMenuWhileDragging");
const onMouseDown = Symbol("onMouseDown");
const onMouseMove = Symbol("onMouseMove");
const onMouseUp = Symbol("onMouseUp");
const startDrag = Symbol("startDrag");
const onDistanceChange = Symbol("onDistanceChange");

/**
 * This sensor picks up native browser mouse events and dictates drag operations
 * @class MouseSensor
 * @module MouseSensor
 * @extends Sensor
 */
export default class MouseSensor extends Sensor<MouseEvent> {
  /**
   * MouseSensor constructor.
   */
  constructor(target: HTMLElement, options = {}) {
    super(target, options);

    this[onContextMenuWhileDragging] = this[onContextMenuWhileDragging].bind(
      this
    );
    this[onMouseDown] = this[onMouseDown].bind(this);
    this[onMouseMove] = this[onMouseMove].bind(this);
    this[onMouseUp] = this[onMouseUp].bind(this);
    this[startDrag] = this[startDrag].bind(this);
    this[onDistanceChange] = this[onDistanceChange].bind(this);
  }

  /**
   * Attaches sensors event listeners to the DOM
   */
  attach() {
    document.addEventListener("mousedown", this[onMouseDown], true);
    return this;
  }

  /**
   * Detaches sensors event listeners to the DOM
   */
  detach() {
    document.removeEventListener("mousedown", this[onMouseDown], true);
    return this;
  }

  /**
   * Mouse down handler
   */
  private [onMouseDown](event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey) {
      return;
    }
    console.log("MOUSE DOWN");

    const { pageX, pageY } = event;

    Object.assign(this, { pageX, pageY });
    this.startEvent = event;

    document.addEventListener("mouseup", this[onMouseUp]);
    document.addEventListener("dragstart", preventNativeDragStart);
    document.addEventListener("mousemove", this[onDistanceChange]);
  }

  /**
   * Start the drag
   */
  private [startDrag]() {
    const startEvent = this.startEvent;
    console.log("START DRAG");
    const dragStartEvent = new DragStartSensorEvent({
      clientX: startEvent.clientX,
      clientY: startEvent.clientY,
      target: startEvent.target,
      container: this.target,
      originalEvent: startEvent
    });

    this.trigger(this.target, dragStartEvent);

    this.dragging = !dragStartEvent.canceled();

    if (this.dragging) {
      document.addEventListener(
        "contextmenu",
        this[onContextMenuWhileDragging],
        true
      );
      document.addEventListener("mousemove", this[onMouseMove]);
    }
  }

  /**
   * Detect change in distance, starting drag when both
   * delay and distance requirements are met
   */
  private [onDistanceChange](event: CustomEvent<SensorEvent>) {
    const { pageX, pageY } = event;
    const { delay, distance } = this.options;
    const { startEvent } = this;

    Object.assign(this, { pageX, pageY });

    if (!this.currentContainer) {
      return;
    }

    const timeElapsed = Date.now() - this.onMouseDownAt;
    const distanceTravelled =
      euclideanDistance(startEvent.pageX, startEvent.pageY, pageX, pageY) || 0;

    if (timeElapsed >= delay && distanceTravelled >= distance) {
      window.clearTimeout(this.mouseDownTimeout);
      document.removeEventListener("mousemove", this[onDistanceChange]);
      this[startDrag]();
    }
  }

  /**
   * Mouse move handler
   */
  private [onMouseMove](event: MouseEvent) {
    if (!this.dragging) {
      return;
    }
    console.log("MOUSE MOVE");
    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.target,
      originalEvent: event
    });

    this.trigger(this.target, dragMoveEvent);
  }

  /**
   * Mouse up handler
   */
  private [onMouseUp](event: MouseEvent) {
    if (event.button !== 0) {
      return;
    }
    console.log("MOUSE UP");
    document.removeEventListener("mouseup", this[onMouseUp]);
    document.removeEventListener("dragstart", preventNativeDragStart);
    document.removeEventListener("mousemove", this[onDistanceChange]);

    if (!this.dragging) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragStopEvent = new DragStopSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.target,
      originalEvent: event
    });

    this.trigger(this.target, dragStopEvent);

    document.removeEventListener(
      "contextmenu",
      this[onContextMenuWhileDragging],
      true
    );
    document.removeEventListener("mousemove", this[onMouseMove]);

    this.dragging = false;
    this.startEvent = null;
  }

  /**
   * Context menu handler
   */
  private [onContextMenuWhileDragging](event: MouseEvent) {
    event.preventDefault();
  }
}

function preventNativeDragStart(event: DragEvent) {
  event.preventDefault();
}
