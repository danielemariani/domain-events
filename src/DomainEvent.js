
class DomainEvent {

  constructor(aEventName, aEventPayload) {
    this.eventName = validateEventName(aEventName);
    this.eventPayload = parseEventPayload(aEventPayload);
    this.creationTimestamp = calculateCurrentTimestamp();
  }

  name() {
    return this.eventName;
  }

  payload() {
    return this.eventPayload;
  }

  createdAt() {
    return this.creationTimestamp;
  }

  serialize() {
    return JSON.stringify({
      name: this.name(),
      payload: this.payload(),
      createdAt: this.createdAt()
    });
  }
}

function validateEventName(aEventName) {
  if (typeof aEventName !== 'string') {
    throw new TypeError(`Invalid event name provided to DomainEvent constructor: ${aEventName}`);
  }

  return aEventName;
}

function parseEventPayload(aEventPayload) {
  return aEventPayload || null;
}

function calculateCurrentTimestamp() {
  return (new Date()).getTime();
}

module.exports = DomainEvent;
