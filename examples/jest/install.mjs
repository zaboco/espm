import { cache, configure } from 'deno-cache';

configure({
  directory: '.cache',
});

let file = await cache('https://esm.sh/react');

console.log('cached', file);
