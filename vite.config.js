import { defineConfig } from 'vite'
import yaml from '@rollup/plugin-yaml'

// Permet d'importer des fichiers .yaml comme des données (content/events.yaml).
export default defineConfig({
  plugins: [yaml()],
})
