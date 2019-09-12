describe('searchPanes - options - columns.searchPanes.orthogonal', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check render function', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				columnDefs: [
					{
						searchPanes: {
							orthogonal: 'panes'
						},
						render: function(data, type, row, meta) {
							return type === 'panes' ? 'panes ' + data : data;
						},
						targets: [2]
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').text()).toBe('panes Edinburgh');
			expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(1)').text()).toBe('9');
		});
		it('Check filter of rendered options', function() {
			$('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dataTables_info').text()).toBe('Showing 1 to 9 of 9 entries (filtered from 57 total entries)');
		});

		// DD-1105
		dt.html('empty');
		it('Check defaults (undefined)', function() {
			let data = [
				{
					name: { first: 'Aaron', last: 'Aardvark' },
					position: 'Architect',
					office: [{ city: 'Atlanta' }, { city: 'Aspen' }],
					age: 99,
					start_date: '2018/05/06',
					salary: '$40,000'
				},
				{
					name: { first: 'Bertie', last: 'Bluster' },
					position: 'Architect',
					office: [{ city: 'Atlanta' }, { city: 'Boulder' }],
					age: 33,
					start_date: '2018/05/06',
					salary: '$40,000'
				},
				{
					name: { first: 'Bertie', last: 'Bluster' },
					position: 'Architect',
					office: [{ city: 'Atlanta' }, { city: 'Boulder' }],
					age: 33,
					start_date: '2018/05/06',
					salary: '$40,000'
				}
			];

			let cols = dt.getTestColumns();

			cols[0].render = function(data) {return data.first + ' ' + data.last};
			cols[0].searchPanes = {tolerance: 0, show: true}
			cols[2].render = '[; ].city';

			table = $('#example').DataTable({
				dom: 'Sfrtip',
				data: data,
				columns: cols
			});

			expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(false);
		});
	});
});
