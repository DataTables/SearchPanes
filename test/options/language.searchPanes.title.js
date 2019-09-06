describe('searchPanes - options - language.searchPanes.title', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults - none', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			expect($('div.dtsp-title').text()).toBe('Filters Active - 0');
		});
		it('Check defaults - one', function() {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-title').text()).toBe('Filters Active - 1');
		});
		it('Check defaults - two', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-title').text()).toBe('Filters Active - 2');
		});

		dt.html('basic');
		it('Changed - none', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				language: {
					searchPanes: {
						title:{
							_: 'unittest %d',
							0: 'unittest none',
							1: 'unittest one %d',
						}
					}
				}
		
			});

			expect($('div.dtsp-title').text()).toBe('unittest none');
		});
		it('Check defaults - one', function() {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-title').text()).toBe('unittest one 1');
		});
		it('Check defaults - two', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-title').text()).toBe('unittest 2');
		});

	});
});
