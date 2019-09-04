describe('searchPanes - options - columns.searchPanes.show', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check when first three columns specified', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					columns: [0, 1, 2]
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(true);
			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(false);
		});

		dt.html('basic');
		it('Check when last three columns specified', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					columns: [3, 4, 5]
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(true);
			expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(true);
		});

		dt.html('basic');
		it('Check when last three columns specified with low tolerance', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				paging: false,
				searchPanes: {
					columns: [3, 4, 5],
					threshold: 0.99
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(true);
			expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(false);
		});

		dt.html('basic');
		it('Check when last three columns specified with show set', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				paging: false,
				columnDefs: [
					{
						targets: [4, 5],
						searchPanes: {
							show: true
						}
					},
					{
						targets: 3,
						searchPanes: {
							show: false
						}
					}
				],
				searchPanes: {
					columns: [3, 4, 5]
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(true);
			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(false);
		});
	});
});
