
const DomainEvent = require('./DomainEvent');

class EventBus {

  constructor() {
    this.registeredEvents = {};
    this.handlersForAnyEvent = [];
  }

  register(aEventHandler, aEventName) {
    validateEventName(aEventName);
    validateHandler(aEventHandler);

    registerHandlerForEvent
      .call(this, aEventHandler, aEventName);
  }

  dispatch(aEvent) {
    validateEvent(aEvent);

    return Promise.all(
      dispatchEventToRegisteredHandlers
        .call(this, aEvent)
    );
  }
}

function validateEvent(aEvent) {
  if (!(aEvent instanceof DomainEvent)) {
    throw new TypeError('EventBus can dispatch only instances of DomainEvent');
  }
}

function validateEventName(aEventName) {
  if (
    typeof aEventName !== 'string' &&
    typeof aEventName !== 'undefined'
  ) {
    throw new TypeError(`EventBus "register" method was called with an invalid event name: ${aEventName}`);
  }
}

function validateHandler(aEventHandler) {
  if (
    !isAnObjectHandler(aEventHandler) &&
    !isAFunctionHandler(aEventHandler)
  ) {
    throw new TypeError('EventBus "register" method was called with an invalid event handler');
  }
}

function isAnObjectHandler(aEventHandler) {
  return (
    typeof aEventHandler === 'object' &&
    typeof aEventHandler.handle === 'function'
  );
}

function isAFunctionHandler(aEventHandler) {
  return typeof aEventHandler === 'function';
}

function registerHandlerForEvent(aEventHandler, aEventName) {
  if (aEventName) {
    registerHandlerForSpecificEvent
      .call(this, aEventHandler, aEventName);
  } else {
    registerHandlerForAnyEvent
      .call(this, aEventHandler);
  }
}

function registerHandlerForSpecificEvent(aEventHandler, aEventName) {
  listHandlersForEvent
    .call(this, aEventName)
    .push(aEventHandler);
}

function registerHandlerForAnyEvent(aEventHandler) {
  this.handlersForAnyEvent
    .push(aEventHandler);
}

function listHandlersForEvent(aEventName) {
  if (!this.registeredEvents[aEventName]) {
    this.registeredEvents[aEventName] = [];
  }

  return this.registeredEvents[aEventName];
}

function dispatchEventToRegisteredHandlers(aEvent) {
  return listAllHandlersForEvent
    .call(this, aEvent.name())
    .map(mapHandlerToExecution);

  function mapHandlerToExecution(aEventHandler) {
    return deferredExecutionOf(
      dispatchEventToHandler,
      this,
      [ aEvent, aEventHandler ]
    );
  }
}

function listAllHandlersForEvent(aEventName) {
  return this.handlersForAnyEvent
    .concat(listHandlersForEvent.call(this, aEventName));
}

function dispatchEventToHandler(aEvent, aEventHandler) {
  if (isAnObjectHandler(aEventHandler)) {
    aEventHandler.handle(aEvent);
  }

  if (isAFunctionHandler(aEventHandler)) {
    aEventHandler(aEvent);
  }
}

function deferredExecutionOf(aFunction, aContext, aListOfArguments) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(executeDeferred(
        aFunction,
        aContext,
        aListOfArguments
      ));
    }, 0);
  });
}

function executeDeferred(aFunction, aContext, aListOfArguments) {
  return aFunction.apply(
    aContext,
    aListOfArguments
  );
}

module.exports = EventBus;

