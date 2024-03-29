describe('searchPanes - integrations - Buttons', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'buttons', 'select', 'searchpanes'],
		css: ['datatables', 'buttons', 'select', 'searchpanes']
	});

	describe('Check the basic behaviour', function() {
		dt.html('basic');
		it('Can have a SeachPanes button', function() {
			$.fx.off = true; // disables lightbox animation

			table = $('#example').DataTable({
				buttons: ['searchPanes'],
				dom: 'Bfrtip'
			});

			expect($('button.dt-button').text()).toBe('SearchPanes');
			expect($('div.dt-button-collection').length).toBe(0);
		});
		it('... clicking the button opens the SearchPanes', async function() {
			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			expect($('div.dt-button-collection').length).toBe(1);
			expect($('div.dtsp-searchPane').length).toBe(6);
			expect($('div.dtsp-searchPane:not(.dtsp-hidden)').length).toBe(3);
			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0)').text()).toBe('Accountant2');
		});
		it('... clicking on a pane filters table immediately', async function() {
			await dt.searchPaneSelect(2, 3);
			expect($('#example tbody tr:eq(0) td:eq(0)').text()).toBe('Ashton Cox');
		});
		it('... can close panes', async function() {
			$('div.dt-button-background').click();

			expect($('div.dt-button-collection').length).toBe(0);
		});
		it('... button shows number of active filters', async function() {
			expect($('div.dt-button-collection').length).toBe(0);
			expect($('button.dt-button').text()).toBe('SearchPanes (1)');
		});
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Can have options in a SeachPanes button', function () {
			table = $('#example').DataTable({
				buttons: [
					{
						extend: 'searchPanes',
						config: {
							viewCount: false
						}
					}
				],
				dom: 'Bfrtip'
			});

			expect($('button.dt-button').text()).toBe('SearchPanes');
			expect($('div.dt-button-collection').length).toBe(0);
		});
		it('... clicking the button opens the SearchPanes', async function () {
			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			expect($('div.dtsp-searchPane:eq(1) tbody tr:eq(0) td:eq(0)').text()).toBe('Accountant');
		});

		dt.html('basic');
		it('Can have options in a SeachPanes button', function () {
			table = $('#example').DataTable({
				language: {
					searchPanes: {
						collapse: {0: 'Search 0', 1: 'Search 1 %d', _: 'Search other %d'}
					}
				},
				buttons: [ {
					extend: 'searchPanes',
					text: 'Search 0'
				} ],
				dom: 'Bfrtip'
			});

			expect($('button.dt-button').text()).toBe('Search 0');
		});
		it('... clicking the button opens the SearchPanes', async function () {
			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			expect($('button.dt-button').text()).toBe('Search 0');
		});
		it('... clicking one filter changes title', async function () {
			await dt.searchPaneSelect(1, 3);
			expect($('button.dt-button').text()).toBe('Search 1 1');
		});
		it('... clicking another filter changes title', async function () {
			await dt.searchPaneSelect(2, 3);
			expect($('button.dt-button').text()).toBe('Search other 2');
		});
		it('... clicking another filter changes title', async function () {
			await dt.searchPaneSelect(3, 3);
			expect($('button.dt-button').text()).toBe('Search other 3');
		});
		it('... closing keeps string', async function () {
			$('div.dt-button-background').click();
			expect($('button.dt-button').text()).toBe('Search other 3');
		});

		dt.html('basic');
		it('Paging is not changed when button opens', function () {
			table = $('#example').DataTable({
				buttons: ['searchPanes'],
				dom: 'Bfrtip'
			});

			table.page(2).draw(false);

			expect(table.page()).toBe(2);
		});
		it('... clicking the button opens the SearchPanes', async function () {
			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			expect($('div.dtsp-title').text()).toBe('Filters Active - 0');
		});
		it('... closing keeps paging as it was', async function () {
			expect(table.page()).toBe(2);
		});
	});
});
