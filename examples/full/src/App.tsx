import { useState } from 'react';

export function App() {
  const [value, setValue] = useState(0);

  return (
    <div>
      <h1>Current value {value}</h1>
      <button onClick={() => setValue((p) => p + 1)}>Increment</button>
    </div>
  );
}
