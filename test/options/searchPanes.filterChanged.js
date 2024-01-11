describe('searchPanes - options - searchPanes.filterChanged', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes'],
	});

	describe('Check the defaults', function () {
		dt.html('basic');
		it('One arguments passed', function () {
			let called = false;
			$('#example').dataTable({
				searchPanes: {
					filterChanged: function (count) {
						called = true;
						expect(arguments.length).toBe(1);
						expect(typeof arguments[0]).toBe('number');
					},
				},
			});
			expect(called).toBe(true);
		});
	});

	describe('Functional tests', function () {
		let count;

		dt.html('basic');
		it('Change the default', function () {
			$('#example tbody tr:eq(2) td:eq(2)').text('');
			table = $('#example').DataTable({
				searchPanes: {
					filterChanged: function (c) {
						count = c;
					},
				},
				dom: 'Pfrtip',
			});

			expect(count).toBe(0);
		});
		it('Single selection', async function () {
			await dt.searchPaneSelect(2, 1);
			expect(count).toBe(1);
		});
		it('Second selection', async function () {
			await dt.searchPaneSelect(3, 1);
			expect(count).toBe(2);
		});
		it('Third selection - two in same pane', async function () {
			var clickEvent = $.Event('click');
			clickEvent.shiftKey = true;
			await dt.searchPaneSelect(3, 2, clickEvent);
			expect(count).toBe(3);
		});
	});
});
