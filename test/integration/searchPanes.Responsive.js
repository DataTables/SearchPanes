describe('searchPanes - integrations - Responsive', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'responsive', 'select', 'searchpanes'],
		css: ['datatables', 'responsive', 'select', 'searchpanes']
	});

	describe('Check the behaviour', function() {
		dt.html('basic_wide');
		it('Can select visible columns', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				responsive: true
			});

			$('div.dtsp-searchPane:eq(2) tbody tr:eq(1) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica');
		});
		it('... and can deselect', async function() {
			$('div.dtsp-searchPane:eq(2) tbody tr:eq(1) td:eq(0)').click();

			await dt.sleep(100);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi');
		});
		it('Can select hidden columns', function() {
			$('div.dtsp-searchPane:eq(10) tbody tr:eq(1) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Bradley');
		});
		it('... and can deselect', async function() {
			$('div.dtsp-searchPane:eq(10) tbody tr:eq(1) td:eq(0)').click();

			await dt.sleep(100);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi');
		});
	});
});
