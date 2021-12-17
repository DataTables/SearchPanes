describe('searchPanes - options - searchPanes.preSelect', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (undefined)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			expect($('tr.selected').length).toBe(0);
		});

		dt.html('basic');
		it('Setup some preSelects', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					preSelect:[
						{
							column: 1,
							rows: ['Not there']
						},
						{
							column: 2,
							rows: ['New York', 'San Francisco']
						},
						{
							column: 3,
							rows: ['66', 'Not there']
						}
					]
				}
			});

			expect($('tr.selected').length).toBe(3);
		});
		it('When just an absent value', function() {
			expect($('div.dtsp-searchPane:eq(1) tr').length).toBe(35);
			expect($('div.dtsp-searchPane:eq(1) tr.selected').length).toBe(0);
		});
		it('When all present values', function() {
			expect($('div.dtsp-searchPane:eq(2) tr').length).toBe(9);
			expect($('div.dtsp-searchPane:eq(2) tr.selected').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(2) tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('New York');
			expect($('div.dtsp-searchPane:eq(2) tr.selected:eq(1) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'San Francisco'
			);
		});
		it('When absent and present values', function() {
			expect($('div.dtsp-searchPane:eq(3) tr').length).toBe(35);
			expect($('div.dtsp-searchPane:eq(3) tr.selected').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(3) tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('66');
		});
		it('Ensure search performed', function() {
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('Ensure selections not fixed', function() {
			$('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:eq(2) tr.selected').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(2) tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Edinburgh');
		});
		it('Ensure search performed', function() {
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('No matching records found');
		});

		dt.html('basic');
		it('Confirm with cascadePanes in single pane', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					preSelect: [
						{
							column: 2,
							rows: ['New York', 'San Francisco']
						}
					]
				}
			});

			expect($('div.dtsp-searchPane:eq(2) tr').length).toBe(9);
			expect($('div.dtsp-searchPane:eq(2) tr.selected').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(2) tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('New York');
			expect($('div.dtsp-searchPane:eq(2) tr.selected:eq(1) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'San Francisco'
			);
		});

		dt.html('basic');
		it('Confirm with cascadePanes - two preSelects', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					preSelect: [
						{
							column: 2,
							rows: ['New York', 'San Francisco']
						},
						{
							column: 3,
							rows:['66']
						}
					]
				}
			});
		});
		it('First - now not showing all values', function() {
			expect($('div.dtsp-searchPane:eq(2) .dataTables_scrollBody tbody tr').length).toBe(2);
			expect($('div.dtsp-searchPane:eq(2) .dataTables_scrollBody tbody tr.selected').length).toBe(2);
			expect(
				$(
					'div.dtsp-searchPane:eq(2) .dataTables_scrollBody tbody tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)'
				).text()
			).toBe('New York');
			expect(
				$(
					'div.dtsp-searchPane:eq(2) .dataTables_scrollBody tbody tr.selected:eq(1) td:eq(0) span.dtsp-name:eq(0)'
				).text()
			).toBe('San Francisco');
		});
		it('Second - showing all values', function() {
			expect($('div.dtsp-searchPane:eq(3) .dataTables_scrollBody tbody tr').length).toBe(21);
			expect($('div.dtsp-searchPane:eq(3) .dataTables_scrollBody tbody tr.selected').length).toBe(1);
			expect($('div.dtsp-searchPane:eq(3) .dataTables_scrollBody tbody tr.selected:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('66');
		});
	
		dt.html('basic');
		it('Custom Panes - Pre-select first entry', function() {
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
							]
						}
					],
					preSelect: [
						{
							column: 6,
							rows: ['Junior']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});

		dt.html('basic');
		it('Custom Panes - Pre-select second entry', function() {
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
							]
						}
					],
					preSelect: [
						{
							column: 6,
							rows: ['Senior']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});

		dt.html('basic');
		it('Custom Panes - Pre-select from two panes', function() {
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
							]
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
							]
						}
					],
					preSelect: [
						{
							column: 6,
							rows: ['Senior']
						},
						{
							column: 7,
							rows: ['L']
						}
					]
				}
			});

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Haley Kennedy');
		});
	});
});
