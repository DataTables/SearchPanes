describe('searchPanes - options - searchPanes.initCollapsed', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check defaults (true)', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(3);
		});

		dt.html('basic');
		it('Check true', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					initCollapsed: true
				}
			});

			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(0);
		});

		dt.html('basic');
		it('Check false', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					initCollapsed: false
				}
			});

			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(3);
		});

		dt.html('basic');
		it('Check false', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					initCollapsed: true
				},
				columnDefs: [
					{
						searchPanes: {
							collapse: false
						},
						targets: [2, 3]
					}
				]
			});

			expect($('div.dtsp-searchPanes div.dt-container:visible').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(1) div.dt-container:visible').length).toBe(0);
			expect($('div.dtsp-searchPane:eq(2) div.dt-container:visible').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(3) div.dt-container:visible').length).toBe(1);
		});
	});
});
