describe('searchPanes - api - searchPanes.clearSelections()', function() {
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
		it('Returns an API instance', function() {
			expect(table.searchPanes.rebuildPane() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	function checkTopRows(position, office, age, custom = undefined) {
		expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(1)').text()).toBe(position);
		expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(1)').text()).toBe(office);
		expect($('div.dtsp-searchPane:eq(3) tbody tr:eq(0) td:eq(1)').text()).toBe(age);

		if (custom !== undefined) {
			expect($('div.dtsp-searchPane:eq(6) tbody tr:eq(0) td:eq(1)').text()).toBe(custom);
		}
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Select single pane', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: true
			});

			$('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').click();

			expect($('div.dtsp-searchPanes tbody tr.selected').length).toBe(1);
		});
		it('... and clear it', function() {
			table.searchPanes.clearSelections();
			expect($('div.dtsp-searchPanes tbody tr.selected').length).toBe(0);
		});
		it('Select two panes', function() {
			$('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0)').click();
			$('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').click();

			expect($('div.dtsp-searchPanes tbody tr.selected').length).toBe(2);
		});
		it('... and clear them', function() {
			table.searchPanes.clearSelections();
			expect($('div.dtsp-searchPanes tbody tr.selected').length).toBe(0);
		});
		it('Change order', function() {
			$('div.dtsp-searchPanes div.dtsp-buttonGroup button:eq(1)').click();

			expect($('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').text()).toBe('Technical Author');
		});
		it('... and it remains', function() {
			table.searchPanes.clearSelections();
			expect($('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').text()).toBe('Technical Author');
		});
		it('Search in the pane', function() {
			$('div.dtsp-searchPane:eq(2) input').val('London');
			$('div.dtsp-searchPane:eq(2) input').trigger('input');

			expect($('div.dtsp-searchPane:eq(2) tbody tr:eq(0) td:eq(0)').text()).toBe('London');
		});
		it('... and it remains', function() {
			table.searchPanes.clearSelections();
			expect($('div.dtsp-searchPanes tbody tr:eq(0) td:eq(0)').text()).toBe('Technical Author');
		});
	});
});
