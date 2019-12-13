describe('searchPanes - options - searchPanes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			expect($('div.dtsp-panesContainer').text()).not.toBe('Loading Search Panes...');
			expect($('div.dtsp-searchPane').length).toBe(6);
		});

		dt.html('two_tables');
		it('Check defaults', function() {
			$('#example tbody tr:eq(2) td:eq(1)').text('1234567890123456789012345678901');
			table = $('table').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					threshold: 1
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(9);
		});
		it('... and can filter on first table', function() {
			$('#example_one_wrapper div.dtsp-searchPane:eq(2) tbody tr:eq(1) td:eq(0)').click();
			expect($('#example_one tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
		});
		it('... and can filter on second table', function() {
			$('#example_two_wrapper div.dtsp-searchPane:eq(1) tbody tr:eq(2) td:eq(0)').click();
			expect($('#example_two tbody tr:eq(0) td:eq(0)').text()).toBe('Milan');
		});
		it('... and clear only affects one table', async function() {
			$('#example_two_wrapper button.dtsp-clearAll').click();

			await dt.sleep(100);

			expect($('#example_one tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
			expect($('#example_two tbody tr:eq(0) td:eq(0)').text()).toBe('Boston');
		});

		dt.html('basic');
		it('Destroy removes searchPanes', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			table.destroy();

			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('basic');
		it('Column visibility - pane remains visible', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			table.column(1).visible(false);
			table.searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Accountant'
			);
		});

		dt.html('empty');
		it('Loading message displayed if more than 500 rows', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}
				},
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/large.txt',
				initComplete: function(settings, json) {
					expect($('div.dtsp-panesContainer').text()).toBe('Loading Search Panes...');
					done();
				}
			});
		});
		it('... and it will be removed once table loaded', async function() {
			await dt.sleep(1000);
			expect($('div.dtsp-panesContainer').text()).not.toBe('Loading Search Panes...');
		});
	});
});
