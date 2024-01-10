describe('searchPanes - options - columns.searchPanes.options', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Single pane - "and" combiner', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					columns: [3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: function(rowData, rowIdx) {
										return rowData[3] < 20;
									}
								},
								{
									label: '20 to 30',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 30 && rowData[3] >= 20;
									}
								},
								{
									label: '30 to 40',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 40 && rowData[3] >= 30;
									}
								},
								{
									label: '40 to 50',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 50 && rowData[3] >= 40;
									}
								},
								{
									label: '50 to 60',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 60 && rowData[3] >= 50;
									}
								},
								{
									label: 'Over 60',
									value: function(rowData, rowIdx) {
										return rowData[3] > 60;
									}
								}
							],
							combiner: 'and'
						},
						targets: [3]
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(1);
			expect($('div.dtsp-searchPane tbody tr').length).toBe(6);
		});
		it('Check label of options', function() {
			expect($('div.dtsp-searchPane tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('20 to 30');
			expect($('div.dtsp-searchPane tbody tr:eq(0) td:eq(0) span.dtsp-pill:eq(0)').text()).toBe('16');
		});
		it('Check filter of options', async function() {
			await dt.searchPaneSelect(0, 0);
			expect($('div.dt-info').text()).toBe('Showing 1 to 10 of 16 entries (filtered from 57 total entries)');
		});
		it('Check filter of options - second selection', async function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			await dt.searchPaneSelect(0, 1, clickEvent);
			expect($('div.dt-info').text()).toBe('Showing 1 to 3 of 3 entries (filtered from 57 total entries)');
		});

		dt.html('basic');
		it('Single pane - "or" combiner', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					columns: [3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: function(rowData, rowIdx) {
										return rowData[3] < 20;
									}
								},
								{
									label: '20 to 30',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 30 && rowData[3] >= 20;
									}
								},
								{
									label: '30 to 40',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 40 && rowData[3] >= 30;
									}
								},
								{
									label: '40 to 50',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 50 && rowData[3] >= 40;
									}
								},
								{
									label: '50 to 60',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 60 && rowData[3] >= 50;
									}
								},
								{
									label: 'Over 60',
									value: function(rowData, rowIdx) {
										return rowData[3] > 60;
									}
								}
							],
							combiner: 'or'
						},
						targets: [3]
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(1);
			expect($('div.dtsp-searchPane tbody tr').length).toBe(6);
		});
		it('Check filter of options', async function() {
			await dt.searchPaneSelect(0, 0);
			expect($('div.dt-info').text()).toBe('Showing 1 to 10 of 16 entries (filtered from 57 total entries)');
		});
		it('Check filter of options - second selection', async function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			await dt.searchPaneSelect(0, 1, clickEvent);
			expect($('div.dt-info').text()).toBe('Showing 1 to 10 of 25 entries (filtered from 57 total entries)');
		});

		dt.html('basic');
		it('Two panes - "and" combiner', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					columns: [2, 3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: function(rowData, rowIdx) {
										return rowData[3] < 20;
									}
								},
								{
									label: '20 to 30',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 30 && rowData[3] >= 20;
									}
								},
								{
									label: '30 to 40',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 40 && rowData[3] >= 30;
									}
								},
								{
									label: '40 to 50',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 50 && rowData[3] >= 40;
									}
								},
								{
									label: '50 to 60',
									value: function(rowData, rowIdx) {
										return rowData[3] <= 60 && rowData[3] >= 50;
									}
								},
								{
									label: 'Over 60',
									value: function(rowData, rowIdx) {
										return rowData[3] > 60;
									}
								}
							],
							combiner: 'and'
						},
						targets: [3]
					},
					{
						searchPanes: {
							options: [
								{
									label: 'Not Edinburgh',
									value: function(rowData, rowIdx) {
										return rowData[2] !== 'Edinburgh';
									}
								},
								{
									label: 'Not London',
									value: function(rowData, rowIdx) {
										return rowData[2] !== 'London';
									}
								}
							]
						},
						targets: [2]
					}
				]
			});

			expect($('div.dtsp-searchPane').length).toBe(2);
			expect($('div.dtsp-searchPane tbody tr').length).toBe(8);
		});
		it('Check filter options', async function() {
			await dt.searchPaneSelect(0, 0);
			expect($('div.dt-info').text()).toBe('Showing 1 to 10 of 48 entries (filtered from 57 total entries)');
		});
		it('Check filter options - second selection', async function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			await dt.searchPaneSelect(0, 1, clickEvent);
			expect($('div.dt-info').text()).toBe('Showing 1 to 10 of 57 entries');
		});
	});
});
