describe('searchPanes - options - searchPanes.controls', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkElementsPresent(expected) {
		expect($('.dtsp-paneInputButton').length !== 0).toBe(expected);
		expect($('.dtsp-searchIcon').length !== 0).toBe(expected);
		expect($('.dtsp-paneButton').length !== 0).toBe(expected);
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
					controls: true
				}
			});

			checkElementsPresent(true);
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					controls: false
				}
			});

			checkElementsPresent(false);
		});
	});
});
