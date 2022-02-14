import esbuild from 'esbuild';

function externalAliasPlugin(mapping) {
  const importNames = Object.keys(mapping);
  const importFilterRegex = new RegExp(`^(${importNames.join('|')})$`);
  return {
    name: 'external-alias',
    setup(build) {
      build.onResolve({ filter: importFilterRegex }, ({ path }) => {
        return { path: mapping[path], external: true };
      });
    },
  };
}

esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  format: 'esm',
  outdir: 'out',
  plugins: [
    externalAliasPlugin({
      react: 'https://esm.sh/react@17.0.2',
      'react-dom': 'https://esm.sh/react-dom@17.0.2',
    }),
  ],
});
