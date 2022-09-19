/*! Bootstrap integration for DataTables' SearchPanes
 * © SpryMedia Ltd - datatables.net/license
 */

declare var DataTable: any;

$.extend(true, DataTable.SearchPane.classes, {
	buttonGroup: 'secondary button-group',
	disabledButton: 'disabled',
	narrow: 'dtsp-narrow',
	narrowButton: 'dtsp-narrowButton',
	narrowSearch: 'dtsp-narrowSearch',
	paneButton: 'secondary button',
	pill: 'badge secondary',
	search: 'search',
	searchLabelCont: 'searchCont',
	show: 'col',
	table: 'unstriped'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll button secondary',
	collapseAll: 'dtsp-collapseAll button secondary',
	disabledButton: 'disabled',
	panes: 'panes dtsp-panesContainer',
	showAll: 'dtsp-showAll button secondary',
	title: 'dtsp-title'
});
