describe('searchPanes - options - language.searchPanes.count', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2');
		});

		dt.html('basic');
		it('Single replacement', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						count: 'unit {total}'
					}
				}
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2');
		});

		dt.html('basic');
		it('Double replacement', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						count: 'unit {total} test {total}'
					}
				}
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2 test 2');
		});

		dt.html('basic');
		it('Two replacements', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						count: 'unit {total} test {shown}'
					}
				}
			});

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2 test 2');
		});

		dt.html('basic');
		it('Remains if option selected', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						count: 'unit {total}'
					}
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2');
		});
	});
});
