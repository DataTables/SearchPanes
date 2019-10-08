describe('searchPanes - options - columns.searchPanes.hideCount', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (false)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						searchPanes: {
							hideCount: false
						},
						targets: [2]
					},
					{
						searchPanes: {
							hideCount: true
						},
						targets: [3]
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(1) td.dtsp-countColumn').length).toBe(33);
		});
		it('Check false', function() {
			expect($('div.dtsp-searchPane:eq(2) td.dtsp-countColumn').length).toBe(7);
		});
		it('Check true', function() {
			expect($('div.dtsp-searchPane:eq(3) td.dtsp-countColumn').length).toBe(0);
		});
	});
});
