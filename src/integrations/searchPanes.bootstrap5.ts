/*! SearchPanes Bootstrap 5 styling for DataTables
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
	paneButton: 'btn btn-subtle',
	pill: 'badge rounded-pill bg-secondary',
	search: 'form-control search',
	table: 'table table-sm table-borderless',
	topRow: 'dtsp-topRow'
});

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll btn btn-subtle',
	collapseAll: 'dtsp-collapseAll btn btn-subtle',
	container: 'dtsp-searchPanes',
	disabledButton: 'disabled',
	panes: 'dtsp-panes dtsp-panesContainer',
	search: DataTable.SearchPane.classes.search,
	showAll: 'dtsp-showAll btn btn-subtle',
	title: 'dtsp-title',
	titleRow: 'dtsp-titleRow'
});
