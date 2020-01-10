describe('searchPanes - options - columns.searchPanes.dtOpts', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Searching - disabled', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							dtOpts: {
								searching: false
							}
						}
					}
				]
			});

			expect($('button.dtsp-searchIcon').length).toBe(2);
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
		it('Paging - enabled', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							dtOpts: {
								dom: "tp",
								paging: true
							}
						}
					}
				]
			});

			expect($('div.dataTables_paginate').length).toBe(2);
		});
		it('... and you can page', function() {
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Accountant');
			$('div.dtsp-searchPane:eq(1) .paginate_button.next').click();
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Financial Controller');
		});

		dt.html('basic');
		it('Non-conflicting options (global and column)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							dtOpts: {
								dom: "tp",
								paging: true
							}
						}
					}
				],
				searchPanes: {
					dtOpts: {
						lengthChange: false
					}
				}
			});

			expect($('div.dataTables_paginate').length).toBe(2);
		});
		it('... and you can page', function() {
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Accountant');
			$('div.dtsp-searchPane:eq(1) .paginate_button.next').click();
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Financial Controller');
		});

		dt.html('basic');
		it('Conflicting options (global and column) 1', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							dtOpts: {
								paging: false
							}
						}
					}
				],
				searchPanes: {
					dtOpts: {
						dom: "tp",
						paging: true
					}
				}
			});

			expect($('div.dataTables_paginate').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(1) div.dataTables_paginate').length).toBe(0);
		});

		dt.html('basic');
		it('Conflicting options (global and column) 2', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						targets: 1,
						searchPanes: {
							dtOpts: {
								dom: "tp",
								paging: true
							}
						}
					}
				],
				searchPanes: {
					dtOpts: {
						paging: false
					}
				}
			});

			expect($('div.dataTables_paginate').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(1) div.dataTables_paginate').length).toBe(1);
		});
	});
});
