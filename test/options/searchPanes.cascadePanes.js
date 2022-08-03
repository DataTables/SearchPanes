describe('searchPanes - options - searchPanes.cascadePanes', function () {
	let table;
	let clickEvent;

	dt.libs({
		js: ['jquery', 'datatables', 'buttons', 'select', 'searchpanes'],
		css: ['datatables', 'buttons', 'select', 'searchpanes']
	});

	function checkArray(pane, array) {
		for (let i = 0; i < array.length; i++) {
			expect(
				$('div.dtsp-searchPane:eq(' + pane + ') table tbody tr:eq(' + i + ') td:eq(0) span.dtsp-pill').text()
			).toBe(array[i].toString());
		}
	}

	function checkCounts(positionArray, officeArray, ageArray) {
		checkArray(1, positionArray);
		checkArray(2, officeArray);
		checkArray(3, ageArray);
	}

	async function checkRowCounts(position, office, age) {
		await dt.sleep(100);
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
		dt.html('basic');
		it('Check defaults (false)', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: false
				}
			});

			await checkRowCounts(33, 7, 33);
		});
		it('... clicking on row keeps all options', async function () {
			$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 7, 33);
		});

		dt.html('basic');
		it('Check true - basic single item selections', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true
				}
			});

			await checkRowCounts(33, 7, 33);
		});
		it('... clicking on row removes options', async function () {
			$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
		});
		it('... clicking on second pane', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 2);
		});
		it('... clicking on third pane', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 1);
		});
		it('... unclick third pane', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 2);
		});
		it('... unclick second pane', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
		});
		it('... unclick first pane', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 7, 33);
		});
	});

	describe('Functional tests - multiple items', function () {
		dt.html('basic');
		it('Check defaults (false)', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true
				},
				initComplete: async function () {}
			});

			await checkRowCounts(33, 7, 33);
		});
		it('Clicking on option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
			checkCounts([2], [2], [1, 1]);
		});
		it('... and second option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(33, 2, 3);
			checkCounts([2, 1], [1, 2], [1, 1, 1]);
		});
		it('... Clicking on option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(2, 1, 3);
			checkCounts([1, 0], [1], [1, 1, 1]);
		});
		it('... and second option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 3);
			checkCounts([1, 1], [1, 1], [1, 1, 1]);
		});
		it('... Clicking on option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(2, 2, 2);
			checkCounts([0, 1], [1, 1], [0, 1]);
		});
		it('... and second option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 2);
			checkCounts([1, 1], [1, 1], [1, 1]);
		});
		it('... deselect second option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 2);
			checkCounts([0, 1], [1, 1], [0, 1]);
		});
		it('... deselect first option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 3);
			checkCounts([1, 1], [1, 1], [1, 1, 1]);
		});
		it('... deselect second option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 1, 3);
			checkCounts([1, 0], [1], [1, 1, 1]);
		});
		it('... deselect first option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 2, 3);
			checkCounts([2, 1], [1, 2], [1, 1, 1]);
		});
		it('... deselect second option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(33, 1, 2);
			checkCounts([2], [2], [1, 1]);
		});
		it('... deselect first option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 7, 33);
			checkCounts([2], [9], [1]);
		});
	});

	describe('Functional tests - viewtotal - single items', function () {
		dt.html('basic');
		it('Check true - basic single item selections', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				}
			});

			await checkRowCounts(33, 7, 33);
			checkCounts([2], [9], [1]);
		});
		it('... clicking on row removes options', async function () {
			$('div.dtsp-searchPane table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
			checkCounts([2], ['2 (5)'], ['1 (1)']);
		});
		it('... clicking on second pane', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 2);
			checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
		});
		it('... clicking on third pane', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 1);
			checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
		});
		it('... unclick third pane', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(1, 1, 2);
			checkCounts(['1 (2)'], ['1 (5)'], ['1 (1)']);
		});
		it('... unclick second pane', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
			checkCounts([2], ['2 (5)'], ['1 (1)']);
		});
		it('... unclick first pane', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 7, 33);
			checkCounts([2], [9], [1]);
		});
	});

	describe('Functional tests - viewtotal - multiple items', function () {
		dt.html('basic');
		it('Check defaults (false)', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				}
			});
			await checkRowCounts(33, 7, 33);
			checkCounts([2], [9], [1]);
		});
		it('Clicking on option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 1, 2);
			checkCounts([2], ['2 (5)'], ['1 (1)']);
		});
		it('... and second option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(33, 2, 3);
			checkCounts([2], ['1 (12)'], ['1 (1)']);
		});
		it('... Clicking on option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(2, 1, 3);
			checkCounts(['1 (2)', '0 (1)'], ['1 (5)'], ['1 (1)']);
		});
		it('... and second option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 3);
			checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
		});
		it('... Clicking on option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(2, 2, 2);
			checkCounts(['0 (2)', '1 (1)'], ['1 (12)'], ['0 (1)']);
		});
		it('... and second option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 2);
			checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
		});
		it('... deselect second option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 2);
			checkCounts(['0 (2)', '1 (1)'], ['1 (12)'], ['0 (1)']);
		});
		it('... deselect first option in third column', async function () {
			$('div.dtsp-searchPane:eq(2) table tbody tr:eq(0) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 2, 3);
			checkCounts(['1 (2)', '1 (1)'], ['1 (12)'], ['1 (1)']);
		});
		it('... deselect second option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(2, 1, 3);
			checkCounts(['1 (2)', '0 (1)'], ['1 (5)'], ['1 (1)']);
		});
		it('... deselect first option in second column', async function () {
			$('div.dtsp-searchPane:eq(3) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 2, 3);
			checkCounts([2], ['1 (12)'], ['1 (1)']);
		});
		it('... deselect second option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(1) td:eq(0)').trigger(getClickEvent());
			await checkRowCounts(33, 1, 2);
			checkCounts([2], ['2 (5)'], ['1 (1)']);
		});
		it('... deselect first option in first column', async function () {
			$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
			await checkRowCounts(33, 7, 33);
			checkCounts([2], [9], [1]);
		});
	});

	describe('Functional tests - Odds and ends', function () {
		dt.html('basic');
		it('Select a row in each SearchPane', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				}
			});

			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();
			$('div.dtsp-searchPane:visible:eq(1) tbody tr:eq(0) td:eq(0)').click();
			$('div.dtsp-searchPane:visible:eq(2) tbody tr:eq(0) td:eq(0)').click();

			expect($('tr.selected').length).toBe(3);
		});
		it('Clear all clears everything', async function () {
			$('button.dtsp-clearAll').click();

			await dt.sleep(100);

			expect($('tr.selected').length).toBe(0);
		});

		dt.html('basic');
		it('Select a row in one SearchPane', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					viewTotal: true
				}
			});

			$('div.dtsp-searchPane:visible:eq(2) tbody tr:eq(0) td:eq(0)').click();

			expect($('tr.selected').length).toBe(1);
			expect($('table#example tbody td:eq(0)').text()).toBe('Tatyana Fitzpatrick');
		});
		it('Clear all clears everything', async function () {
			$('div.dtsp-searchPane:visible:eq(2) .clearButton').click();

			await dt.sleep(100);

			expect($('tr.selected').length).toBe(0);
			expect($('table#example tbody td:eq(0)').text()).toBe('Airi Satou');
		});

		dt.html('basic');
		it('Custom panes', async function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true,
					viewTotal: true,
					panes: [
						{
							header: 'Custom',
							options: [
								{
									label: 'Is London?',
									value: function (rowData, rowIdx) {
										return rowData[2] === 'London';
									}
								},
								{
									label: 'Is New York?',
									value: function (rowData, rowIdx) {
										return rowData[2] === 'New York';
									}
								}
							]
						}
					]
				}
			});

			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1 (11)'], ['1 (3)'], ['1 (11)']);
		});
		it('... click on custom', async function () {
			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();
			await dt.sleep(100);
			$('div.dtsp-searchPane:visible:eq(3) tbody tr:eq(0) td:eq(0)').click();

			await checkRowCounts(9, 1, 11, 2);
			checkCounts(['1 (1)'], ['12 (12)'], ['1 (1)'], ['12']);
		});

		dt.html('basic');
		it('Custom panes - as a button', async function () {
			table = $('#example').DataTable({
				dom: 'Bfrtip',
				buttons: [
					{
						extend: 'searchPanes',
						config: {
							cascadePanes: true,
							viewTotal: true,
							panes: [
								{
									header: 'Custom',
									options: [
										{
											label: 'Is London?',
											value: function (rowData, rowIdx) {
												return rowData[2] === 'London';
											}
										},
										{
											label: 'Is New York?',
											value: function (rowData, rowIdx) {
												return rowData[2] === 'New York';
											}
										}
									]
								}
							]
						}
					}
				]
			});

			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1 (11)'], ['1 (3)'], ['1 (11)']);
		});
		it('... click on custom', async function () {
			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();
			await dt.sleep(100);
			$('div.dtsp-searchPane:visible:eq(3) tbody tr:eq(0) td:eq(0)').click();

			await checkRowCounts(9, 1, 11, 2);
			checkCounts(['1 (1)'], ['12 (12)'], ['1 (1)'], ['12']);
		});

		dt.html('basic');
		it('Select item in pane so table pagination present', function () {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					cascadePanes: true
				}
			});

			$('div.dtsp-searchPane:visible:eq(1) tbody tr:eq(1) td:eq(0)').click();

			expect($('table#example tbody td:eq(0)').text()).toBe('Angelica Ramos');
		});
		it('... paging still works', function () {
			$('.dataTables_paginate span .paginate_button:eq(1)').click();

			expect($('table#example tbody td:eq(0)').text()).toBe('Tatyana Fitzpatrick');
		});

		dt.html('basic');
		it('SaveState and cascadePanes', async function () {
			table = $('#example').DataTable({
				dom: 'Pt',
				stateSave: true,
				stateDuration: 0,
				searchPanes: {
					cascadePanes: true
				}
			});

			$('button.dt-button').click();
			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1'], ['1']);
		});
		dt.html('basic');
		it('... confirm still there on next initialisation', async function () {
			table = $('#example').DataTable({
				dom: 'Pt',
				stateSave: true,
				stateDuration: 0,
				searchPanes: {
					cascadePanes: true
				}
			});

			$('button.dt-button').click();

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1'], ['1']);
		});
		it('Tidy up', async function () {
			table.state.clear();
		});

		dt.html('basic');
		it('SaveState and cascadePanes as a Button', async function () {
			table = $('#example').DataTable({
				dom: 'Bt',
				stateSave: true,
				stateDuration: 0,
				buttons: [
					{
						extend: 'searchPanes',
						config: {
							cascadePanes: true
						}
					}
				]
			});

			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			$('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(2) td:eq(0)').click();

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1'], ['1']);
		});
		dt.html('basic');
		it('... confirm still there on next initialisation', async function () {
			table = $('#example').DataTable({
				dom: 'Bt',
				stateSave: true,
				stateDuration: 0,
				buttons: [
					{
						extend: 'searchPanes',
						config: {
							cascadePanes: true
						}
					}
				]
			});

			$('button.dt-button').click();
			await dt.sleep(500); // SP initalisation is async

			await checkRowCounts(33, 1, 1, 1);
			checkCounts(['2'], ['1'], ['1']);
		});
		it('Tidy up', async function () {
			table.state.clear();
		});
	});
});
