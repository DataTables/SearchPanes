describe('searchPanes - options - searchPanes.panes.options.className', function() {
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
							header: 'Seniority',
							options: [
								{
									label: 'Junior',
									className: 'testJunior',
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Junior');
									}
								},
								{
									label: 'Senior',
									className: 'testSenior',
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Senior');
									}
								}
							],
						}
					]
				}
			});

			expect($('tr.testJunior').length).toBe(1);
			expect($('tr.testJunior span:eq(0)').text()).toBe('Junior');
			expect($('tr.testSenior').length).toBe(1);
			expect($('tr.testSenior span:eq(0)').text()).toBe('Senior');
		});
	});
});
