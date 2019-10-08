describe('searchPanes - options - columns.searchPanes.threshold', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkVisible(expected) {
		for (let i = 0; i < expected.length; i++) {
			expect(!$('div.dtsp-searchPane:eq(' + i + ')').hasClass('dtsp-hidden')).toBe(expected[i]);
		}
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Increase threshold from global', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					threshold: 0.1
				},
				columnDefs: [
					{
						targets: '_all',
						searchPanes: {
							threshold: 0.9
						}
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, true, true, true, false, false]);
		});

		dt.html('basic');
		it('Increase threshold from global for specific columns', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					threshold: 0.1
				},
				columnDefs: [
					{
						targets: [0, 5],
						searchPanes: {
							threshold: 1
						}
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, false, false, false, false, true]);
		});

		dt.html('basic');
		it('Increase threshold from global for specific columns with different values', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					threshold: 0.1
				},
				columnDefs: [
					{
						targets: 0,
						searchPanes: {
							threshold: 1
						}
					},
					{
						targets: [1],
						searchPanes: {
							threshold: 0.6
						}
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, true, false, false, false, false]);
		});
	});
});
