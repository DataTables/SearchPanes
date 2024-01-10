describe('searchPanes - integrations - colReorder', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'colreorder', 'select', 'searchpanes'],
		css: ['datatables', 'colreorder', 'select', 'searchpanes']
	});

	describe('Check the behaviour', function() {
		dt.html('basic');
		it('Standard position initially', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				colReorder: true
			});
			table.searchPanes.clearSelections();

			await dt.searchPaneSelect(2, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
		});
		it('Move office column to the start', function() {
			table.colReorder.move(2, 0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('London');
		});
		it('Deselect option', async function() {
			await dt.searchPaneSelect(2, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Tokyo');
		});
		it('Reselect option', async function() {
			await dt.searchPaneSelect(2, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('London');
			expect($('.dt-info').text()).toBe('Showing 1 to 10 of 12 entries (filtered from 57 total entries)');
		});
	});
});
