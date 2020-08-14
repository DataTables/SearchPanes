describe('searchPanes - options - searchPanes.panes.preSelect', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Pre-select first entry', function() {
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
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Junior');
									}
								},
								{
									label: 'Senior',
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Senior');
									}
								}
							],
							preSelect: ['Junior']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});

		dt.html('basic');
		it('Pre-select second entry', function() {
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
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Junior');
									}
								},
								{
									label: 'Senior',
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Senior');
									}
								}
							],
							preSelect: ['Senior']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});

		dt.html('basic');
		it('Pre-select from two panes', function() {
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
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Junior');
									}
								},
								{
									label: 'Senior',
									value: function(rowData, rowIdx) {
										return rowData[1].includes('Senior');
									}
								}
							],
							preSelect: ['Senior']
						},
						{
							header: 'Contains L',
							options: [
								{
									label: 'L',
									value: function(rowData, rowIdx) {
										return rowData[2].includes('L');
									}
								}
							],
							preSelect: ['L']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Haley Kennedy');
		});
	});
});
