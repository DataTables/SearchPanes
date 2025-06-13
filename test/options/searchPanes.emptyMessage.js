describe('searchPanes - options - searchPanes.emptyMessage', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check default', function() {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').html()).toBe(
				'<em>Empty</em>'
			);
		});
		it('Refers to expected row', async function() {
			await dt.searchPaneSelect(2, 0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});

		dt.html('basic');
		it('Change the default', function() {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			table = $('#example').DataTable({
				searchPanes: {
					emptyMessage: '<i><b>EMPTY</b></i>'
				},
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').html()).toBe(
				'<i><b>EMPTY</b></i>'
			);
		});
		it('Refers to expected row', async function() {
			await dt.searchPaneSelect(2, 0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
	});
});
