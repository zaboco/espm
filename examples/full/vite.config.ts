import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic' })],
  define: {
    'process.env.FORCE_COLOR': 'true',
  },
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2',
      'react-dom': 'https://esm.sh/react-dom@17.0.2',
      uvu: 'https://esm.sh/uvu@0.5.3',
      '@testing-library/react':
        'https://cdn.esm.sh/v78/@testing-library/react@13.2.0/es2022/react.js',
    },
  },
});
