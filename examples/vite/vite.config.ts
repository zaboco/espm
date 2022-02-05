import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2?bundle',
      'react-dom': 'https://esm.sh/react-dom@17.0.2?bundle',
    },
  },
});
