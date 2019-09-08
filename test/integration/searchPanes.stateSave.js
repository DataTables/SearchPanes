describe('searchPanes - integrations - stateSave', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check selection', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true,
				stateSave: true
			});

			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('Still same after reload', async function() {
			await dt.sleep(1000);
			table.destroy();

			await dt.sleep(1000);

			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true,
				stateSave: true
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('Tidy up', function() {
			table.state.clear();
		});

		// DD-1114
		// one above fixed, test the ordering of the searchPane's columns. 


	});
});
