describe('searchPanes - options - columns.searchPanes.collapse', function () {
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
							collapse: true
						},
						targets: [2]
					},
					{
						searchPanes: {
							collapse: false
						},
						targets: [3]
					}
				]
			});

			expect($('button.dtsp-collapseButton').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(1) button.dtsp-collapseButton').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(2) button.dtsp-collapseButton').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(3) button.dtsp-collapseButton').length).toBe(0);
		});
		it('... unable to collapse all when not collapsible', function () {
			$('button.dtsp-collapseAll').click();
			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(1);
		});
	});
});
