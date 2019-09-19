describe('searchPanes - options - searchPanes.cascadePanes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (false)', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					cascadePanes: false
				}
			});

			$('div.dtsp-searchPane table tbody tr:eq(0) td').click();
			expect($('td.dtsp-countColumn').length).toBe(73);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					cascadePanes: false
				}
			});

			$('div.dtsp-searchPane table tbody tr:eq(0) td').click();
			expect($('td.dtsp-countColumn').length).toBe(73);
		});

		dt.html('basic');
		it('Check true', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					cascadePanes: true
				}
			});

			$('div.dtsp-searchPane table tbody tr:eq(0) td').click();
			expect($('td.dtsp-countColumn').length).toBe(4);
		});
	});
});