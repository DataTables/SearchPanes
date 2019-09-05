describe('searchPanes - options - searchPanes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			$('#example tbody tr:eq(2) td:eq(1)').text('1234567890123456789012345678901');
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
		});
	});
});
