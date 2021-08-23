describe('searchPanes - options - language.searchPanes.showMessage', function () {
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

			expect($('button.dtsp-showAll').text()).toBe('Show All');
		});

		dt.html('basic');
		it('Change defaults', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						showMessage: 'unit test'
					}
				}
			});

			expect($('button.dtsp-showAll').text()).toBe('unit test');
		});
	});
});
