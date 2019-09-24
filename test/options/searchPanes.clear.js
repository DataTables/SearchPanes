describe('searchPanes - options - searchPanes.clear', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		[{ dom: 'Sfrtip' }, { dom: 'Sfrtip', searchPanes: { clear: true } }].forEach(function(config) {
			dt.html('basic');
			it('Individual panes: ' + JSON.stringify(config), function() {
				table = $('#example').DataTable(config);

				expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow div.dtsp-subRows:eq(1) div.dtsp-buttonGroup button.dtsp-paneButton').length).toBe(3);
				expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow div.dtsp-subRows:eq(1) div.dtsp-buttonGroup button.dtsp-paneButton:eq(0)').text()).toBe('×');
				expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow div.dtsp-subRows:eq(1) div.dtsp-buttonGroup button.dtsp-paneButton:eq(0)').hasClass('dtsp-dull')).toBe(
					true
				);
			});
			it('... and the behaviour', async function() {
				$('div.dtsp-searchPane:eq(2) table tbody tr:eq(3) td:eq(0)').click();
				expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');

				$('div.dtsp-searchPane:eq(2) div.dtsp-topRow div.dtsp-buttonGroup button.dtsp-paneButton:eq(0)').click();

				await dt.sleep(100);

				expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			});
			it('Global clear', function() {
				expect($('button.dtsp-clearAll').length).toBe(1);
				expect($('button.dtsp-clearAll').text()).toBe('Clear All');
			});
			it('... and the behaviour', async function() {
				$('div.dtsp-searchPane:eq(2) table tbody tr:eq(3) td:eq(0)').click();
				expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');

				$('button.dtsp-clearAll').click();

				await dt.sleep(100);

				expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Airi Satou');
			});
		});

		dt.html('basic');
		it('Check false - individual panes', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip',
				searchPanes: {
					clear: false
				}
			});

			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow button.dtsp-paneButton').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow button.dtsp-paneButton:eq(1)').html()).toBe('🗛↕');
		});

		it('Check false - global clear', function() {
			expect($('button.dtsp-clearAll').length).toBe(0);
		});
	});
});
