/*! semantic ui integration for DataTables' SearchPanes
 * © SpryMedia Ltd - datatables.net/license
 */

declare var DataTable: any;

$.extend(true, DataTable.SearchPane.classes, {
	buttonGroup: 'right floated ui buttons column',
	disabledButton: 'disabled',
	narrowSearch: 'dtsp-narrowSearch',
	narrowSub: 'dtsp-narrow',
	paneButton: 'basic ui',
	paneInputButton: 'circular search link icon',
	topRow: 'row dtsp-topRow'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll basic ui button',
	collapseAll: 'dtsp-collapseAll basic ui button',
	disabledButton: 'disabled',
	showAll: 'dtsp-showAll basic ui button'
});

// This override is required for the integrated search Icon in sematic ui
DataTable.SearchPane.prototype._searchContSetup = function() {
	$('<i class="' + this.classes.paneInputButton + '"></i>').appendTo(this.dom.searchCont);
};
