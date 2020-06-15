describe('searchPanes - options - columns.searchPanes.header', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check default', function() {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			$('#example tbody tr:eq(4) td:eq(1)').text('');

			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(3) td:eq(0) span.dtsp-name:eq(0)').html()).toBe(
				'<i>No Data</i>'
			);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(16) td:eq(0) span.dtsp-name:eq(0)').html()).toBe(
				'<i>No Data</i>'
			);
		});
		it('Refers to expected row', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(3) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});

		dt.html('basic');
		it('Change the default', function() {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			$('#example tbody tr:eq(4) td:eq(1)').text('');

			table = $('#example').DataTable({
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							emptyMessage: 'A test 1'
						}
					},
					{
						targets: 2,
						searchPanes: {
							emptyMessage: 'A test 2'
						}
					}
				],
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('A test 1');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('A test 2');
		});
		it('Refers to expected row', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});

		dt.html('basic');
		it('Change the global default and one specific column', function() {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			$('#example tbody tr:eq(4) td:eq(1)').text('');

			table = $('#example').DataTable({
				searchPanes: {
					emptyMessage: 'A test global'
				},
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							emptyMessage: 'A test 1'
						}
					}
				],
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('A test 1');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('A test global');
		});
		it('Refers to expected row', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
	});
});
