import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to access cwd() method which might be missing in the Process type definition
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globally for the client
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})