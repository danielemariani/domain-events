# Domain Events [![npm version](https://img.shields.io/npm/v/domain-events.svg)](https://www.npmjs.com/package/react) [![Build Status](https://travis-ci.org/danielemariani/domain-events.svg?branch=master)](https://travis-ci.org/danielemariani/domain-events) [![Coverage Status](https://coveralls.io/repos/github/danielemariani/domain-events/badge.svg?branch=master)](https://coveralls.io/github/danielemariani/domain-events?branch=master)

[domain-events](https://github.com/danielemariani/domain-events) is a js library to create and asyncronously dispatch Domain Events.

## Guide

### Installation

```shell
$ npm install domain-events
```

### Usage

```js
const domainEvents = require('domain-events');

const EventBus = domainEvents.EventBus;
const DomainEvent = domainEvents.DomainEvent;

let eventBus = new EventBus();

let aEvent = new DomainEvent('user.created', { userId: '12' });
let anotherEvent = new DomainEvent('action.happened', { actionId: 'ACTION' });

// A event handler could be a simple function
let aFunctionHandler = function(aDispatchedEvent) {
  console.log(`[[ANY]] ${aDispatchedEvent.name()}`);
}

// A event handler could be a object with a "handle" method
let aObjectHandler = {
  handle: (aDispatchedEvent) => {
    console.log(`[[user.created]] user id: ${aDispatchedEvent.payload().userId}`);
  }
};

eventBus.register(aGlobalEventsHandler); // Handle every event
eventBus.register(aSingleEventHandler, 'user.created'); // Handle only 'user.created' events

eventBus.dispatch(aEvent);
eventBus.dispatch(anotherEvent);

console.log('Other syncrounous code...');

// --> "Other sincrounous code..."
// --> "[[ANY]] user.created"
// --> "[[user.created]] user id: 12"
// --> "[[ANY]] action.happened"
```

## Documentation

### DomainEvent
Create domain events with the DomainEvent class.

#### constructor(aEventName, /*\*optional\**/ aEventPayload, /*\*optional\**/ aEventCreationTimestamp)
```js
let event = new DomainEvent('event.name');
let event = new DomainEvent('event.name', { a: 12 });
let event = new DomainEvent('event.name', { a: 12 }, 1502530224425);
```

##### aEventName
A String which will be the name of the event (use the same string to register handlers for that event).
Usually, because a domain event represents something that happened in the past, is preferrable to name events with an action in the past tense. Because the event name is just a plain string any naming convention flavour is possible, according to your coding style.

Examples:
- 'user.created'
- 'purchaseCompleted'
- 'ACTION_HAPPENED'

##### aEventPayload (optional)
Any serializable value which will be provided to the handlers as the payload of the event. Any value that can be serialized as a JSON string could be provided as the paylod and will have an expected behaviour.

```js
// Valid values examples:
'A string'
12
{ a: 23 }
null
```

##### aEventCreationTimestamp (optional)
Newly created domain events are automatically assigned the creation timestamp by the constructor, so it is usually not necessary to provide a specific timestamp. Anyway it is possible to provide a different event creation timestamp to adjust the default behaviour to any particular needs.

#### .name()
Returns the event name (a String).

#### .payload()
Returns the (immutable) event payload, or *null* if the event has no payload.

#### .createdAt()
Returns the event creation timestamp.

#### .serialize()
Returns a serialized JSON string representing the event. This could be provided to the *static* **DomainEvent.deserialize()** method to restore the original event instance.

#### *static* .deserialize(aSerializedEvent)
Returns the original instance of the previously serialized event.

##### aSerializedEvent
A JSON string representing the event, previously created with the **DomainEvent.serialize()** method.

```js
let event = new DomainEvent('event.name');
let serializedEvent = event.serialize(); // --> event JSON
let deserializedEvent = DomainEvent.deserialize(serializedEvent) // --> event
```

### EventBus
A EventBus instance lets you register handlers for an event and dispatch events to the registered handlers.
Create a new EventBus with its constructor:

```js
let eventBus = new EventBus();
```

#### .register(aEventHandler, /*\*optional\**/ aEventName)
Pass a event handler to the register method to register actions to be executed any time a Event is dispatched.

##### aEventHandler
The registered handler could be either:
- a plain function accepting the dispatched event as the only argument
- a object instance with a handle method, which accepts the dispatched event as the only argument

```js
let handler = (aDispatchedEvent) => { ... };
let anotherHander = { handle: (aDispatchedEvent) => { ... } };
```

The handler could be registered to a specific event (providing the event name) or to any event (ommitting the *aEventName* parameter):

```js
eventBus.register(aEventHandler); // Every dispatched event will be dispatched to the handler
eventBus.register(aEventHandler, 'event.name'); // Only events with name 'event.name' will be dispatched to the handler
```

##### aEventName (optional)
A string which is the name of the handled event. Omit the parameter to register the handler to any event (ex. for logging or persisting the events in a database).

#### .dispatch(aDomainEvent)
Pass a DomainEvent to the dispatch method to execute the registered handler asyncronously.

##### aDomainEvent
A DomainEvent instance.

#### static .getInstance()
Returns a Singleton EventBus instance. The first call actually creates a new EventBus instance while any further call will return the same object. Useful if you don't want to (or can't) inject the eventBus instance wherever it is needed.

```js
// File1.js
let eventBus = EventBus.getInstance(); // --> new EventBus();
eventBus.register(aHandler);

// File2.js
let eventBus = EventBus.getInstance(); // --> the same event bus instance created in File1.js;
eventBus.dispatch(aEvent); // The handler registered in File1.js will be called
```

## Events Immutability
Every handler will be invoked asyncronously and will be provided the original DomainEvent object, which is immutable.
For example, mutating the payload in a Handler will not affect the original event and those modifications won't be provided to the next registered Handler.

```js
let event = new DomainEvent('name', { a: 12 });

let aHandler = function(aDispatchedEvent) {
  let eventPayload = aDispatchedEvent.payload();
  console.log(eventPayload)    
  
  eventPayload.a = 23;
  console.log(eventPayload)    
};

let anotherHandler = function(aDispatchedEvent) {
  console.log(aDispatchedEvent.payload());
}

eventBus.register(aHandler, 'name');
eventBus.register(anotherHandler, 'name');

eventBus.dispatch(event);

// First handler
// --> { a: 12 }
// --> { a: 23 }

// Second handler
// --> { a: 12 }
```
