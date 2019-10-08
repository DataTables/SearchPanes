describe('searchPanes - api - searchPanes.container()', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Check the defaults', function() {
		dt.html('basic');
		it('Exists and is a function', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});
			expect(typeof table.searchPanes.container).toBe('function');
		});
		it('Returns a jQuery instance', function() {
			expect(table.searchPanes.container() instanceof $).toBe(true);
		});
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Select single pane', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			table.searchPanes.container().addClass('unittest');

			expect(table.searchPanes.container().hasClass('unittest')).toBe(true);

			// TK COLIN DD-1164 - thought this would be main searchPanes container
			// expect($('div.dtsp-panesContainer').hasClass('unittest')).toBe(true);
		});
	});
});
