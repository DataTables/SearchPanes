describe('searchPanes - options - columns.searchPanes.initCollapsed', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check settings', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						searchPanes: {
							initCollapsed: true
						},
						targets: [2]
					},
					{
						searchPanes: {
							initCollapsed: false
						},
						targets: [3]
					}
				]
			});

			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(1) div.dt-container:visible').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(2) div.dt-container:visible').length).toBe(0);
			expect($('div.dtsp-searchPane:eq(3) div.dt-container:visible').length).toBe(1);
		});
		it('... able to collapse uncollapsed', function () {
			$('div.dtsp-searchPane:eq(3) button.dtsp-collapseButton').click();
			
			expect($('div.dtsp-searchPane:eq(3) div.dt-container:visible').length).toBe(0);
		});
		it('... able to show collapsed', function () {
			$('div.dtsp-searchPane:eq(2) button.dtsp-collapseButton').click();
			
			expect($('div.dtsp-searchPane:eq(2) div.dt-container:visible').length).toBe(1);
		});
	});
});
