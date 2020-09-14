describe('searchPanes - options - language.searchPanes.loadMessage', function () {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Check default', function (done) {
			$('#example').dataTable({
				dom: 'Pfrtip',
				ajax: function (data, callback, settings) {
					var out = [];

					for (let i = 1; i < 100; i++) {
						out.push([i, i % 20, i % 10, i, i, i]);
					}

					setTimeout(function () {
						callback({
							data: out
						});
					}, 100);
				},
				initComplete: function (setting, json) {
					done();
				}
			});
			expect($('div.dtsp-panesContainer').text()).toBe('Loading Search Panes...');
		});

		dt.html('basic');
		it('Change default', function (done) {
			$('#example').dataTable({
				dom: 'Pfrtip',
				language: {
					searchPanes: {
						loadMessage: 'unit test'
					}
				},
				ajax: function (data, callback, settings) {
					var out = [];

					for (let i = 1; i < 100; i++) {
						out.push([i, i % 20, i % 10, i, i, i]);
					}

					setTimeout(function () {
						callback({
							data: out
						});
					}, 100);
				},
				initComplete: function (setting, json) {
					done();
				}
			});
			expect($('div.dtsp-panesContainer').text()).toBe('unit test');
		});
	});
});
