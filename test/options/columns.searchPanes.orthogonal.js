describe('searchPanes - options - columns.searchPanes.orthogonal', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		// dt.html('basic');
		// it('Check defaults (undefined)', function() {
		// 	table = $('#example').DataTable({
		// 		dom: 'Sfrtip',
		// 		columnDefs: [
		// 			{
		// 				searchPanes: {
		// 					orthogonal: 'test1'
		// 				},
		// 				render: {
		// 					_: 0,
		// 					test1: "fred"
		// 				},
		// 				targets: [2]
		// 			},
		// 			// {
		// 			// 	searchPanes: {
		// 			// 		orthogonal: false
		// 			// 	},
		// 			// 	targets: [3]
		// 			// }
		// 		]
		// 	});

		// 	expect($('div.dtsp-searchPane:eq(1)').hasClass('dtsp-hidden')).toBe(false);
		// });
		// it('Check false', function() {
		// 	expect($('div.dtsp-searchPane:eq(2)').hasClass('dtsp-hidden')).toBe(true);
		// });
		// it('Check true', function() {
		// 	expect($('div.dtsp-searchPane:eq(0)').hasClass('dtsp-hidden')).toBe(false);
		// });

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
			console.log(cols)

			cols[0].render = function(data) {return data.first + ' ' + data.last};
			cols[0].searchPane = {tolerance: 0, show: true}
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
