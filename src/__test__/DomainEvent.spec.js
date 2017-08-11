
/* globals jest */

const DomainEvent = require('../DomainEvent');

describe('DomainEvent', () => {
  let nativeGetTime = Date.prototype.getTime;

  beforeEach(() => {
    Date.prototype.getTime = jest.fn();
  });

  afterEach(() => {
    Date.prototype.getTime = nativeGetTime;
  });

  describe('when initialized', () => {
    it('should throw if not provided a event name', () => {
      expect(() => {
        new DomainEvent();
      })
        .toThrow(TypeError);
    });

    it('should assign the provided event name to the error', () => {
      let event = new DomainEvent('NAME');
      expect(event.name()).toBe('NAME');
    });

    it('should have a creation timestamp', () => {
      Date.prototype.getTime
        .mockReturnValue(100);

      let event = new DomainEvent('NAME');

      expect(event.createdAt()).toBe(100);
    });

    describe('and a payload is provided', () => {
      it('should remember the payload', () => {
        let event = new DomainEvent('NAME', { a: 'a' });
        expect(event.payload()).toEqual({ a: 'a' });
      });
    });

    describe('and a payload is NOT provided', () => {
      it('should have an empty payload', () => {
        let event = new DomainEvent('NAME');
        expect(event.payload()).toBeNull();
      });
    });
  });

  describe('when handled', () => {
    it('should be immutable', () => {
      let event = new DomainEvent('NAME', { a: 'a' });
      let payload = event.payload();

      payload.a = 13;
      payload.b = 56;

      expect(event.payload()).toEqual({ a: 'a' });
    });
  });

  describe('when requested to serialize itself', () => {
    beforeEach(() => {
      Date.prototype.getTime
        .mockReturnValue(100);
    });

    it('should return a serialized version of the event with all the event data', () => {
      let event = new DomainEvent('NAME', { a: 'a' });
      let serializedEvent = event.serialize();

      expect(serializedEvent)
        .toEqual(JSON.stringify({
          name: 'NAME',
          payload: { a: 'a' },
          createdAt: 100
        }));
    });
  });

  describe('when required to deserialize a event JSON', () => {
    it('should restore the original event', () => {
      Date.prototype.getTime
        .mockReturnValue(100);

      let event = new DomainEvent('NAME', { a: 'a' });
      let serializedEvent = event.serialize();

      Date.prototype.getTime
        .mockReturnValue(200);

      let deserializedEvent = DomainEvent.deserialize(serializedEvent);

      expect(event.name()).toEqual(deserializedEvent.name());
      expect(event.payload()).toEqual(deserializedEvent.payload());
      expect(event.createdAt()).toEqual(deserializedEvent.createdAt());
    });
  });
});
