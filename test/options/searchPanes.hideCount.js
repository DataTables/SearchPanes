describe('searchPanes - options - searchPanes.hideCount', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (false)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('td.dtsp-nameColumn span.dtsp-pill').length).toBe(73);
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					hideCount: false
				}
			});

			expect($('td.dtsp-nameColumn span.dtsp-pill').length).toBe(73);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					hideCount: true
				}
			});

			expect($('td.dtsp-nameColumn span.dtsp-pill').length).toBe(0);
		});
	});
});
