describe('searchPanes - options - columns.searchPanes.controls', function() {
	let table;

	function checkElementsPresent(pane, expected) {
		expect($('div.dtsp-searchPane:eq(' + pane + ') .dtsp-paneInputButton').length !== 0).toBe(expected);
		expect($('div.dtsp-searchPane:eq(' + pane + ') .dtsp-searchIcon').length !== 0).toBe(expected);
		expect($('div.dtsp-searchPane:eq(' + pane + ') .dtsp-paneButton').length !== 0).toBe(expected);
	}

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (true)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						searchPanes: {
							controls: true
						},
						targets: [2]
					},
					{
						searchPanes: {
							controls: false
						},
						targets: [3]
					}
				]
			});

			checkElementsPresent(1, true);
		});
		it('Check true', function() {
			checkElementsPresent(2, true);
		});
		it('Check false', function() {
			checkElementsPresent(3, false);
		});
	});
});
