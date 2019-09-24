describe('searchPanes - options - searchPanes.threshold', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkVisible(expected) {
		for (let i = 0; i < expected.length; i++) {
			expect(!$('div.dtsp-searchPane:eq(' + i + ')').hasClass('dtsp-hidden')).toBe(expected[i]);
		}
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (0.6)', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, true, true, true, false, false]);
		});

		dt.html('basic');
		it('Increase threshhold', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 1
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, true, true, true, true, true]);
		});

		dt.html('basic');
		it('Increased threshhold while forcing columns to be hidden', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 1
				},
				columnDefs: [{ targets: 0, searchPanes: { show: false } }]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, true, true, true, true, true]);
		});

		dt.html('basic');
		it('Decrease threshhold', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.2
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([false, false, true, false, false, false]);
		});

		dt.html('basic');
		it('Decreased threshhold while forcing columns to be visible', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.4
				},
				columnDefs: [{ targets: 0, searchPanes: { show: true } }]
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkVisible([true, false, true, false, false, false]);
		});

		dt.html('basic');
		it('Decrease threshhold so no panes present', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.1
				}
			});

			expect($('div.dtsp-panesContainer').length).toBe(0);
			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('empty');
		it('Some rows are all the same - before init', function() {
			for (let i = 0; i < 10; i++) {
				$('#example tbody').append(
					'<tr><td>AAA</td><td>' +
						(i % 6) +
						'</td><td>' +
						(i % 5) +
						'</td><td>' +
						(i % 4) +
						'</td><td>' +
						(i % 3) +
						'</td><td>' +
						(i % 2) +
						'</td></tr>'
				);
			}

			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.4
				}
			});

			checkVisible([false, false, false, true, true, true]);
		});

		dt.html('empty');
		it('Some rows are all the same - after init', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.4
				}
			});

			for (let i = 0; i < 10; i++) {
				table.row.add(['AAA', i % 6, i % 5, i % 4, i % 3, i % 2]);
			}

			table.draw().searchPanes.rebuildPane();

			checkVisible([false, false, false, true, true, true]);
		});

		dt.html('empty');
		it('Some rows are all the same - before init, with show', function() {
			for (let i = 0; i < 10; i++) {
				$('#example tbody').append(
					'<tr><td>AAA</td><td>' +
						(i % 6) +
						'</td><td>' +
						(i % 5) +
						'</td><td>' +
						(i % 4) +
						'</td><td>' +
						(i % 3) +
						'</td><td>' +
						(i % 2) +
						'</td></tr>'
				);
			}

			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.4
				},
				columnDefs: [
					{
						targets: 0,
						searchPanes: {
							show: true
						}
					}
				]
			});

			checkVisible([true, false, false, true, true, true]);
		});

		dt.html('empty');
		it('Some rows are all the same - after init, with show', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					threshold: 0.4
				},
				columnDefs: [
					{
						targets: 0,
						searchPanes: {
							show: true
						}
					}
				]
			});

			for (let i = 0; i < 10; i++) {
				table.row.add(['AAA', i % 6, i % 5, i % 4, i % 3, i % 2]);
			}

			table.draw().searchPanes.rebuildPane();

			checkVisible([true, false, false, true, true, true]);
		});
	});
});
