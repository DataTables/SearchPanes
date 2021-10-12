describe('searchPanes - integrations - stateSave', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	let table;

	describe('Functional tests', function() {
		dt.html('basic');

		function checkSelection() {
			expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Edinburgh'
			);
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Edinburgh'
			);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		}

		it('Check selection', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();

			checkSelection();
		});
		it('... still same after reload', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			checkSelection();

			done();
		});

		function checkTotals(pane, exp) {
			for (let i = 0; i < exp.length; i++) {
				expect(
					$('div.dtsp-searchPane:visible:eq(' + pane + ') table tbody tr:eq(' + i + ') span.dtsp-pill').text()
				).toBe(exp[i]);
			}
		}
		function checkCascades() {
			checkTotals(0, ['2 (6)']);
			checkTotals(1, ['1 (9)', '2 (12)', '1 (11)', '2 (14)']);
			checkTotals(2, ['1 (1)', '1 (2)']);
		}
		it('Test viewtotal and cascadePanes', async function(done) {
			table.state.clear();
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				},
				stateSave: true
			});

			await dt.sleep(500);

			$('div.dtsp-searchPane:visible:eq(0) table tbody tr:eq(26) td:eq(0)').click();
			$('div.dtsp-searchPane:visible:eq(1) table tbody tr:eq(1) td:eq(0)').click();

			await dt.sleep(500);

			checkCascades();

			done();
		});
		it('... still same after reload', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				},
				stateSave: true
			});


			await dt.sleep(500);

			checkCascades();

			done();
		});

		function checkOrdering() {
			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Technical Author'
			);
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'San Francisco'
			);
		}

		it('Test ordering', async function(done) {
			table.state.clear();
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			$('div.dtsp-searchPane:eq(1) div.dtsp-topRow div.dtsp-buttonGroup button.dtsp-paneButton:eq(1)').click();
			$('div.dtsp-searchPane:eq(2) div.dtsp-topRow div.dtsp-buttonGroup button.dtsp-paneButton:eq(2)').click();

			checkOrdering();

			done();
		});

		it('... still same after reload', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			checkOrdering();

			done();
		});

		function checkSearch() {
			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val()).toBe('Developer');
			expect($('div.dtsp-searchPane:eq(1) table tbody tr').length).toBe(4);
		}

		it('Test searching', async function(done) {
			table.state.clear();
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			$('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val('Developer');
			$('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').trigger('input');

			checkSearch();

			done();
		});

		it('... still same after reload', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			checkSearch();

			done();
		});

		function checkCustom() {
			expect($('div.dtsp-searchPane:visible:eq(3) table tbody tr:eq(0)').hasClass('selected')).toBe(true);
			expect($('#example tbody tr').length).toBe(2);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			expect($('#example tbody tr:eq(1) td:eq(0)').text()).toBe('Garrett Winters');
		}

		it('Test custom panes', async function(done) {
			table.state.clear();
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: {
					panes: [
						{
							name: 'Custom',
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
				},
				stateSave: true
			});

			await dt.sleep(500);

			$('div.dtsp-searchPane:visible:eq(3) table tbody tr:eq(0) td:eq(0)').click();

			await dt.sleep(500);

			checkCustom();

			done();
		});
		it('... still same after reload', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				destroy: true,
				searchPanes: {
					panes: [
						{
							name: 'Custom',
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
				},
				stateSave: true
			});

			await dt.sleep(500);

			checkCustom();

			done();
		});
		it('Tidy up', function() {
			table.state.clear();
		});
	});

	describe('stateSave when searchPanes not enabled originally', function() {
		dt.html('basic');
		it('No searchPanes originally', function() {
			table = $('#example').DataTable({
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('basic');
		it('Add searchPanes', async function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(6);

			done();
		});
		it('Tidy up', function() {
			table.state.clear();
		});
	});
});
