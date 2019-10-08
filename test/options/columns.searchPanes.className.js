describe('searchPanes - options - columns.searchPanes.className', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Confirm classes are present', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 0,
						searchPanes: {
							className: 'testzero'
						}
					},
					{
						targets: 1,
						searchPanes: {
							className: 'testone'
						}
					},
					{
						targets: 2,
						searchPanes: {
							className: 'testtwo'
						}
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(0)').hasClass('testzero')).toBe(true);
			expect($('div.dtsp-searchPane:eq(1)').hasClass('testone')).toBe(true);
			expect($('div.dtsp-searchPane:eq(2)').hasClass('testtwo')).toBe(true);
		});
	});
});
