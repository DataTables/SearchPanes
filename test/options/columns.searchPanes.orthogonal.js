describe('searchPanes - options - columns.searchPanes.orthogonal', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkArray(pane, span, values) {
		for (let i = 0; i < values.length; i++) {
			expect(
				$(
					'div.dtsp-searchPane:eq(' + pane + ') table tbody tr:eq(' + i + ') td:eq(0) span:eq(' + span + ')'
				).text()
			).toBe(values[i].toString());
		}
	}

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check render function', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columnDefs: [
					{
						searchPanes: {
							orthogonal: 'panes'
						},
						render: function (data, type, row, meta) {
							return type === 'panes' ? 'panes ' + data : data;
						},
						targets: [2]
					}
				]
			});

			expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'panes Edinburgh'
			);
			expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('9');
		});
		it('Check filter of rendered options', function () {
			$('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dataTables_info').text()).toBe(
				'Showing 1 to 9 of 9 entries (filtered from 57 total entries)'
			);
		});

		dt.html('empty');
		it('Check defaults (undefined)', function () {
			let data = [
				{
					name: { first: 'Aaron', last: 'Aardvark' },
					position: 'Architect',
					office: [{ city: 'Detroit' }, { city: 'Atlanta' }],
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
				}
			];

			let cols = dt.getTestColumns();

			cols[0].render = function (data) {
				return data.first + ' ' + data.last;
			};
			cols[0].searchPanes = { threshold: 0, show: true };
			cols[2].render = { _: '[; ].city', sp: '[].city' };
			cols[2].searchPanes = { threshold: 0, show: true, orthogonal: 'sp' };

			table = $('#example').DataTable({
				dom: 'Pfrtip',
				data: data,
				columns: cols
			});

			expect($('div.dtsp-searchPane.dtsp-hidden').length).toBe(4);
		});
		it('Check contents as expected', function () {
			checkArray(0, 0, ['Aaron Aardvark']);
			checkArray(2, 0, ['Atlanta', 'Boulder', 'Detroit']);
			checkArray(2, 1, [2, 1, 1]);
		});

		dt.html('permissions');
		it('Check defaults (undefined)', function () {
			table = $('#example').DataTable({
				ajax: '/base/test/data/permissions.txt',
				searchPanes: {
					cascadePanes: true,
					columns: [0, 3]
				},
				dom: 'Pfrtip',
				columns: [
					{
						data: 'users.first_name'
					},
					{
						data: 'users.last_name'
					},
					{
						data: 'sites.name'
					},
					{
						title: 'Perm',
						data: 'permission',
						defaultContent: '<i>Not set</i>',
						visible: true,
						render: {
							_: '[, ].name',
							sp: '[].name'
						},
						searchPanes: {
							orthogonal: 'sp'
						}
					}
				],
				columnDefs: [
					{
						searchPanes: {
							show: true
						},
						targets: [0, 3]
					}
				]
			});
		});
		it('Check contents as expected', async function () {
			await dt.sleep(100);
			expect($('div.dtsp-searchPane').length).toBe(2);
			checkArray(1, 0, ['Accounts', 'Desktop', 'Printer', 'Servers', 'VMs', 'Web-site']);
			checkArray(1, 1, [6, 11, 10, 12, 6, 3]);
		});
	});
});
