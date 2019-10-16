describe('searchPanes - options - searchPanes.panes.header', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Two custom panes with no standard panes', function() {
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
						},
						{
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

			expect($('div.dtsp-searchPane:not(.dtsp-hidden)').length).toBe(2);
			expect($('div.dtsp-searchPane table tbody tr').length).toBe(3);
		});
		it('Default header present', function() {
			expect($('div.dtsp-searchPane:not(.dtsp-hidden):eq(1) div.dtsp-topRow input').attr('placeholder')).toBe(
				'Custom Pane'
			);
		});
		it('Custom header present', function() {
			expect($('div.dtsp-searchPane:not(.dtsp-hidden):eq(0) div.dtsp-topRow input').attr('placeholder')).toBe(
				'unittest header'
			);
		});
	});
});
