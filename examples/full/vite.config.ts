import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';

const testConfig = defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic', fastRefresh: false })],
  root: 'test',
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2?dev',
      'react-dom': 'https://esm.sh/react-dom@17.0.2?dev',
      'uvu/assert': 'https://esm.sh/uvu@0.5.3/assert?dev',
      uvu: 'https://esm.sh/uvu@0.5.3?dev',
      '@testing-library/react': 'https://esm.sh/@testing-library/react?dev',
    },
  },
});

const devConfig = defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic' })],
  root: 'src',
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2?dev',
      'react-dom': 'https://esm.sh/react-dom@17.0.2?dev',
    },
  },
});

const prodConfig = defineConfig({
  root: 'src',
  resolve: {
    alias: {
      react: 'https://esm.sh/react@17.0.2',
      'react-dom': 'https://esm.sh/react-dom@17.0.2',
    },
  },
});

function getConfig(env: string | undefined) {
  if (env === 'production') {
    return prodConfig;
  }
  if (env === 'testing') {
    return testConfig;
  }
  return devConfig;
}

export default getConfig(process.env.NODE_ENV);
