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
			expect($('div.dtsp-title:visible').length).toBe(0);
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
			expect($('div.dtsp-title:visible').length).toBe(0);
		});

		dt.html('empty');
		it('Setup', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						emptyPanes: 'unittest'
					}
				},
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/empty.txt',
				initComplete: function(settings, json) {
					done();
				}
			});
		});
		it('Not shown at start on empty table', function() {
			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-title:visible').length).toBe(0);
		});

		it('Present when rows added', async function() {
			// The below will cause `ResizeObserver loop completed with undelivered notifications`
			// to be thrown async, but I've not been able to reproduce it in the browser. This
			// will catch the error and ignore it for this specific test.
			window.onerror = function () {};

			table.ajax.url('/base/test/data/data.txt').load();
			await dt.sleep(500);

			window.onerror = undefined;

			expect($('div.dtsp-searchPane:visible').length).toBe(3);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).not.toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-title:visible').length).toBe(1);
		});
		it('SearchPanes still work', async function() {
			await dt.searchPaneSelect(1, 1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
		});
		it('Clear All still works', async function() {
			$('button.dtsp-clearAll').click();
			await dt.sleep(200); // There is a slight pause before running the deselect draw so can't test the below instantly

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
		});

		dt.html('basic');
		it('Shown when panes displayed at start', function() {
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
			expect($('div.dtsp-title:visible').length).toBe(1);
		});
		it('Not shown when rows removed', function() {
			table
				.rows()
				.remove()
				.draw();
			table.searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:visible').length).toBe(0);
			expect($('div.dtsp-panesContainer div.dtsp-emptyMessage').text()).toBe('unittest');
			expect($('div.dtsp-panesContainer').hasClass('dtsp-hidden')).toBe(false);
			expect($('div.dtsp-title:visible').length).toBe(0);
		});
	});
});
