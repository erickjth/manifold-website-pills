import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		minify: true,
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name].[hash][extname]',
				manualChunks: undefined,
				entryFileNames: 'assets/[name].[hash].js',
			},
		},
	},
});
