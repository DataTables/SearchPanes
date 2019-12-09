describe('searchPanes - options - language.searchPanes.emptyPanes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('empty');
		it('Default message shown on empty table', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('No SearchPanes');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
		});

		dt.html('empty');
		it('Can remove default message shown on empty table', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						emptyPanes: null
					}
				}
			});

			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(true);
		});

		dt.html('empty');
		it('Shown at start on empty table', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}
				}
			});

			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
		});

		dt.html('basic');
		it('Not shown when panes displayed at start', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}
				}
			});

			expect($('div.dtsp-searchPane:visible').length).toBe(3);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).not.toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
		});
		it('Shown when rows removed', function() {
			table
				.rows()
				.remove()
				.draw();
			table.searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
		});
	});
});
