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
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-title').text()).toBe('Filters Active - 0');
		});
		it('Check defaults - one', async function() {
			await dt.searchPaneSelect(1, 0);
			expect($('div.dtsp-title').text()).toBe('Filters Active - 1');
		});
		it('Check defaults - two', async function() {
			await dt.searchPaneSelect(2, 0);
			expect($('div.dtsp-title').text()).toBe('Filters Active - 2');
		});

		dt.html('basic');
		it('Changed - none', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
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
		it('Check defaults - one', async function() {
			await dt.searchPaneSelect(1, 0);
			expect($('div.dtsp-title').text()).toBe('unittest one 1');
		});
		it('Check defaults - two', async function() {
			await dt.searchPaneSelect(2, 0);
			expect($('div.dtsp-title').text()).toBe('unittest 2');
		});

	});
});
