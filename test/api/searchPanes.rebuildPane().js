describe('searchPanes - api - searchPanes.rebuildPane()', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Check the defaults', function() {
		dt.html('basic');
		it('Exists and is a function', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});
			expect(typeof table.searchPanes.rebuildPane).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.searchPanes.rebuildPane() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	function checkTopRows(position, office, age, custom = undefined) {
		expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0) span.dtsp-pill').text()).toBe(position);
		expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0) span.dtsp-pill').text()).toBe(office);
		expect($('div.dtsp-searchPane:eq(3) tbody tr:eq(0) td:eq(0) span.dtsp-pill').text()).toBe(age);

		if (custom !== undefined) {
			expect($('div.dtsp-searchPane:eq(6) tbody tr:eq(0) td:eq(0) span.dtsp-pill').text()).toBe(custom);
		}
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
			checkTopRows('2', '9', '1');
		});
		it('Add row - no change before rebuild', function() {
			table.row.add(['AAA', 'Accountant', 'Edinburgh', '19', '2019/09/07', '$99,999']).draw();
			checkTopRows('2', '9', '1');
		});
		it('Rebuild gets new values', function() {
			table.searchPanes.rebuildPane();
			checkTopRows('3', '10', '2');
		});
		it('Add row - rebuild single pane', function() {
			table.row.add(['AAA', 'Accountant', 'Edinburgh', '19', '2019/09/07', '$99,999']).draw();
			table.searchPanes.rebuildPane(2);
			checkTopRows('3', '11', '2');
		});
		it('Rebuild the other panes', function() {
			table.searchPanes.rebuildPane();
			checkTopRows('4', '11', '3');
		});
		it('Can still click buttons in pane after the rebuild', function() {
			$('.dtsp-searchPane:visible:eq(1) button.dtsp-nameButton').click();
			checkTopRows('4', '5', '3');
		});

		dt.html('basic');
		it('Select an item in the searchPane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			await dt.searchPaneSelect(3, 32);

			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected td:eq(0)').text()).toBe('662');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('Rebuild pane without keeping selection', function() {
			table.searchPanes.rebuildPane();

			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected').length).toBe(0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			expect($('#example tbody tr').length).toBe(10);
		});

		dt.html('basic');
		it('Select an item in the searchPane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			await dt.searchPaneSelect(3, 32);

			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected td:eq(0)').text()).toBe('662');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('Rebuild pane when one pane vanishes without keeping selection', function() {
			table
				.rows([1, 2, 6])
				.remove()
				.draw();

			table.searchPanes.rebuildPane();

			expect($('.dtsp-searchPane:visible:eq(2)').length).toBe(0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			expect($('#example tbody tr').length).toBe(10);
		});

		dt.html('basic');
		it('Select an item in the searchPane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			await dt.searchPaneSelect(3, 32);

			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected td:eq(0)').text()).toBe('662');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('Rebuild pane while keeping selection', async function() {
			table.searchPanes.rebuildPane(undefined, true);
			await dt.sleep(50);

			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected').length).toBe(1);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
			expect($('#example tbody tr').length).toBe(2);
		});

		dt.html('basic');
		it('Select an item in the searchPane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			await dt.searchPaneSelect(3, 32);
			expect($('.dtsp-searchPane:visible:eq(2) tbody tr.selected td:eq(0)').text()).toBe('662');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('Rebuild pane when one pane vanishes while keeping selection', function() {
			table
				.rows([1, 2, 6])
				.remove()
				.draw();

			table.searchPanes.rebuildPane(undefined, true);

			expect($('.dtsp-searchPane:visible:eq(2)').length).toBe(0);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			expect($('#example tbody tr').length).toBe(10);
		});

		dt.html('basic');
		it('Select two items in the searchPane', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true
			});

			await dt.searchPaneSelect(3, 32);
			await dt.searchPaneSelect(1, 15);

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Michael Silva');
		});
		it('Rebuild pane when one pane vanishes while keeping selection', async function() {
			table
				.rows([1, 2, 6])
				.remove()
				.draw();

			table.searchPanes.rebuildPane(undefined, true);
			await dt.sleep(50);

			expect($('.dtsp-searchPane:visible:eq(2)').length).toBe(0);
			expect($('.dtsp-searchPane:visible:eq(0) tbody tr.selected td:eq(0)').text()).toBe('Marketing Designer2');

			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Michael Silva');
			expect($('#example tbody tr:eq(1) td:eq(0)').text()).toBe('Unity Butler');
			expect($('#example tbody tr').length).toBe(2);
		});

		dt.html('basic');
		it('Table with a custom pane', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					panes: [
						{
							header: 'unittest header',
							options: [
								{
									label: 'unittest',
									value: function(rowData, rowIdx) {
										return rowData[2] === 'San Francisco' && rowData[3] === '66';
									}
								}
							]
						}
					]
				}
			});

			expect($('div.dtsp-searchPane').length).toBe(7);
			expect($('div.dtsp-searchPane:eq(6) tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('unittest');
			checkTopRows('2', '9', '1', '1');
		});
		it('Add a row - no changed', function() {
			table.row.add(['AAA', 'Accountant', 'San Francisco', '66', '2019/09/07', '$99,999']).draw();
			checkTopRows('2', '9', '1', '1');
		});
		it('Rebuild custom pane - confirm update', function() {
			table.searchPanes.rebuildPane(6);
			checkTopRows('2', '9', '1', '2');
		});
		it('Rebuild all other panes - confirm updates', function() {
			table.searchPanes.rebuildPane();
			checkTopRows('3', '9', '1', '2');
		});

		dt.html('empty');
		it('Ajax call - panes present initially', function(done) {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/data.txt',
				initComplete: function(settings, json) {
					expect($('div.dtsp-searchPane').length).toBe(6);
					done();
				}
			});
		});
		it('Rebuild the panes', function() {
			table.searchPanes.rebuildPane();
			expect($('div.dtsp-searchPane').length).toBe(6);
			checkTopRows('2', '9', '1');
		});
	});
});
