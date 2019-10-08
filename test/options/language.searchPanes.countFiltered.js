describe('searchPanes - options - language.searchPanes.countFiltered', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2 (2)');
		});

		dt.html('basic');
		it('Single replacement', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				},
				language: {
					searchPanes: {
						countFiltered: 'unit {total}'
					}
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2');
		});

		dt.html('basic');
		it('Double replacement', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				},
				language: {
					searchPanes: {
						countFiltered: 'unit {total} test {total}'
					}
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2 test 2');
		});

		dt.html('basic');
		it('Two replacements', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				},
				language: {
					searchPanes: {
						countFiltered: 'unit {total} test {shown}'
					}
				}
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 2 test 2');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(1)').text()).toBe('unit 9 test 0');
		});
	});
});
