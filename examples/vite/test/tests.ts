runTests();

async function runTests() {
  console.clear();
  await import('./App.test');
}

if (import.meta.hot) {
  import.meta.hot.accept();
}
