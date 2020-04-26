describe('searchPanes - options - columns.searchPanes.order', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkHeadings(exp) {
		$('.dtsp-searchPane:visible input.dtsp-paneInputButton').each(function(i) {
			expect($(this).attr('placeholder')).toBe(exp[i]);
		});
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Default ordering', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			checkHeadings(['Position', 'Office', 'Age']);
		});

		dt.html('basic');
		it('Change the ordering', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					order: ['Age', 'Position', 'Office']
				}
			});

			checkHeadings(['Age', 'Position', 'Office']);
		});

		dt.html('basic');
		it('Renamed panes', function() {
			table = $('#example').DataTable({
				columnDefs: [
					{
						searchPanes: {
							name: 'ageTest'
						},
						targets: [3]
					}
				],
				dom: 'Pfrtip',
				searchPanes: {
					order: ['Position', 'ageTest', 'Office']
				}
			});

			checkHeadings(['Position', 'Age', 'Office']);
		});

		dt.html('basic');
		it('Custom panes', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					order: ['Position', 'Custom Filter', 'Age', 'Office'],
					panes: [
						{
							name: 'Custom Filter',
							header: 'Test Custom Filter',
							options: [
								{
									label: 'Accountants from Tokyo',
									value: function(rowData, rowIdx) {
										return rowData[1] === 'Accountant' && rowData[2] === 'Tokyo';
									}
								}
							]
						}
					]
				}
			});

			checkHeadings(['Position', 'Test Custom Filter', 'Age', 'Office']);
		});
	});
});
