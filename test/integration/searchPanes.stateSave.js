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

			expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0)').text()).toBe('Edinburgh');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').text()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('Still same after reload', async function() {
			table.destroy();

			await dt.sleep(2000);

			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(2000);

			// DD-1145
			// expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0)').text()).toBe('Edinburgh');
			// expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').text()).toBe('Edinburgh');
			// expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('Tidy up', function() {
			table.state.clear();
		});

		// DD-1145
		// one above fixed, test the ordering of the searchPane's columns. 


	});
});
