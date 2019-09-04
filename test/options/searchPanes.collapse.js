describe('searchPanes - options - searchPanes.collapse', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'buttons', 'searchpanes'],
		css: ['datatables', 'select', 'buttons', 'searchpanes']
	});


	describe('Functional tests', function() {
		// TK COLIN complete these when jira fixed

		// dt.html('basic');
		// it('Check default (prepend)', function() {
		// 	table = $('#example').DataTable({
		// 		dom: 'Sfrtip'
		// 	});

		// 	expect(isTableHigher()).toBe('lower');
		// });

		// dt.html('basic');
		// it('prepend', function() {
		// 	table = $('#example').DataTable({
		// 		searchPanes: {
		// 			insert: 'prepend'
		// 		},
		// 		dom: 'Sfrtip'
		// 	});

		// 	expect(isTableHigher()).toBe('lower');
		// });

		// DD-1089
		dt.html('basic');
		it('append', function() {
			table = $('#example').DataTable({
				searchPanes: {
					collapse: true
				},
				dom: 'Sfrtip'
			});

			// expect(true).toBe(false);
		});
	});
});
