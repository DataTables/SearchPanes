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
				dom: 'Sfrtip'
			});
			expect(typeof table.searchPanes.rebuildPane).toBe('function');
		});
		it('Returns a string', function() {
			// DD-1111
			// expect(typeof table.searchPanes.rebuildPane() instanceof $.fn.dataTable.Api).toBe(true);;
		});
	});

	function checkTopRows(position, office, age) {
		expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(1)').text()).toBe(position);
		expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(1)').text()).toBe(office);
		expect($('div.dtsp-searchPane:eq(3) tbody tr:eq(0) td:eq(1)').text()).toBe(age);
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true
			});

			checkTopRows('2', '9', '1')
		});
		it('Add row - no change before rebuild', function() {
			table.row.add(['AAA', 'Accountant', 'Edinburgh', '19', '2019/09/07', '$99,999']).draw();
			checkTopRows('2', '9', '1')
		});
		it('Rebuild gets new values', function() {
			table.searchPanes.rebuildPane();
			checkTopRows('3', '10', '2')
		});
		it('Add row - rebuild single pane', function() {
			table.row.add(['AAA', 'Accountant', 'Edinburgh', '19', '2019/09/07', '$99,999']).draw();
			table.searchPanes.rebuildPane(2);
			checkTopRows('3', '11', '2')
		});
		it('Rebuild the other panes', function() {
			table.searchPanes.rebuildPane();
			checkTopRows('4', '11', '3')
		});

		dt.html('empty');
		it('Ajax call', function(done) {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true,
				columns: dt.getTestColumns(),
				ajax: '/base/test/data/data.txt',
				initComplete: function(settings, json) {
					table.searchPanes.rebuildPane();
					done();
				}
			});
		});
	});
});
