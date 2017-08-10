
/* globals jest */

const EventBus = require('../EventBus');
const DomainEvent = require('../DomainEvent');

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
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
        aEventName,
        aEventHandler
      );
    });

    describe('and a handler is registered for the event', () => {
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
        anotherEventHandler = {
          handle: jest.fn()
        };

        eventBus.register(
          aEventName,
          anotherEventHandler
        );
      });

      it('should dispatch the event to all the handlers asyncronously', () => {
        let dispatchOperation = eventBus
          .dispatch(aEvent);

        expect(aEventHandler.handle)
          .not.toHaveBeenCalled();

        expect(anotherEventHandler.handle)
          .not.toHaveBeenCalled();

        return dispatchOperation
          .then(onDispatchCompleted)
          .catch(e => { throw e; });

        function onDispatchCompleted() {
          expect(aEventHandler.handle)
            .toHaveBeenCalledWith(aEvent);

          expect(anotherEventHandler.handle)
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
  });
});
