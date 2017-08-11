# Domain Events [![npm version](https://img.shields.io/npm/v/domain-events.svg)](https://www.npmjs.com/package/react) [![Build Status](https://travis-ci.org/danielemariani/domain-events.svg?branch=master)](https://travis-ci.org/danielemariani/domain-events) [![Coverage Status](https://coveralls.io/repos/github/danielemariani/domain-events/badge.svg?branch=master)](https://coveralls.io/github/danielemariani/domain-events?branch=master)

[domain-events](https://github.com/danielemariani/domain-events) is a js library to create and asyncronously dispatch Domain Events.

## Guide

### Installation

```shell
$ npm install domain-events
```

### Usage

```js
const domainEvents = require("domain-events");

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

### EventBus

A EventBus instance lets you register handlers for a Event and dispatch Events to the handlers.
Create a new EventBus with its constructor:

```js
let eventBus = new EventBus();
```

#### .register(aEventHandler, /*\*optional\**/ aEventName)

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

### .dispatch(aDomainEvent)
Pass a DomainEvent to the dispatch method to execute the registered handler asyncronously.

### aDomainEvent
A DomainEvent instance.

### Events Immutability
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
