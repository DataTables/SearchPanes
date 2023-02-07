/*! Bootstrap integration for DataTables' SearchPanes
 * © SpryMedia Ltd - datatables.net/license
 */

declare var DataTable: any;

$.extend(true, DataTable.SearchPane.classes, {
	buttonGroup: 'btn-group',
	disabledButton: 'disabled',
	narrow: 'col narrow',
	narrowSub: 'row',
	pane: {
		container: 'table'
	},
	paneButton: 'btn btn-light',
	pill: 'badge badge-pill badge-light pill',
	search: 'col-sm form-control search',
	searchCont: 'input-group dtsp-searchCont',
	searchLabelCont: 'input-group-btn',
	subRow1: 'dtsp-subRow1 text-right',
	subRow2: 'dtsp-subRow2 text-right',
	table: 'table table-condensed'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll btn btn-light',
	collapseAll: 'dtsp-collapseAll btn btn-light',
	disabledButton: 'disabled',
	search: DataTable.SearchPane.classes.search,
	showAll: 'dtsp-showAll btn btn-light'
});
