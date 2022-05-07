import { useState } from 'react';

export function App() {
  const [value, setValue] = useState(0);

  return (
    <div>
      <h1>React App {value}</h1>
      <button onClick={() => setValue((p) => p + 1)}>+</button>
    </div>
  );
}
