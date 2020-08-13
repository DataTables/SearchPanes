describe('searchPanes - integrations - Editor', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'select', 'editor', 'searchpanes'],
		css: ['datatables', 'select', 'editor', 'searchpanes']
	});

	describe('Check the behaviour', function() {
		let table, editor;
		dt.html('basic_id');
		it('Ensure table update when record edited', function() {
			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				dom: 'P',
				searchPanes: true,
				columns: dt.getTestColumns()
			});

			editor
				.edit(2)
				.set('position', 'Abc')
				.submit();

			expect($('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(0) td:eq(0) span:eq(0)').text()).toBe('Abc');
		});
		it('Ensure table update when record deleted', function() {
			editor.remove(2, false).submit();

			expect($('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(0) td:eq(0) span:eq(0)').text()).toBe('Accountant');
		});
		it('Ensure table update when record created', function() {
			editor
				.create(false)
				.set('name', 'Ashton Box')
				.set('position', 'Aaa')
				.submit();
			expect($('div.dtsp-searchPane:visible:eq(0) tbody tr:eq(0) td:eq(0) span:eq(0)').text()).toBe('Aaa');
		});
		it('Tidy up', function() {
			editor.destroy();
		});
	});
});
