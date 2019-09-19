describe('searchPanes - options - columns.searchPanes.header', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Confirm header is present', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				columnDefs: [
					{
						targets: 0,
						searchPanes: {
							header: 'testzero',
							threshold: 0.99
						}
					},
					{
						targets: 1,
						searchPanes: {
							header: 'testone'
						}
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(1) div.dtsp-searchCont input').attr('placeholder')).toBe('testone');
		});
		it('Add rows to make name pane appear', function() {
			for (let i = 0; i < 5; i++) {
				table.row.add(['AAA', 'Accountant', 'San Francisco', '66', '2019/09/07', '$99,999']);
			}

			table.draw().searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:eq(0) div.dtsp-searchCont input').attr('placeholder')).toBe('testzero');
		});

		// disabled because of DD-1127
		// dt.html('empty_no_header');
		// it('Ajax call - no panes present initially', function(done) {
		// 	let columns = dt.getTestColumns();
		// 	columns[0].name = 'testname';
		// 	columns[1].name = 'testposition';

		// 	table = $('#example').DataTable({
		// 		dom: 'Sfrtip',
		// 		searchPanes: true,
		// 		columns: columns,
		// 		ajax: '/base/test/data/data.txt',
		// 		initComplete: function(settings, json) {
		// 			expect($('div.dtsp-searchPane').length).toBe(0);
		// 			done();
		// 		}
		// 	});
		// });
		// it('Rebuild the panes', function() {
		// 	table.searchPanes.rebuildPane();
		// 	expect($('div.dtsp-searchPane').length).toBe(6);
		// });
	});
});