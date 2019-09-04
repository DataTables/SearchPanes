describe('searchPanes - options - searchPanes.countWidth', function() {
	let table;

	dt.libs({
		js: ['jquery', 'datatables', 'select', 'searchpanes'],
		css: ['datatables', 'select', 'searchpanes']
	});

	describe('Functional tests', function() {
	// 	dt.html('basic');
	// 	it('Check defaults (false)', function() {
	// 		table = $('#example').DataTable({
	// 			dom: 'Sfrtip'
	// 		});

	// 		$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
	// 		expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2');
	// 	});

	// DD-1094 - conuntWidth doesn't seem to have any effect
		// dt.html('basic');
		// it('Give an width', function() {
		// 	table = $('#example').DataTable({
		// 		dom: 'Sfrtip',
		// 		searchPanes: {
		// 			countWidth: '900px',
		// 		},
		// 		language:{
		// 			searchPanes:{
		// 				count: '{total} found',
		// 				countFiltered: '{shown} ({total})'
		// 			}
		// 		}		
		// 	});

		// 	$('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(0)').click();
		// 	expect($('div.dtsp-searchPane:eq(1) table tbody tr:eq(0) td:eq(1)').text()).toBe('2');
		// });


	});
});
