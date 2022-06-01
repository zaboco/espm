esbuild \
  --outfile=cli.cjs \
  --platform=node \
  --bundle \
  --format=cjs \
  ../packages/cli/index.ts

cp ../README.md .
