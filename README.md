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
let globalEventsHandler = function(aDispatchedEvent) {
  console.log(`[[ANY]] ${aDispatchedEvent.name()}`);
}

// A event handler could be a object with a "handle" method
let singleEventHandler = {
  handle: (aDispatchedEvent) => {
    console.log(`[[user.created]] user id: ${aDispatchedEvent.payload().userId}`);
  }
};

eventBus.register(globalEventsHandler); // Handle every event
eventBus.register(singleEventHandler, 'user.created'); // Handle only 'user.created' events

eventBus.dispatch(aEvent);
eventBus.dispatch(anotherEvent);

console.log('Other syncrounous code...');

// --> "Other sincrounous code..."
// --> "[[ANY]] user.created"
// --> "[[user.created]] user id: 12"
// --> "[[ANY]] action.happened"
```
