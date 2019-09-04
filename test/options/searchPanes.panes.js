describe('searchPanes - options - searchPanes.viewTotal', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (false)', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2');
		});

		dt.html('basic');
		it('Check false', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					viewTotal: false
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2');
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					viewTotal: true
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2 (2)');
		});

		dt.html('basic');
		it('Not shown if hideCount set', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					viewTotal: true,
					hideCount: true
				}
			});

			$('div.dtsp-searchPane table tbody tr:eq(0) td').click();
			expect($('td.dtsp-countColumn').length).toBe(0);
		});
	});
});
