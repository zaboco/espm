import { cleanup } from '@testing-library/react';

runTests();

async function runTests() {
  console.clear();
  window.UVU_QUEUE = [[null]];
  window.UVU_INDEX = 0;
  cleanup();

  await import('./add.test');
  await import('./multiply.test');
  await import('./App.test');
}

if (import.meta.hot) {
  import.meta.hot.accept();
}
