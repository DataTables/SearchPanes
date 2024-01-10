describe('searchPanes - integrations - Responsive', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'responsive', 'select', 'searchpanes'],
		css: ['datatables', 'responsive', 'select', 'searchpanes']
	});

	describe('Check the behaviour', function() {
		dt.html('basic_wide');
		it('Can select visible columns', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				responsive: true
			});

			await dt.searchPaneSelect(2, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica');
		});
		it('... and can deselect', async function() {
			await dt.searchPaneSelect(2, 1);

			await dt.sleep(100);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi');
		});
		it('Can select hidden columns', async function() {
			await dt.searchPaneSelect(10, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Bradley');
		});
		it('... and can deselect', async function() {
			await dt.searchPaneSelect(10, 1);

			await dt.sleep(100);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi');
		});
	});
});
