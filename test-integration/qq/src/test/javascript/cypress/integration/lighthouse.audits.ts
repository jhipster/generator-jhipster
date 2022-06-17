describe('Lighthouse Audits', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('homepage', () => {
    const customThresholds = {
      performance: 80,
      accessibility: 90,
      seo: 90,
      'best-practices': 90,
      // If you have enabled PWA you should set this threshold to 100
      pwa: 0,
    };

    const desktopConfig = {
      extends: 'lighthouse:default',
      formFactor: 'desktop',
      // Change the CPU slowdown multiplier to emulate different kind of devices
      // See https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md#cpu-throttling for details
      throttling: {
        cpuSlowdownMultiplier: 1,
      },
      screenEmulation: { disabled: true },
    };
    cy.lighthouse(customThresholds, desktopConfig);
  });
});
