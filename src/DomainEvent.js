
class DomainEvent {

  static deserialize(aSerializedEvent) {
    let deserializedEventObject = JSON.parse(aSerializedEvent);

    return new DomainEvent(
      deserializedEventObject.name,
      deserializedEventObject.payload,
      deserializedEventObject.createdAt
    );
  }

  constructor(
    aEventName,
    aEventPayload,
    aEventCreationTimestamp = null
  ) {

    let that = this;
    let eventName = validateEventName(aEventName);
    let eventPayload = parseEventPayload(aEventPayload);
    let creationTimestamp = calculateCurrentTimestamp(aEventCreationTimestamp);

    function name() {
      return eventName;
    }

    function payload() {
      return cloneValue(eventPayload);
    }

    function createdAt() {
      return creationTimestamp;
    }

    function serialize() {
      return JSON.stringify({
        name: that.name(),
        payload: that.payload(),
        createdAt: that.createdAt()
      });
    }

    return Object.assign(this, {
      name,
      payload,
      createdAt,
      serialize
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

function calculateCurrentTimestamp(aTimestamp) {
  if (aTimestamp) {
    return aTimestamp;
  }

  return (new Date()).getTime();
}

function cloneValue(aValue) {
  return JSON.parse(JSON.stringify(aValue));
}

module.exports = DomainEvent;
