import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const deps = {
  react: `react@17.0.2`,
  reactDom: `react-dom@17.0.2`,
  uvu: `uvu@0.5.3`,
  rtl: `@testing-library/react@13.2.0`,
};

const testConfig = defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic', fastRefresh: false })],
  root: 'test',
  resolve: {
    alias: {
      react: `https://esm.sh/${deps.react}?dev`,
      'react-dom': `https://esm.sh/${deps.reactDom}?dev`,
      'uvu/assert': `https://esm.sh/${deps.uvu}/assert?dev`,
      uvu: `https://esm.sh/${deps.uvu}?dev`,
      '@testing-library/react': `https://esm.sh/${deps.rtl}?deps=${deps.react},${deps.reactDom}&dev`,
    },
  },
});

const devConfig = defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic' })],
  root: 'src',
  resolve: {
    alias: {
      react: `https://esm.sh/${deps.react}?dev`,
      'react-dom': `https://esm.sh/${deps.reactDom}?dev`,
    },
  },
});

const prodConfig = defineConfig({
  root: 'src',
  resolve: {
    alias: {
      react: `https://esm.sh/${deps.react}`,
      'react-dom': `https://esm.sh/${deps.reactDom}`,
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
