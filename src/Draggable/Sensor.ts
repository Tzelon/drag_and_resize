import { SensorEvent } from "./SensorEvent";

/**
 * Base sensor class. Extend from this class to create a new or custom sensor
 */
export default class Sensor<T> {
  /**
   * target
   */
  protected target: HTMLElement;
  protected options;
  /**
   * The event of the initial sensor down
   */
  protected startEvent: T;
  /**
   * Current drag state
   */
  protected dragging: boolean;
  protected lastEvent;

  constructor(target: HTMLElement, options = {}) {
    this.target = target;
    this.options = { ...options };
    this.dragging = false;
    this.startEvent = null;
  }

  /**
   * Attaches sensors event listeners to the DOM
   * @return {Sensor}
   */
  attach() {
    return this;
  }

  /**
   * Detaches sensors event listeners to the DOM
   * @return {Sensor}
   */
  detach() {
    return this;
  }

  /**
   * Triggers event on target element
   */
  trigger(element: HTMLElement, sensorEvent: SensorEvent) {
    const event = new CustomEvent(sensorEvent.type, { detail: sensorEvent });
    element.dispatchEvent(event);
    this.lastEvent = sensorEvent;

    return sensorEvent;
  }
}
