describe('searchPanes - options - language.searchPanes.collapseMessage', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check defaults', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('button.dtsp-collapseAll').text()).toBe('Collapse All');
		});

		dt.html('basic');
		it('Change defaults', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						collapseMessage: 'unit test'
					}
				}
			});

			expect($('button.dtsp-collapseAll').text()).toBe('unit test');
		});
	});
});
