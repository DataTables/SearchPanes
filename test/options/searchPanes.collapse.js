describe('searchPanes - options - searchPanes.collapse', function() {
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

			expect($('button.dtsp-collapseButton').length).toBe(3);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					collapse: true
				}
			});

			expect($('button.dtsp-collapseButton').length).toBe(3);
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					collapse: false
				}
			});

			expect($('button.dtsp-collapseButton').length).toBe(0);
		});
	});
});
