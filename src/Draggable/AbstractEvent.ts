const canceled = Symbol("canceled");

/**
 * All events fired by draggable inherit this class. You can call `cancel()` to
 * cancel a specific event or you can check if an event has been canceled by
 * calling `canceled()`.
 * @abstract
 * @class AbstractEvent
 * @module AbstractEvent
 */
export default class AbstractEvent {
  protected data;
  /**
   * Event type
   */
  static type = "event";

  /**
   * Event cancelable
   */
  static cancelable = false;

  /**
   * AbstractEvent constructor.
   */
  constructor(data: object) {
    this[canceled] = false;
    this.data = data;
  }

  /**
   * Read-only type
   */
  get type() {
    return AbstractEvent.type;
  }

  /**
   * Read-only cancelable
   */
  get cancelable() {
    return AbstractEvent.cancelable;
  }

  /**
   * Cancels the event instance
   */
  cancel() {
    this[canceled] = true;
  }

  /**
   * Check if event has been canceled
   */
  canceled() {
    return Boolean(this[canceled]);
  }

  /**
   * Returns new event instance with existing event data.
   * This method allows for overriding of event data.
   */
  clone(data: object) {
    return new AbstractEvent({
      ...this.data,
      ...data
    });
  }
}
