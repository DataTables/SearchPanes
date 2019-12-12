describe('searchPanes - integrations - stateSave', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check selection', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();

			expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Edinburgh');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
		});
		it('... still same after reload', async function() {
			table = $('#example').DataTable({
                dom: 'Pfrtip',
                destroy: true,
				searchPanes: true,
				stateSave: true
			});

			await dt.sleep(500);

			expect($('div.dtsp-searchPane:eq(2) table tbody tr.selected td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Edinburgh');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Edinburgh');
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Cedric Kelly');
        });
        it('Test ordering', async function() {
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

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Technical Author');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('San Francisco');
        });
		it('... still same after reload', async function() {
			table = $('#example').DataTable({
                dom: 'Pfrtip',
                destroy: true,
				searchPanes: true,
				stateSave: true
			});

            await dt.sleep(500);
            
            $('div.dtsp-searchPane:eq(1) div.dtsp-topRow div.dtsp-buttonGroup button.dtsp-paneButton:eq(1)').click();
            $('div.dtsp-searchPane:eq(2) div.dtsp-topRow div.dtsp-buttonGroup button.dtsp-paneButton:eq(2)').click();

			expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('Technical Author');
			expect($('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0) span.dtsp-name:eq(0)').text()).toBe('San Francisco');
        });
        it('Test searching', async function() {
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

            expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val()).toBe('Developer');
			expect($('div.dtsp-searchPane:eq(1) table tbody tr').length).toBe(4);
        });
		it('... still same after reload', async function() {
			table = $('#example').DataTable({
                dom: 'Pfrtip',
                destroy: true,
				searchPanes: true,
				stateSave: true
			});

            await dt.sleep(500);
            
            $('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val('Developer');
            $('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').trigger('input');

            expect($('div.dtsp-searchPane:eq(1) div.dtsp-topRow input').val()).toBe('Developer');
			expect($('div.dtsp-searchPane:eq(1) table tbody tr').length).toBe(4);
        });
		// TK COLIN should add similar tests for custom panes
	});

	describe('stateSave when searchPanes not enables originally', function() {
		dt.html('basic');
		it('No searchPanes originally', function() {
			table = $('#example').DataTable({
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(0);
		});

		dt.html('basic');
		it('Add searchPanes', async function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: true,
				stateSave: true
			});

			expect($('div.dtsp-searchPane').length).toBe(6);
		});
		it('Tidy up', function() {
			table.state.clear();
		});
	});
});
