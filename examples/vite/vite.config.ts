import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const deps = {
  react: `react@17.0.2`,
  reactDom: `react-dom@17.0.2`,
  uvu: `uvu@0.5.3`,
  rtl: `@testing-library/react@12.1.5`,
  chai: `chai@4.3.6`,
};

const testConfig = defineConfig({
  plugins: [reactPlugin({ jsxRuntime: 'classic', fastRefresh: false })],
  resolve: {
    alias: {
      react: `https://esm.sh/${deps.react}?dev`,
      'react-dom': `https://esm.sh/${deps.reactDom}?dev`,
      chai: `https://esm.sh/${deps.chai}?dev`,
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
  plugins: [reactPlugin()],
  build: { outDir: '../dist', minify: false, polyfillModulePreload: false },
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
