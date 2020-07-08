import AbstractEvent from "./AbstractEvent";

/**
 * Base sensor event
 */
export class SensorEvent extends AbstractEvent {
  /**
   * Original browser event that triggered a sensor
   */
  get originalEvent() {
    return this.data.originalEvent;
  }

  /**
   * Normalized clientX for both touch and mouse events
   */
  get clientX() {
    return this.data.clientX;
  }

  /**
   * Normalized clientY for both touch and mouse events
   */
  get clientY() {
    return this.data.clientY;
  }

  /**
   * Normalized target for both touch and mouse events
   * Returns the element that is behind cursor or touch pointer
   */
  get target() {
    return this.data.target;
  }

  /**
   * Container that initiated the sensor
   */
  get container() {
    return this.data.container;
  }
}

/**
 * Drag start sensor event
 */
export class DragStartSensorEvent extends SensorEvent {
  static type = "drag:start";
}

/**
 * Drag move sensor event
 */
export class DragMoveSensorEvent extends SensorEvent {
  static type = "drag:move";
}

/**
 * Drag stop sensor event
 */
export class DragStopSensorEvent extends SensorEvent {
  static type = "drag:stop";
}
