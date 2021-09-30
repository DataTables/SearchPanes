describe('searchPanes - options - searchPanes.cascadePanes', function () {
	let table;
	let clickEvent;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkArray(pane, array) {
		for (let i = 0; i < array.length; i++) {
			expect($('div.dtsp-searchPane:eq(' + pane + ') table tbody tr:eq(' + i + ') td:eq(0) span.dtsp-pill').text()).toBe(
				array[i].toString()
			);
		}
	}

	function checkCounts(positionArray, officeArray, ageArray) {
		checkArray(1, positionArray);
		checkArray(2, officeArray);
		checkArray(3, ageArray);
	}

	function checkRowCounts(position, office, age) {
		expect($('div.dtsp-searchPane:eq(1) td.dtsp-nameColumn span.dtsp-pill').length).toBe(position);
		expect($('div.dtsp-searchPane:eq(2) td.dtsp-nameColumn span.dtsp-pill').length).toBe(office);
		expect($('div.dtsp-searchPane:eq(3) td.dtsp-nameColumn span.dtsp-pill').length).toBe(age);
	}

	function getClickEvent() {
		clickEvent = $.Event('click');
		clickEvent.ctrlKey = true;

		return clickEvent;
	}

	describe('Functional tests - single items', function () {
	// 	dt.html('basic');
	// 	it('Check defaults (false)', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: false
	// 			}
	// 		});

	// 		checkRowCounts(33, 7, 33);
	// 	});
	// 	it('... clicking on row keeps all options', function () {
	// 		$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(33, 7, 33);
	// 	});

	// 	dt.html('basic');
	// 	it('Check true - basic single item selections', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: true
	// 			}
	// 		});

	// 		checkRowCounts(33, 7, 33);
	// 	});
	// 	it('... clicking on row removes options', function () {
	// 		$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(33, 1, 2);
	// 	});
	// 	it('... clicking on second pane', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(1, 1, 2);
	// 	});
	// 	it('... clicking on third pane', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(1, 1, 1);
	// 	});
	// 	it('... unclick third pane', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(1, 1, 2);
	// 	});
	// 	it('... unclick second pane', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 1, 2);
	// 	});
	// 	it('... unclick second pane', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 7, 33);
	// 	});
	// 	it('reset', function () {
	// 		table.destroy();
	// 	});
	// });

	// describe('Functional tests - multiple items', function () {
	// 	dt.html('basic');
	// 	it('Check defaults (false)', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: true
	// 			},
	// 			initComplete: function () {}
	// 		});

	// 		checkRowCounts(33, 7, 33);
	// 	});
	// 	it('Clicking on option in first column', function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], [2], [1, 1]);
	// 	});
	// 	it('... and second option in first column', function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(33, 2, 3);
	// 		checkCounts([2, 1], [1, 2], [1, 1, 1]);
	// 	});
	// 	it('... Clicking on option in second column', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(2, 1, 3);
	// 		checkCounts([1, 0], [1], [1, 1, 1]);
	// 	});
	// 	it('... and second option in second column', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(2, 2, 3);
	// 		checkCounts([1, 1], [1, 1], [1, 1, 1]);
	// 	});
	// 	it('... Clicking on option in third column', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts([0, 1], [1, 1], [0, 1]);
	// 	});
	// 	it('... and second option in third column', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts([1, 1], [1, 1], [1, 1]);
	// 	});
	// 	it('... deselect second option in third column', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts([0, 1], [1, 1], [0, 1]);
	// 	});
	// 	it('... deselect first option in third column', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 2, 3);
	// 		checkCounts([1, 1], [1, 1], [1, 1, 1]);
	// 	});
	// 	it('... deselect second option in second column', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 1, 3);
	// 		checkCounts([1, 0], [1], [1, 1, 1]);
	// 	});
	// 	it('... deselect first option in second column', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 2, 3);
	// 		checkCounts([2, 1], [1, 2], [1, 1, 1]);
	// 	});
	// 	it('... deselect second option in first column', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], [2], [1, 1]);
	// 	});
	// 	it('... deselect first option in first column', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 7, 33);
	// 		checkCounts([2], [9], [1]);
	// 	});
	// });

	// describe('Functional tests - viewtotal - single items', function () {
	// 	dt.html('basic');
	// 	it('Check true - basic single item selections', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: true,
	// 				viewTotal: true
	// 			}
	// 		});

	// 		checkRowCounts(33, 7, 33);
	// 		checkCounts([2], [9], [1]);
	// 	});
	// 	it('... clicking on row removes options', function () {
	// 		$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], ['2 (5)'], ['1 (1)']);
	// 	});
	// 	it('... clicking on second pane', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(1, 1, 2);
	// 		checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
	// 	});
	// 	it('... clicking on third pane', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(1, 1, 1);
	// 		checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
	// 	});
	// 	it('... unclick third pane', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(1, 1, 2);
	// 		checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
	// 	});
	// 	it('... unclick second pane', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], ['2 (5)'], ['1 (1)']);
	// 	});
	// 	it('... unclick first pane', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 7, 33);
	// 		checkCounts([2], [9], [1]);
	// 	});
	// });

	// describe('Functional tests - viewtotal - multiple items', function () {
	// 	dt.html('basic');
	// 	it('Check defaults (false)', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: true,
	// 				viewTotal: true
	// 			}
	// 		});
	// 		checkRowCounts(33, 7, 33);
	// 		checkCounts([2], [9], [1]);
	// 	});
	// 	it('Clicking on option in first column', function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], ['2 (5)'], ['1 (1)']);
	// 	});
	// 	it('... and second option in first column', function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(33, 2, 3);
	// 		checkCounts([2], ['1 (12)'], ['1 (1)']);
	// 	});
	// 	it('... Clicking on option in second column', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(2, 1, 3);
	// 		checkCounts(['1 (2)', '0 (1)'], ['1 (5)'], ['1 (1)']);
	// 	});
	// 	it('... and second option in second column', function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(2, 2, 3);
	// 		checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
	// 	});
	// 	it('... Clicking on option in third column', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts(['0 (2)', '1 (1)'], ['1 (12)'], ['0 (1)']);
	// 	});
	// 	it('... and second option in third column', function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
	// 	});
	// 	it('... deselect second option in third column', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 2, 2);
	// 		checkCounts(['0 (2)', '1 (1)'], ['1 (12)'], ['0 (1)']);
	// 	});
	// 	it('... deselect first option in third column', async function () {
	// 		$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 2, 3);
	// 		checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
	// 	});
	// 	it('... deselect second option in second column', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(2, 1, 3);
	// 		checkCounts(['1 (2)', '0 (1)'], ['1 (5)'], ['1 (1)']);
	// 	});
	// 	it('... deselect first option in second column', async function () {
	// 		$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 2, 3);
	// 		checkCounts([2], ['1 (12)'], ['1 (1)']);
	// 	});
	// 	it('... deselect second option in first column', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 1, 2);
	// 		checkCounts([2], ['2 (5)'], ['1 (1)']);
	// 	});
	// 	it('... deselect first option in first column', async function () {
	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		await dt.sleep(500);
	// 		checkRowCounts(33, 7, 33);
	// 		checkCounts([2], [9], [1]);
	// 	});
	// });

	// describe('Functional tests - Odds and ends', function () {
	// 	dt.html('basic');
	// 	it('Select a row in each SearchPane', function () {
	// 		table = $('#example').DataTable({
	// 			dom: 'Pfrtip',
	// 			searchPanes: {
	// 				cascadePanes: true,
	// 				viewTotal: true
	// 			}
	// 		});

	// 		$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();
	// 		$('div.dtsp-searchPane:visible:eq(1) tbody tr:eq(0) td:eq(0)').click();
	// 		$('div.dtsp-searchPane:visible:eq(2) tbody tr:eq(0) td:eq(0)').click();

	// 		expect($('tr.selected').length).toBe(3);
	// 	});
	// 	it('Clear all clears everything', function () {
	// 		$('button.dtsp-clearAll').click();

	// 		expect($('tr.selected').length).toBe(0);
	// 	});
	});
});
