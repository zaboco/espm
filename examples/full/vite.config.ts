import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic' })],
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2?bundle',
      'react-dom': 'https://esm.sh/react-dom@17.0.2?bundle',
    },
  },
});
