describe('searchPanes - options - searchPanes', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			expect($('div.dtsp-panesContainer').text()).not.toBe('Loading Search Panes...');
			expect($('div.dtsp-searchPane').length).toBe(6);
		});

		dt.html('two_tables');
		it('Check defaults', function() {
			$('#example tbody tr:eq(2) td:eq(1)').text('1234567890123456789012345678901');
			table = $('table').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					threshold: 1
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(9);
		});
		it('... and can filter on first table', function() {
			$('#example_one_wrapper div.dtsp-searchPane:eq(2) tbody tr:eq(1) td:eq(0)').click();
			expect($('#example_one tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
		});
		it('... and can filter on second table', function() {
			$('#example_two_wrapper div.dtsp-searchPane:eq(1) tbody tr:eq(2) td:eq(0)').click();
			expect($('#example_two tbody tr:eq(0) td:eq(0)').text()).toBe('Milan');
		});
		it('... and clear only affects one table', async function() {
			$('#example_two_wrapper button.dtsp-clearAll').click();

			await dt.sleep(100);

			expect($('#example_one tbody tr:eq(0) td:eq(0)').text()).toBe('Angelica Ramos');
			expect($('#example_two tbody tr:eq(0) td:eq(0)').text()).toBe('Boston');
		});

		dt.html('basic');
		it('Destroy removes searchPanes', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			table.destroy();

			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('basic');
		it('Column visibility - pane remains visible', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			table.column(1).visible(false);
			table.searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Accountant'
			);
		});

		dt.html('empty');
		it('Change URL and reload table - searchPanes use new data', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/large.txt'
			});
			await dt.sleep(1000);
			table.ajax.url('/base/test/data/data.txt');
			table.ajax.reload();
			await dt.sleep(1000);

			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Edinburgh'
			);
		});
		it('... even after rebuild', function() {
			table.searchPanes.rebuildPane();

			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe(
				'Edinburgh'
			);
		});

		dt.html('empty');
		it('Load a table with searchPanes', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/data.txt',
				initComplete: function(settings, json) {
					done();
				}
			});
		});
		it('... three panes visible', async function() {
			await dt.sleep(1000);
			expect($('div.dtsp-searchPane:visible').length).toBe(3);
		});
		it('... select a row', function() {
			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(0) td:eq(0)').click();
			expect($('div.dtsp-searchPane:visible:eq(0) tr.selected span:eq(0)').text()).toBe('Accountant');
		});
		it('... still selected and three panes after ajax reload', async function() {
			table.ajax.reload();
			await dt.sleep(1000);

			expect($('div.dtsp-searchPane:visible').length).toBe(3);
			expect($('div.dtsp-searchPane:visible:eq(0) tr.selected span:eq(0)').text()).toBe('Accountant');
		});

		dt.html('empty');
		it('Load a table with searchPanes', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/data.txt',
				initComplete: function(settings, json) {
					done();
				}
			});
		});
		it('... three panes visible', async function() {
			await dt.sleep(1000);
			expect($('div.dtsp-searchPane:visible').length).toBe(3);
		});
		it('... select a row in middle pane', function() {
			$('div.dtsp-searchPane:visible:eq(1) tbody tr:eq(1) td:eq(0)').click();
			expect($('div.dtsp-searchPane:visible:eq(1) tr.selected span:eq(0)').text()).toBe('London');
		});
		it('... still three after and row selected an ajax reload', async function() {
			table.ajax.reload();
			await dt.sleep(1000);

			expect($('div.dtsp-searchPane:visible').length).toBe(3);
			expect($('div.dtsp-searchPane:visible:eq(1) tr.selected span:eq(0)').text()).toBe('London');
		});

		let reload = false;

		dt.html('empty');
		it('Load a table with searchPanes', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				columns: dt.getTestColumns(),
				ajax: {
					url: '/base/test/data/data.txt',
					dataSrc: function(json) {
						if (reload) {
							json.data.splice(4, 1);
						}
						return json.data;
					}
				},
				initComplete: function(settings, json) {
					done();
				}
			});
		});
		it('... three panes visible', async function() {
			await dt.sleep(1000);
			expect($('div.dtsp-searchPane:visible').length).toBe(3);
		});
		it('... select a row', function() {
			$('div.dtsp-searchPane:visible:eq(2) tbody tr:eq(9) td:eq(0)').click();
			expect($('div.dtsp-searchPane tr.selected').length).toBe(1);
			expect($('div.dtsp-searchPane:visible:eq(2) tr.selected span:eq(0)').text()).toBe('33');
		});
		it('... still three panes but no items selected after ajax reload removes line', async function() {
			reload = true;
			table.ajax.reload();
			await dt.sleep(1000);

			expect($('div.dtsp-searchPane:visible').length).toBe(3);
			expect($('div.dtsp-searchPane tr.selected').length).toBe(0);
		});

		dt.html('basic');
		it('Load a table with HTML with searchPanes', function () {
			$('#example tbody').append(
				'<tr><td>Aaa</td><td><span class=test>Bbb</span></td><td>2</td><td>3</td><td>4</td><td>5</td></tr>'
			);
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});
			expect(
				$(
					'div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0) span.dtsp-name:eq(0)'
				).text()
			).toBe('Bbb');
		});
	});
});
