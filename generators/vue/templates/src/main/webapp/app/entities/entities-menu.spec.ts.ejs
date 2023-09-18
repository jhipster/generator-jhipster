import { vitest } from 'vitest';
import { ref } from 'vue';
import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import EntitiesMenu from './entities-menu.vue';

type EntitiesMenuComponentType = InstanceType<typeof EntitiesMenu>;

const currentLanguage = 'en';
vitest.mock('../../i18n/en/en.js', () => ({ default: {} }));

describe('EntitiesMenu', () => {
  let translationService;

  beforeEach(() => {
    translationService = { loadTranslations: vitest.fn() };
  });

  describe('using microfrontendI18n', () => {
    beforeEach(async () => {
      shallowMount(EntitiesMenu, {
        global: {
          stubs: {
            'b-dropdown-item': true,
            'font-awesome-icon': true,
          },
          provide: {
            translationService,
            microfrontendI18n: true,
            currentLanguage: ref(currentLanguage),
          },
        },
      });
      await flushPromises();
    });

    it('should load translations', () => {
      expect(translationService.loadTranslations).toHaveBeenCalled();
    });
  });

  describe('not using microfrontendI18n', () => {
    beforeEach(async () => {
      shallowMount(EntitiesMenu, {
        global: {
          stubs: {
            'b-dropdown-item': true,
            'font-awesome-icon': true,
          },
          provide: {
            translationService,
            microfrontendI18n: false,
            currentLanguage: ref(currentLanguage),
          },
        },
      });
      await flushPromises();
    });

    it('should not load translations', () => {
      expect(translationService.loadTranslations).not.toHaveBeenCalled();
    });
  });
});
