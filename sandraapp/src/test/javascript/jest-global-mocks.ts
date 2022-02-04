Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});
