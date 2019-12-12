describe('searchPanes - options - searchPanes.dtOpts', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Searching - default', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('button.dtsp-searchIcon').length).toBe(3);
		});
		it('... and you can search with input', function() {
			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').attr('disabled')).toBe(undefined);
			$('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val('Developer');
			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val()).toBe('Developer');

			$('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').trigger('input');
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Developer');
		});
		it('... and you can search with API', function() {
			$('div.dtsp-searchPane:eq(1) table')
				.DataTable()
				.search('Junior Technical Author')
				.draw();
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Junior Technical Author');
		});

		dt.html('basic');
		it('Searching - disabled', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					dtOpts: {
						searching: false
					}
				}
			});

			expect($('span.dtsp-searchIcon').length).toBe(0);
		});
		it('... and you cannot search', function() {
			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').attr('disabled')).toBe('disabled');
			$('div.dtsp-searchPane:eq(1) table')
				.DataTable()
				.search('Ashton Cox')
				.draw();
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Accountant');
		});

		dt.html('basic');
		it('PAging - default - disabled', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('div.dataTables_length').length).toBe(0);
		});

		dt.html('basic');
		it('Paging - enabled', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					dtOpts: {
						paging: true
					}
				}
			});

			expect($('div.dataTables_length').length).toBe(3);
		});
		it('... and you can page', function() {
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Accountant');
			$('div.dtsp-searchPane:eq(1) .paginate_button.next').click();
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Financial Controller');
		});

		dt.html('basic');
		it('Set on custom panes', function() {
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
							],
							dtOpts: {
								paging: true
							}
						}
					]
				}
			});

			expect($('div.dtsp-searchPane:eq(6) div.dataTables_length').length).toBe(1);
		});
	});
});
