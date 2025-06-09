// rollup.config.cjs
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const babel = require('@rollup/plugin-babel');

/** @type {import('rollup').RollupOptions} */
module.exports = {
  input: 'src/web.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      // ✅ Phone input için ek ayarlar
      skip: ['fs', 'path', 'os'], // Node.js modüllerini skip et
    }),
    commonjs({
      include: /node_modules/,
      // ✅ Phone input için ek ayarlar
      transformMixedEsModules: true,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: [
        ['babel-preset-solid', { generate: 'dom', hydratable: false }]
      ]
    }),
    typescript({
      tsconfig: './tsconfig.json',
      // ✅ Phone validation için ek type check ayarları
      skipLibCheck: true,
    }),
    postcss({
      extensions: ['.css'],
      // ✅ Phone input CSS'leri için
      extract: false,
      inject: true,
      minimize: true,
    }),
    json(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    })
  ],
  external: ['object-assign'],
  // ✅ Phone input kütüphaneleri için warning'leri suppress et
  onwarn(warning, warn) {
    // Circular dependency warnings'i ignore et
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // External dependency warnings'i ignore et  
    if (warning.code === 'UNRESOLVED_IMPORT') return;
    warn(warning);
  },
};