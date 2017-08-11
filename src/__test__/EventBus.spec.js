
/* globals jest */

const EventBus = require('../EventBus');
const DomainEvent = require('../DomainEvent');

describe('EventBus', () => {
  let eventBus;
  let aObjectHandler;
  let aFunctionHandler;

  beforeEach(() => {
    aObjectHandler = { handle: jest.fn() };
    aFunctionHandler = jest.fn();

    eventBus = new EventBus();
  });

  describe('when requested to register a handler for a Event', () => {
    describe('should accept as event name', () => {
      it('a "string" value', () => {
        expect(() => {
          eventBus.register(
            aFunctionHandler,
            'EVENT'
          );
        })
          .not.toThrow();
      });

      it('a "undefined" value to attach the handler to any event', () => {
        expect(() => {
          eventBus.register(
            aFunctionHandler
          );
        })
          .not.toThrow();
      });
    });

    describe('should accept as handler', () => {
      it('an object with a handle method', () => {
        expect(() => {
          eventBus.register(
            aObjectHandler,
            'EVENT'
          );
        })
          .not.toThrow();
      });

      it('a plain function', () => {
        expect(() => {
          eventBus.register(
            aFunctionHandler,
            'EVENT'
          );
        })
          .not.toThrow();
      });
    });

    describe('should throw a TypeError', () => {
      it('if the event name is not omitted and is not a plain string', () => {
        expect(() => {
          eventBus.register(() => {}, null);
        })
          .toThrow(TypeError);
      });

      it('if the handler is not an object with a "handle" method', () => {
        expect(() => {
          eventBus.register({}, 'EVENT');
        })
          .toThrow(TypeError);
      });

      it('if the handler is not a function', () => {
        expect(() => {
          eventBus.register(null, 'EVENT');
        })
          .toThrow(TypeError);
      
      });
    });
  });

  describe('when requested to dispatch an event', () => {
    let aEvent;
    let aEventName;
    let aEventHandler;

    beforeEach(() => {
      aEventName = 'EVENT';
      aEvent = new DomainEvent(aEventName);

      aEventHandler = {
        handle: jest.fn()
      };

      eventBus.register(
        aEventHandler,
        aEventName
      );
    });

    it('should throw if the event is not a valid DomainEvent instance', () => {
      let aNotValidEvent = { name: jest.fn() };

      expect(() => {
        eventBus.dispatch(aNotValidEvent);
      })
        .toThrow(TypeError);
    });

    describe('and a handler is registered for the event', () => {
      describe('and the handler is an object with a "handle" method', () => {
        it('should call the handler "handle" method with the event', () => {
          return eventBus.dispatch(aEvent)
            .then(onDispatchCompleted)
            .catch(e => { throw e; });

          function onDispatchCompleted() {
            expect(aEventHandler.handle)
              .toHaveBeenCalledWith(aEvent);
          }
        });
      });

      describe('and the handler is a function', () => {
        it('should call the function with the event', () => {
          eventBus.register(aFunctionHandler, 'EVENT');

          return eventBus.dispatch(aEvent)
            .then(onDispatchCompleted)
            .catch(e => { throw e; });

          function onDispatchCompleted() {
            expect(aFunctionHandler)
              .toHaveBeenCalledWith(aEvent);
          }
        });
      });

      it('should dispatch the event to the handler asyncronously', () => {
        let dispatchOperation = eventBus
          .dispatch(aEvent);

        expect(aEventHandler.handle)
          .not.toHaveBeenCalled();

        return dispatchOperation
          .then(onDispatchCompleted)
          .catch(e => { throw e; });

        function onDispatchCompleted() {
          expect(aEventHandler.handle)
            .toHaveBeenCalledWith(aEvent);
        }
      });
    });

    describe('and multiple handlers are registered for the event', () => {
      let anotherEventHandler;

      beforeEach(() => {
        anotherEventHandler = aFunctionHandler;

        eventBus.register(
          anotherEventHandler,
          aEventName
        );
      });

      it('should dispatch the event to all the handlers asyncronously', () => {
        let dispatchOperation = eventBus
          .dispatch(aEvent);

        expect(aEventHandler.handle)
          .not.toHaveBeenCalled();

        expect(anotherEventHandler)
          .not.toHaveBeenCalled();

        return dispatchOperation
          .then(onDispatchCompleted)
          .catch(e => { throw e; });

        function onDispatchCompleted() {
          expect(aEventHandler.handle)
            .toHaveBeenCalledWith(aEvent);

          expect(anotherEventHandler)
            .toHaveBeenCalledWith(aEvent);
        }
      });
    });

    describe('and no handler is registered for the event', () => {
      let anotherEvent;

      beforeEach(() => {
        anotherEvent = new DomainEvent('ANOTHER_EVENT');
      });

      it('should not dispatch the event to any handler', () => {
        return eventBus.dispatch(anotherEvent)
          .then(onDispatchCompleted)
          .catch(e => { throw e; });

        function onDispatchCompleted() {
          expect(aEventHandler.handle)
            .not.toHaveBeenCalled();
        }
      });
    });

    describe('and some handler is registered to ANY event', () => {
      let anotherEvent;
      let aHandlerRegisteredToAnyEvent;

      beforeEach(() => {
        anotherEvent = new DomainEvent('ANOTHER_EVENT');
        aHandlerRegisteredToAnyEvent = jest.fn();

        eventBus.register(aHandlerRegisteredToAnyEvent);
      });

      it('should dispatch any event to the handler', () => {
        return eventBus.dispatch(aEvent)
          .then(onDispatchCompleted)
          .catch(e => { throw e; });

        function onDispatchCompleted() {
          expect(aHandlerRegisteredToAnyEvent)
            .toHaveBeenCalledWith(aEvent);
        }
      });
    });
  });
});
