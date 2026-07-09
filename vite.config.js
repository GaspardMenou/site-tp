import { defineConfig } from 'vite'
import yaml from '@rollup/plugin-yaml'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// - yaml()      : permet d'importer content/events.yaml comme des données.
// - ViteImageOptimizer : recompresse les photos de la galerie au build
//   (les JPG bruts font 300-450 Ko → ~5x plus légers, sans rien changer au code).
export default defineConfig({
  plugins: [
    yaml(),
    ViteImageOptimizer({
      jpg: { quality: 72 },
      jpeg: { quality: 72 },
      png: { quality: 80 },
    }),
  ],
})
