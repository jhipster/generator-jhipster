import { inject, TestBed } from '@angular/core/testing';

import { EventManager, EventWithContent } from './event-manager.service';

describe('Event Manager tests', () => {
  describe('EventWithContent', () => {
    it('should create correctly EventWithContent', () => {
      // WHEN
      const eventWithContent = new EventWithContent('name', 'content');

      // THEN
      expect(eventWithContent).toEqual({ name: 'name', content: 'content' });
    });
  });

  describe('EventManager', () => {
    let recievedEvent: EventWithContent<unknown> | string | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [EventManager],
      });
      recievedEvent = null;
    });

    it('should not fail when nosubscriber and broadcasting', inject([EventManager], (eventManager: EventManager) => {
      expect(eventManager.observer).toBeUndefined();
      eventManager.broadcast({ name: 'modifier', content: 'modified something' });
    }));

    it('should create an observable and callback when broadcasted EventWithContent', inject(
      [EventManager],
      (eventManager: EventManager) => {
        // GIVEN
        eventManager.subscribe('modifier', (event: EventWithContent<unknown> | string) => (recievedEvent = event));

        // WHEN
        eventManager.broadcast({ name: 'unrelatedModifier', content: 'unreleated modification' });
        // THEN
        expect(recievedEvent).toBeNull();

        // WHEN
        eventManager.broadcast({ name: 'modifier', content: 'modified something' });
        // THEN
        expect(recievedEvent).toEqual({ name: 'modifier', content: 'modified something' });
      }
    ));

    it('should create an observable and callback when broadcasted string', inject([EventManager], (eventManager: EventManager) => {
      // GIVEN
      eventManager.subscribe('modifier', (event: EventWithContent<unknown> | string) => (recievedEvent = event));

      // WHEN
      eventManager.broadcast('unrelatedModifier');
      // THEN
      expect(recievedEvent).toBeNull();

      // WHEN
      eventManager.broadcast('modifier');
      // THEN
      expect(recievedEvent).toEqual('modifier');
    }));

    it('should subscribe to multiple events', inject([EventManager], (eventManager: EventManager) => {
      // GIVEN
      eventManager.subscribe(['modifier', 'modifier2'], (event: EventWithContent<unknown> | string) => (recievedEvent = event));

      // WHEN
      eventManager.broadcast('unrelatedModifier');
      // THEN
      expect(recievedEvent).toBeNull();

      // WHEN
      eventManager.broadcast({ name: 'modifier', content: 'modified something' });
      // THEN
      expect(recievedEvent).toEqual({ name: 'modifier', content: 'modified something' });

      // WHEN
      eventManager.broadcast('modifier2');
      // THEN
      expect(recievedEvent).toEqual('modifier2');
    }));
  });
});
