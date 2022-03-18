describe('searchPanes - options - columns.searchPanes.combiner', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		let data = [
			['first', "1, 2, 3, 4", 'third', 'fourth', 'fifth', 'sixth'],
			['first1', "1, 4", 'third1', 'fourth1', 'fifth1', 'sixth1'],
			['first2', "1, 3, 4", 'third', 'fourth', 'fifth', 'sixth'],
			['first3', "1, 2", 'third1', 'fourth1', 'fifth1', 'sixth1']
		]

		dt.html('empty');
		it('Check defaults', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				data: data,
				columnDefs: [{
					targets: [1],
					render: {
						_: "",
						splitData: function (data) {
							return data.split(", ");
						},
					},
					searchPanes: {
						orthogonal: "splitData",
						show: true,
					}
				}]
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();

			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(clickEvent);

			expect($('#example tbody tr').length).toBe(4);
		});

		dt.html('empty');
		it('Check And logic', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				data: data,
				columnDefs: [{
					targets: [1],
					render: {
						_: "",
						splitData: function (data) {
							return data.split(", ");
						},
					},
					searchPanes: {
						combiner: "and",
						orthogonal: "splitData",
						show: true,
					}
				}]
			});

			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();

			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(clickEvent);

			expect($('#example tbody tr').length).toBe(2);
		});
	});
});
