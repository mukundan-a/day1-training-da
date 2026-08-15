// Build the Day 1 Craft app into a single committed bundle (app.js + app.css).
// Netlify serves the static output at /variant-2/; no build runs on deploy.
import * as esbuild from 'esbuild';
const prod = !process.argv.includes('--dev');
await esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'iife',
  target: ['es2019'],
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  minify: prod,
  sourcemap: false,
  outfile: 'app.js',
  logLevel: 'info',
});
console.log('built app.js');
