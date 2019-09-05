describe('searchPanes - options - searchPanes.panes', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Single pane with existing panes', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					panes: [
						{
							header: 'unittest header',
							searchPanes: {
								options: [
									{
										label: 'unittest label',
										value: function(rowData, rowIdx) {
											return rowData[2] === 'San Francisco' && rowData[3] === '66';
										}
									}
								]
							}
						}
					]
				}
			});

			$('div.dtsp-searchPane:eq(6) table tbody tr:eq(0) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('... clear all works on custom pane', async function() {
			$('button.dtsp-clearAll').click();

			await dt.sleep(100);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
		});
		it('... standard panes still function', async function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();

			await dt.sleep(100);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});

		// DD-1096 breaking the following test
		dt.html('basic');
		it('Single pane with no existing panes', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
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
							searchPanes: {
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
						}
					]
				}
			});

			expect($('div.dtsp-searchPane:not(.dtsp-hidden)').length).toBe(1);
			expect($('div.dtsp-searchPane table tbody tr').length).toBe(2);
		});
		it('... both have correct counts', async function() {
			expect($('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').text()).toBe('test cox');
			expect($('div.dtsp-searchPane table tbody tr:eq(0) td:eq(1)').text()).toBe('1');

			expect($('div.dtsp-searchPane table tbody tr:eq(1) td:eq(0)').text()).toBe('test london');
			expect($('div.dtsp-searchPane table tbody tr:eq(1) td:eq(1)').text()).toBe('12');
		});
		it('... can perform search', async function() {
			$('div.dtsp-searchPane:not(.dtsp-hidden) table tbody tr:eq(0) td:eq(0)').click();
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('... can change title', async function() {
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
