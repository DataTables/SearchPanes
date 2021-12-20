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
	}
];
