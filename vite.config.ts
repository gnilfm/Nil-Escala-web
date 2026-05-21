import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

// Plugin customizado para copiar arquivos essenciais do PWA para a pasta dist
// Nota: assetlinks.json agora é gerenciado via pasta 'public', removendo a necessidade de cópia manual.
const copyPwaAssets = () => {
  return {
    name: 'copy-pwa-assets',
    closeBundle: async () => {
      const distDir = path.resolve('dist');

      const filesToCopy = [
        { src: 'sw.js', dest: 'sw.js' },
        { src: 'manifest.json', dest: 'manifest.json' },
        { src: 'icon.svg', dest: 'icon.svg' },
        // Adiciona suporte ao ícone PNG exigido pelo Android/Bubblewrap
        { src: 'images/icon.png', dest: 'icon.png' },
      ];

      // Copiar arquivos da raiz para dist
      filesToCopy.forEach(file => {
        if (fs.existsSync(file.src)) {
          fs.copyFileSync(file.src, path.join(distDir, file.dest));
          console.log(`Copied ${file.src} to dist`);
        } else {
          console.warn(`Arquivo não encontrado para copiar: ${file.src}`);
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPwaAssets()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: true
  }
})