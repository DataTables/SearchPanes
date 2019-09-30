describe('searchPanes - options - language.searchPanes.emptyPanes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('empty');
		it('Shown at start on empty table', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}		
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(0);
			expect($('div.dtsp-panesContainer div').text()).toBe('unittest');
		});

		dt.html('basic');
		it('Not shown when panes displayed at start', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}		
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			expect($('div.dtsp-panesContainer div').text()).not.toBe('unittest');
		});
		it('Shown when rows removed', function() {
			table.rows().remove().draw();
			table.searchPanes.rebuildPane();

			// DD-1177 - panes still being displayed TK COLIN
			// expect($('div.dtsp-searchPane').length).toBe(6);
			// expect($('div.dtsp-panesContainer div').text()).not.toBe('unittest');
		});
	});
});
