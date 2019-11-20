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
				dom: 'Pfrtip',
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

			await dt.sleep(500);

			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			// DD-1145
			expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0)').text()).toBe('Edinburgh');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').text()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('Tidy up', function() {
			table.state.clear();
		});

		// DD-1145
		// one above fixed, test the ordering of the searchPane's columns.
	});

	describe('stateSave when searchPanes not enables originally', function() {
		dt.html('basic');
		it('No searchPanes originally', function() {
			table = $('#example').DataTable({
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('basic');
		it('Add searchPanes', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
		});
		it('Tidy up', function() {
			table.state.clear();
		});
	});
});
