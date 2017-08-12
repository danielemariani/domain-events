
const DomainEvent = require('./DomainEvent');

let singletonEventBusInstance = null;

class EventBus {

  static getInstance() {
    if (!singletonEventBusInstance) {
      singletonEventBusInstance = new EventBus();
    }

    return singletonEventBusInstance;
  }

  constructor() {
    this.eventsToHandlersMap = {};
    this.handlersForAnyEvent = [];
  }

  register(aEventHandler, aEventName) {
    validateEventName(aEventName);
    validateEventHandler(aEventHandler);

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

function validateEventName(aEventName) {
  if (
    typeof aEventName !== 'string' &&
    typeof aEventName !== 'undefined'
  ) {
    throw new TypeError(`EventBus "register" method was called with an invalid event name: ${aEventName}`);
  }
}

function validateEventHandler(aEventHandler) {
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

function validateEvent(aEvent) {
  if (!(aEvent instanceof DomainEvent)) {
    throw new TypeError('EventBus can dispatch only instances of DomainEvent');
  }
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
  listHandlersForSpecificEvent
    .call(this, aEventName)
    .push(aEventHandler);
}

function listHandlersForSpecificEvent(aEventName) {
  if (!this.eventsToHandlersMap[aEventName]) {
    this.eventsToHandlersMap[aEventName] = [];
  }

  return this.eventsToHandlersMap[aEventName];
}

function registerHandlerForAnyEvent(aEventHandler) {
  this.handlersForAnyEvent
    .push(aEventHandler);
}

function dispatchEventToRegisteredHandlers(aEvent) {
  return listAllHandlersForEvent
    .call(this, aEvent.name())
    .map(mapHandlerToItsDeferredExecution);

  function mapHandlerToItsDeferredExecution(aEventHandler) {
    return deferredExecutionOf(
      dispatchEventToHandler,
      this,
      [ aEvent, aEventHandler ]
    );
  }
}

function listAllHandlersForEvent(aEventName) {
  return this.handlersForAnyEvent
    .concat(
      listHandlersForSpecificEvent
        .call(this, aEventName)
    );
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

function dispatchEventToHandler(aEvent, aEventHandler) {
  if (isAnObjectHandler(aEventHandler)) {
    aEventHandler.handle(aEvent);
  }

  if (isAFunctionHandler(aEventHandler)) {
    aEventHandler(aEvent);
  }
}

module.exports = EventBus;

