describe('searchPanes - options - searchPanes.orderable', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkElementsPresent(expected) {
		expect($('div.dtsp-searchPane:eq(1) .dtsp-paneButton').length === 5).toBe(expected);
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (true)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			checkElementsPresent(true);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					orderable: true
				}
			});

			checkElementsPresent(true);
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					orderable: false
				}
			});

			checkElementsPresent(false);
		});
	});
});
