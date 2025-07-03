// rollup.config.cjs
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const babel = require('@rollup/plugin-babel');
const url = require('@rollup/plugin-url');

/** @type {import('rollup').RollupOptions} */
module.exports = {
  input: 'src/web.ts',
  output: [
    // UMD format (mevcut - geriye uyumluluk için)
    {
      file: 'dist/web.umd.js',
      format: 'umd',
      name: 'FlowiseChatbot',
      sourcemap: true
    },
    // ES6 modules format (YENİ - modern import/export için)
    {
      file: 'dist/web.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      // ✅ React dependencies kaldırıldı, sadece gerekli skip'ler
      skip: ['fs', 'path', 'os'],
    }),
    commonjs({
      include: /node_modules/,
      // ✅ Solid.js için optimize edildi
      transformMixedEsModules: true,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: [
        ['babel-preset-solid', { 
          generate: 'dom', 
          hydratable: false,
          // ✅ JSX Fragment desteği ekle
          typescript: true
        }],
        // ✅ TypeScript preset ekle
        ['@babel/preset-typescript', {
          isTSX: true,
          allExtensions: true,
          onlyRemoveTypeImports: true
        }]
      ]
    }),
    typescript({
      tsconfig: './tsconfig.json',
      skipLibCheck: true,
      // ✅ React types'ları ignore et
      compilerOptions: {
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      }
    }),
    postcss({
      extensions: ['.css'],
      extract: false,
      inject: true,
      minimize: true,
    }),
    url({
      // Include image files
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
      // Embed smaller images as base64, serve larger ones as separate files
      limit: 8192, // 8KB limit
      // Output directory for assets
      fileName: '[name][extname]',
      // Use base64 for all images to ensure they're embedded
      limit: Infinity,
    }),
    json(),
    // ✅ Production'da console.log'ları KALDIR - debug için geçici olarak kapatıldı
    ...(process.env.NODE_ENV === 'production' ? [terser({
      compress: {
        drop_console: false, // ← DEBUG için false yapıldı
        drop_debugger: false, // ← DEBUG için false yapıldı
      },
    })] : [])
  ],
  external: ['object-assign'],
  onwarn(warning, warn) {
    // Circular dependency warnings'i ignore et
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // External dependency warnings'i ignore et  
    if (warning.code === 'UNRESOLVED_IMPORT') return;
    // React related warnings'i ignore et
    if (warning.message.includes('react')) return;
    warn(warning);
  },
};