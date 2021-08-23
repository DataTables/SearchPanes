describe('searchPanes - options - searchPanes.initCollapsed', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (true)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPanes div.dataTables_wrapper:visible').length).toBe(3);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					initCollapsed: true
				}
			});

			expect($('div.dtsp-searchPanes div.dataTables_wrapper:visible').length).toBe(0);
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					initCollapsed: false
				}
			});

			expect($('div.dtsp-searchPanes div.dataTables_wrapper:visible').length).toBe(3);
		});

		// TK COLIN also test if columns.searchpanes.collapse is false (wait for DD-2122)
	});
});
