describe('searchPanes - options - columns.searchPanes.options', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Single pane - and condition', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					columns: [3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: 20,
									condition: '<'
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
									value: 60,
									condition: '>'
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
		it('Check label of function based options', function() {
			expect($('div.dtsp-searchPane tbody tr:eq(0) td:eq(0)').text()).toBe('20 to 30');
			expect($('div.dtsp-searchPane tbody tr:eq(0) td:eq(1)').text()).toBe('16');
		});
		it('Check label of condition based options', function() {
			expect($('div.dtsp-searchPane tbody tr:eq(4) td:eq(0)').text()).toBe('Over 60');
			expect($('div.dtsp-searchPane tbody tr:eq(4) td:eq(1)').text()).toBe('12');
		});
		it('Check filter of function based options', function() {
			$('div.dtsp-searchPane tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 16 entries (filtered from 57 total entries)');
		});
		it('Check filter of function based options - second selection', function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane tbody tr:eq(1) td:eq(0)').trigger(clickEvent);
			expect($('div.dataTables_info').text()).toBe('Showing 1 to 3 of 3 entries (filtered from 57 total entries)');
		});
		it('Check filter of condition based options', function() {
			$('div.dtsp-searchPane tbody tr:eq(4) td:eq(0)').click();
			// DD-1107
			// expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 12 entries (filtered from 57 total entries)')
		});
		it('Check filter of function based options - second selection', function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane tbody tr:eq(5) td:eq(0)').trigger(clickEvent);
			// DD-1107
			// expect($('div.dataTables_info').text()).toBe('Showing 0 to 0 of 0 entries (filtered from 57 total entries)')
		});

		dt.html('basic');
		it('Single pane - or condition', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					columns: [3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: 20,
									condition: '<'
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
									value: 60,
									condition: '>'
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
		it('Check filter of function based options', function() {
			$('div.dtsp-searchPane tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 16 entries (filtered from 57 total entries)');
		});
		it('Check filter of function based options - second selection', function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane tbody tr:eq(1) td:eq(0)').trigger(clickEvent);
			expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 25 entries (filtered from 57 total entries)');
		});
		it('Check filter of condition based options', function() {
			$('div.dtsp-searchPane tbody tr:eq(4) td:eq(0)').click();
			// DD-1107
			// expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 12 entries (filtered from 57 total entries)')
		});
		it('Check filter of function based options - second selection', function() {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			$('div.dtsp-searchPane tbody tr:eq(5) td:eq(0)').trigger(clickEvent);
			// DD-1107
			// expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 13 entries (filtered from 57 total entries)')
		});

		// DD-1108 TK COLIN performance here slows down hugely
		dt.html('basic');
		it('Two panes - and condition', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					columns: [2, 3]
				},
				columnDefs: [
					{
						searchPanes: {
							options: [
								{
									label: 'Under 20',
									value: 20,
									condition: '<'
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
									value: 60,
									condition: '>'
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
									value: 'Edinburgh',
									condition: '!='
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
		// TK COLIN complete these tests once dd-1107 completed.
		// it('Check label of function based options', function() {
		// 	expect($('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').text()).toBe('20 to 30');
		// 	expect($('div.dtsp-searchPanes tbody tr:eq(0) td:eq(1)').text()).toBe('16');
		// });
		// it('Check label of condition based options', function() {
		// 	expect($('div.dtsp-searchPanes tbody tr:eq(4) td:eq(0)').text()).toBe('Over 60');
		// 	expect($('div.dtsp-searchPanes tbody tr:eq(4) td:eq(1)').text()).toBe('12');
		// });
		// it('Check filter of function based options', function() {
		// 	$('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').click();
		// 	expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 16 entries (filtered from 57 total entries)');
		// });
		// it('Check filter of function based options - second selection', function() {
		// 	var clickEvent = $.Event('click');
		// 	clickEvent.shiftKey = true;
		// 	$('div.dtsp-searchPanes tbody tr:eq(1) td:eq(0)').trigger(clickEvent);
		// 	expect($('div.dataTables_info').text()).toBe('Showing 1 to 3 of 3 entries (filtered from 57 total entries)');
		// });
		// it('Check filter of condition based options', function() {
		// 	$('div.dtsp-searchPanes tbody tr:eq(4) td:eq(0)').click();
		// 	// DD-1107
		// 	// expect($('div.dataTables_info').text()).toBe('Showing 1 to 10 of 12 entries (filtered from 57 total entries)')
		// });
		// it('Check filter of function based options - second selection', function() {
		// 	var clickEvent = $.Event('click');
		// 	clickEvent.shiftKey = true;
		// 	$('div.dtsp-searchPanes tbody tr:eq(5) td:eq(0)').trigger(clickEvent);
		// 	// DD-1107
		// 	// expect($('div.dataTables_info').text()).toBe('Showing 0 to 0 of 0 entries (filtered from 57 total entries)')
		// });
	});
});
