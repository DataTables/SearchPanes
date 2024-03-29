describe('searchPanes - options - searchPanes.panes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Single pane with existing panes', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					panes: [
						{
							header: 'unittest header',
							options: [
								{
									label: 'unittest label',
									value: function(rowData, rowIdx) {
										return rowData[2] === 'San Francisco' && rowData[3] === '66';
									}
								}
							]
						}
					]
				}
			});

			await dt.searchPaneSelect(6, 0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('... clear all works on custom pane', async function() {
			$('button.dtsp-clearAll').click();

			await dt.sleep(100);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
		});
		it('... standard panes still function', async function() {
			await dt.searchPaneSelect(2, 0);
			await dt.sleep(100);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});

		dt.html('basic');
		it('Single pane with no existing panes', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: ['_all'],
						searchPanes: { show: false }
					}
				],
				searchPanes: {
					panes: [
						{
							header: 'unittest header',
							options: [
								{
									label: 'test cox',
									value: function(rowData, rowIdx) {
										return rowData[2] === 'San Francisco' && rowData[3] === '66';
									}
								},
								{
									label: 'test london',
									value: function(rowData, rowIdx) {
										return rowData[2] === 'London';
									}
								}
							]
						}
					]
				}
			});

			expect($('div.dtsp-searchPane:not(.dtsp-hidden)').length).toBe(1);
			expect($('div.dtsp-searchPane table tbody tr').length).toBe(2);
		});
		it('... both have correct counts', function() {
			expect($('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('test cox');
			expect($('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('1');

			expect($('div.dtsp-searchPane table tbody tr:eq(1) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('test london');
			expect($('div.dtsp-searchPane table tbody tr:eq(1) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('12');
		});
		it('... can perform search', async function() {
			$('div.dtsp-searchPane:not(.dtsp-hidden) table tbody tr:eq(0) td:eq(0)').click();
			await dt.sleep(100);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('... can change title', function() {
			$('div.dtsp-searchPane:not(.dtsp-hidden) div.dtsp-topRow input').val('new header');
			expect($('div.dtsp-searchPane:not(.dtsp-hidden) div.dtsp-topRow input').val()).toBe('new header');
		});
		it('... clear works on custom pane', async function() {
			$('div.dtsp-searchPane:not(.dtsp-hidden) div.dtsp-topRow button.dtsp-paneButton:eq(1)').click();

			await dt.sleep(100);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			expect($('div.dtsp-searchPane:not(.dtsp-hidden) div.dtsp-topRow input').val()).toBe('');
		});
	});
});
