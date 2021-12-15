import resolve from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'src/index.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/dataTables.searchPanes.js',
			format: 'iife'
		},
		plugins: [resolve()]
	},
	{
		input: 'src/searchPanes.bootstrap.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/searchPanes.bootstrap.js',
			format: 'iife'
		},
		plugins: [resolve()]
	},
	{
		input: 'src/searchPanes.bootstrap4.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/searchPanes.bootstrap4.js',
			format: 'iife'
		},
		plugins: [resolve()]
	},
	{
		input: 'src/searchPanes.dataTables.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/searchPanes.dataTables.js',
			format: 'iife'
		},
		plugins: [resolve()]
	},
	{
		input: 'src/searchPanes.foundation.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/searchPanes.foundation.js',
			format: 'iife'
		},
		plugins: [resolve()]
	},
	{
		input: 'src/searchPanes.semanticui.js',
		moduleContext: () => 'window',
		output: {
			file: process.env.OUT + '/js/searchPanes.semanticui.js',
			format: 'iife'
		},
		plugins: [resolve()]
	}
];
