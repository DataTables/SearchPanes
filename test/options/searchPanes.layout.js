describe('searchPanes - options - searchPanes.layout', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Check defaults (3)', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip'
			});

			let first = $('div.dtsp-searchPane:eq(1)').position();
			let second = $('div.dtsp-searchPane:eq(2)').position();
			let third = $('div.dtsp-searchPane:eq(3)').position();

			expect(first.top).toBe(second.top);
			expect(first.top).toBe(third.top);
			expect(first.left).toBeLessThan(second.left);
			expect(second.left).toBeLessThan(third.left);
		});

		dt.html('basic');
		it('1', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-1'
				}
			});

			let first = $('div.dtsp-searchPane:eq(1)').position();
			let second = $('div.dtsp-searchPane:eq(2)').position();
			let third = $('div.dtsp-searchPane:eq(3)').position();

			expect(first.top).toBeLessThan(second.top);
			expect(second.top).toBeLessThan(third.top);
			expect(first.left).toBe(second.left);
			expect(first.left).toBe(third.left);
		});

		dt.html('basic');
		it('2', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-2'
				}
			});

			let first = $('div.dtsp-searchPane:eq(1)').position();
			let second = $('div.dtsp-searchPane:eq(2)').position();
			let third = $('div.dtsp-searchPane:eq(3)').position();

			expect(first.top).toBe(second.top);
			expect(second.top).toBeLessThan(third.top);
			expect(first.left).toBeLessThan(second.left);
			expect(first.left).toBe(third.left);
		});

		dt.html('basic');
		it('3', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-3',
					threshold: 1
				}
			});

			let first = $('div.dtsp-searchPane:eq(0)').position();
			let second = $('div.dtsp-searchPane:eq(1)').position();
			let third = $('div.dtsp-searchPane:eq(2)').position();
			let fourth = $('div.dtsp-searchPane:eq(3)').position();

			expect(first.top).toBe(second.top);
			expect(first.top).toBe(third.top);
			expect(first.top).toBeLessThan(fourth.top);
			expect(first.left).toBeLessThan(second.left);
			expect(second.left).toBeLessThan(third.left);
			expect(first.left).toBe(fourth.left);
		});

		dt.html('basic');
		it('4', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-4',
					threshold: 1
				}
			});

			let first = $('div.dtsp-searchPane:eq(0)').position();
			let second = $('div.dtsp-searchPane:eq(1)').position();
			let third = $('div.dtsp-searchPane:eq(2)').position();
			let fourth = $('div.dtsp-searchPane:eq(3)').position();
			let fifth = $('div.dtsp-searchPane:eq(4)').position();

			expect(first.top).toBe(second.top);
			expect(first.top).toBe(third.top);
			expect(first.top).toBe(fourth.top);
			expect(first.top).toBeLessThan(fifth.top);
			expect(first.left).toBeLessThan(second.left);
			expect(second.left).toBeLessThan(third.left);
			expect(third.left).toBeLessThan(fourth.left);
			expect(first.left).toBe(fifth.left);
		});

		dt.html('basic');
		it('5', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-5',
					threshold: 1
				}
			});

			let first = $('div.dtsp-searchPane:eq(0)').position();
			let second = $('div.dtsp-searchPane:eq(1)').position();
			let third = $('div.dtsp-searchPane:eq(2)').position();
			let fourth = $('div.dtsp-searchPane:eq(3)').position();
			let fifth = $('div.dtsp-searchPane:eq(4)').position();
			let sixth = $('div.dtsp-searchPane:eq(5)').position();

			expect(first.top).toBe(second.top);
			expect(first.top).toBe(third.top);
			expect(first.top).toBe(fourth.top);
			expect(first.top).toBe(fifth.top);
			expect(first.top).toBeLessThan(sixth.top);
			expect(first.left).toBeLessThan(second.left);
			expect(second.left).toBeLessThan(third.left);
			expect(third.left).toBeLessThan(fourth.left);
			expect(fourth.left).toBeLessThan(fifth.left);
			expect(first.left).toBe(sixth.left);
		});

		dt.html('basic');
		it('6', function() {
			table = $('#example').DataTable({
				dom: 'Pfrtip',
				searchPanes: {
					layout: 'columns-6',
					threshold: 1
				}
			});

			let first = $('div.dtsp-searchPane:eq(0)').position();
			let second = $('div.dtsp-searchPane:eq(1)').position();
			let third = $('div.dtsp-searchPane:eq(2)').position();
			let fourth = $('div.dtsp-searchPane:eq(3)').position();
			let fifth = $('div.dtsp-searchPane:eq(4)').position();
			let sixth = $('div.dtsp-searchPane:eq(5)').position();

			expect(first.top).toBe(second.top);
			expect(first.top).toBe(third.top);
			expect(first.top).toBe(fourth.top);
			expect(first.top).toBe(fifth.top);
			expect(first.top).toBe(sixth.top);
			expect(first.left).toBeLessThan(second.left);
			expect(second.left).toBeLessThan(third.left);
			expect(third.left).toBeLessThan(fourth.left);
			expect(fourth.left).toBeLessThan(fifth.left);
			expect(first.left).toBeLessThan(sixth.left);
		});
	});
});
