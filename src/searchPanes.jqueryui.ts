/*! Bootstrap integration for DataTables' SearchPanes
 * © SpryMedia Ltd - datatables.net/license
 */

declare var DataTable: any;

$.extend(true, DataTable.SearchPane.classes, {
	disabledButton: 'dtsp-paneInputButton dtsp-disabledButton',
	paneButton: 'dtsp-paneButton ui-button',
	topRow: 'dtsp-topRow ui-state-default'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll ui-button',
	collapseAll: 'dtsp-collapseAll ui-button',
	container: 'dtsp-searchPanes',
	panes: 'dtsp-panesContainer fg-toolbar ui-toolbar ui-widget-header',
	showAll: 'dtsp-showAll ui-button'
});
