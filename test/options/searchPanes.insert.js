describe('searchPanes - options - searchPanes.insert', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	function isTableHigher() {
		let searchPanesPosition = $('div.dtsp-panesContainer').position();
		let tablePosition = $('#example').position();

		if (tablePosition.top === searchPanesPosition.top) {
			return 'same';
		}
		if (tablePosition.top > searchPanesPosition.top) {
			return 'lower';
		}

		return 'higher';
	}

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check default (prepend)', function() {
			table = $('#example').DataTable({
				dom: 'Sfrtip'
			});

			expect(isTableHigher()).toBe('lower');
		});

		dt.html('basic');
		it('prepend', function() {
			table = $('#example').DataTable({
				searchPanes: {
					insert: 'prepend'
				},
				dom: 'Sfrtip'
			});

			expect(isTableHigher()).toBe('lower');
		});

		// DD-1088 will fail until fixed
		dt.html('basic');
		it('append', function() {
			table = $('#example').DataTable({
				searchPanes: {
					insert: 'append'
				},
				dom: 'Sfrtip'
			});

			expect(isTableHigher()).toBe('higher');
		});
	});
});
