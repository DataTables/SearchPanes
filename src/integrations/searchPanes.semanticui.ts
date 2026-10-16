/*! SearchPanes Fomantic UI styling for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { Dom, util } from 'datatables.net';

util.object.assignDeep(DataTable.SearchPane.classes, {
	buttonGroup: 'right floated ui buttons column',
	disabledButton: 'disabled',
	narrowSearch: 'dtsp-narrowSearch',
	narrowSub: 'dtsp-narrow',
	paneButton: 'basic ui',
	paneInputButton: 'circular search link icon',
	topRow: 'row dtsp-topRow'
});

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll basic ui button',
	collapseAll: 'dtsp-collapseAll basic ui button',
	disabledButton: 'disabled',
	showAll: 'dtsp-showAll basic ui button'
});

// This override is required for the integrated search Icon in sematic ui
DataTable.SearchPane.prototype._searchContSetup = function () {
	Dom.c('i')
		.classAdd(this.classes.paneInputButton)
		.appendTo(this.dom.searchCont);
};
