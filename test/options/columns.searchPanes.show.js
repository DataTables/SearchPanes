describe('searchPanes - options - columns.searchPanes.show', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'scroller', 'select', 'searchpanes'],
		css: ['datatables', 'scroller', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (undefined)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						searchPanes: {
							show: true
						},
						targets: [0]
					},
					{
						searchPanes: {
							show: false
						},
						targets: [2]
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(false);
		});
		it('Check false', function() {
			expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(true);
		});
		it('Check true', function() {
			expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(false);
		});
	});
});
