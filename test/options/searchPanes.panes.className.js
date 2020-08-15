describe('searchPanes - options - searchPanes.panes.className', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Confirm classes are present for custom panes', function() {
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
							className: 'testcustom',
							options: [
								{
									label: 'test cox',
									value: function(rowData, rowIdx) {
										return rowData[2] === 'San Francisco' && rowData[3] === '66';
									}
								}
							]
						}
					]
				}
			});

			expect($('div.dtsp-searchPane:eq(6)').hasClass('testcustom')).toBe(true);
		});
	});
});
