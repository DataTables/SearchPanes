describe('searchPanes - options - searchPanes.viewTotal', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (false)', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			await dt.searchPaneSelect(1, 0);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('2');
		});

		dt.html('basic');
		it('Check false', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: false
				}
			});

			await dt.searchPaneSelect(1, 0);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('2');
		});

		dt.html('basic');
		it('Not shown if viewCount set to false', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true,
					viewCount: false
				}
			});

			await dt.searchPaneSelect(0, 0);
			expect($('td.dtsp-countColumn').length).toBe(0);
		});

		dt.html('basic');
		it('Check true when clicking in pane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				}
			});

			await dt.searchPaneSelect(1, 0);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('2');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('0 (9)');
		});
		it('... and remove when deselected', async function() {
			await dt.searchPaneSelect(1, 0);
			await dt.sleep(100);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('2');
		});
		it('... and not shown when table searched before draw', async function() {
			table.search('Ashton');
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('2');
		});
		it('... and shown when table searched after draw', async function() {
			table.draw();
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('0 (2)');
		});

		dt.html('basic');
		it('Check consistency of count when selecting then deselecting in another pane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					viewTotal: true
				}
			});

			await dt.searchPaneSelect(2, 0);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(7) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('1 (4)');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('9');
		});
		it('... and first click updated when another selected', async function() {
			await dt.searchPaneSelect(1, 7);
			await dt.sleep(100);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(7) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('1 (4)');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('1 (9)');
		});
		it('... and first click reset as if nothing else selected when second deselected', async function() {
			await dt.searchPaneSelect(1, 7);
			await dt.sleep(100);
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(7) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('1 (4)');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('9');
		});
	});
});
