describe('searchPanes - options - searchPanes.dataLength', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (30)', function() {
			$('#example tbody tr:eq(2) td:eq(1)').text('1234567890123456789012345678901');
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').text()).toBe(
				'123456789012345678901234567890...'
			);
		});

		dt.html('basic');
		it('Custom value', function() {
			$('#example tbody tr:eq(2) td:eq(1)').text('1234567890123456789012345678901');
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					dataLength: 15
				}
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').text()).toBe('123456789012345...');
		});
	});
});
