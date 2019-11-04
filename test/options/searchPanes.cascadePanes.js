describe('searchPanes - options - searchPanes.cascadePanes', function() {
	let table;
	let clickEvent;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function checkArray(pane, array) {
		for (let i = 0; i < array.length; i++) {
			expect($('div.dtsp-searchPane:eq(' + pane + ') table tbody tr:eq(' + i + ') td:eq(1)').text()).toBe(
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
		expect($('div.dtsp-searchPane:eq(1) td.dtsp-countColumn').length).toBe(position);
		expect($('div.dtsp-searchPane:eq(2) td.dtsp-countColumn').length).toBe(office);
		expect($('div.dtsp-searchPane:eq(3) td.dtsp-countColumn').length).toBe(age);
	}

	describe('Functional tests - single items', function() {
		dt.html('basic');
		it('Check defaults (false)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: false
				}
			});

			checkRowCounts(33, 7, 33);
		});
		it('... clicking on row keeps all options', function() {
			$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(33, 7, 33);
		});

		dt.html('basic');
		it('Check true - basic single item selections', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true
				}
			});

			checkRowCounts(33, 7, 33);
		});
		it('... clicking on row removes options', function() {
			$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(33, 1, 2);
		});
		it('... clicking on second pane', function() {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(1, 1, 2);
		});
		it('... clicking on third pane', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(1, 1, 1);
		});
		it('... unclick third pane', async function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(1)').click();
			await dt.sleep(1000);
			checkRowCounts(1, 1, 2);
		});
		it('... unclick second pane', async function() {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(1)').click();
			await dt.sleep(1000);
			checkRowCounts(33, 1, 2);
		});
		it('... unclick second pane', async function() {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').click();
			await dt.sleep(1000);
			checkRowCounts(33, 7, 33);
		});
		// DD-1232 affects this - can't reinitialise the table - needed more importantly for viewtotal tests
		// });

		// describe('Functional tests - multiple items', function() {
		// dt.html('basic');
		// it('Check defaults (false)', function() {
		// 	table = $('#example').DataTable({
		// 		dom: 'Pfrtip',
		// 		searchPanes: {
		// 			cascadePanes: false
		// 		}
		// 	});

		// 	checkRowCounts(33, 7, 33);
		// });
		it('Clicking on option in first column', function() {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(33, 1, 2);
			checkCounts([2], [2], [1, 1]);
		});
		it('... and second option in first column', function() {
			clickEvent = $.Event('click');
			clickEvent.ctrlKey = true;
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(1)').trigger(clickEvent);

			checkRowCounts(33, 2, 3);
			checkCounts([2, 1], [1, 2], [1, 1, 1]);
		});
		it('... Clicking on option in second column', function() {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(2, 1, 3);
			checkCounts([1, 0], [1], [1, 1, 1]);
		});
		it('... and second option in second column', function() {
			clickEvent = $.Event('click');
			clickEvent.ctrlKey = true;
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(1)').trigger(clickEvent);

			checkRowCounts(2, 2, 3);
			checkCounts([1, 1], [1, 1], [1, 1, 1]);
		});
		it('... Clicking on option in third column', function() {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(1)').click();
			checkRowCounts(2, 2, 2);
			checkCounts([0, 1], [1, 1], [0, 1]);
		});
		it('... and second option in third column', function() {
			clickEvent = $.Event('click');
			clickEvent.ctrlKey = true;
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(1)').trigger(clickEvent);

			checkRowCounts(2, 2, 2);
			checkCounts([1, 1], [1, 1], [1, 1]);
		});
		it('... deselect second option in third column', async function() {
			clickEvent = $.Event('click');
			clickEvent.ctrlKey = true;
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(1)').trigger(clickEvent);

			await dt.sleep(1000);

			checkRowCounts(2, 2, 2);
			checkCounts([0, 1], [1, 1], [0, 1]);
		});
		// DD-1231 test disabled due to failure
		// it('... deselect first option in third column', async function() {
		// 	clickEvent = $.Event('click');
		// 	clickEvent.ctrlKey = true;
		// 	$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(1)').trigger(clickEvent);

		// 	await dt.sleep(1000);

		// 	checkRowCounts(2, 2, 3);
		// 	checkCounts([1, 1], [1, 1], [1, 1, 1]);
		// });
		// Carry on once DD-1231 resolved
	});

	// DD-1232 - viewtotal test - copy single and multiple from above.
	// describe('Functional tests - viewtotal', function() {
	// });
});
