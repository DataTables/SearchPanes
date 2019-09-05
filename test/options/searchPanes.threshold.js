describe('searchPanes - options - searchPanes.threshold', function() {
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
		it('Check defaults (0.6)', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, true, true, true, false, false]);
		});

		dt.html('basic');
		it('Increase threshhold', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 1
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, true, true, true, true, true]);
		});

		dt.html('basic');
		it('Increased threshhold while forcing columns to be hidden', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 1
				},
				columnDefs: [{ targets: 0, searchPanes: { show: false } }]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, true, true, true, true, true]);
		});

		dt.html('basic');
		it('Decrease threshhold', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.2
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, false, true, false, false, false]);
		});

		dt.html('basic');
		it('Decreased threshhold while forcing columns to be visible', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.2
				},
				columnDefs: [{ targets: 0, searchPanes: { show: true } }]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, false, true, false, false, false]);
		});
	});
});
