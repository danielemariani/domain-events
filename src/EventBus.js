
class EventBus {

  constructor() {
    this.registeredEvents = {};
  }

  register(aEventName, aEventHandler) {
    registerHandlerForEvent
      .call(this, aEventHandler, aEventName);
  }

  dispatch(aEvent) {
    return Promise.all(
      dispatchEventToRegisteredHandlers
        .call(this, aEvent)
    );
  }
}

function registerHandlerForEvent(aEventHandler, aEventName) {
  listHandlersForEvent
    .call(this, aEventName)
    .push(aEventHandler);
}

function dispatchEventToRegisteredHandlers(aEvent) {
  return listHandlersForEvent
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

function listHandlersForEvent(aEventName) {
  if (!this.registeredEvents[aEventName]) {
    this.registeredEvents[aEventName] = [];
  }

  return this.registeredEvents[aEventName];
}

function dispatchEventToHandler(aEvent, aEventHandler) {
  aEventHandler.handle(aEvent);
}

function deferredExecutionOf(aFunction, aContext, aListOfArguments) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(deferExecutionOf(
        aFunction,
        aContext,
        aListOfArguments
      ));
    }, 0);
  });
}

function deferExecutionOf(aFunction, aContext, aListOfArguments) {
  return aFunction.apply(
    aContext,
    aListOfArguments
  );
}

module.exports = EventBus;

