/*! SearchPanes Bootstrap 4 styling for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { util } from 'datatables.net';

util.object.assignDeep(DataTable.SearchPane.classes, {
	buttonGroup: 'btn-group',
	disabledButton: 'disabled',
	narrow: 'col',
	pane: {
		container: 'table'
	},
	paneButton: 'btn btn-light',
	pill: 'pill badge badge-pill badge-secondary',
	search: 'form-control search',
	searchCont: 'input-group',
	searchLabelCont: 'input-group-append',
	subRow1: 'dtsp-subRow1',
	subRow2: 'dtsp-subRow2',
	table: 'table table-sm table-borderless',
	topRow: 'dtsp-topRow'
});

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll btn btn-light',
	collapseAll: 'dtsp-collapseAll btn btn-light',
	container: 'dtsp-searchPanes',
	disabledButton: 'disabled',
	panes: 'dtsp-panes dtsp-panesContainer',
	search: DataTable.SearchPane.classes.search,
	showAll: 'dtsp-showAll btn btn-light',
	title: 'dtsp-title',
	titleRow: 'dtsp-titleRow'
});
