import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		// sourcemap: false,
		minify: false,
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name][extname]',
				manualChunks: undefined,
				entryFileNames: 'assets/app-[name].js',
			},
		},
	},
});
