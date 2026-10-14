/*! SearchPanes Foundation styling for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { util } from 'datatables.net';
import '../interface';

util.object.assignDeep(DataTable.SearchPane.classes, {
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

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll button secondary',
	collapseAll: 'dtsp-collapseAll button secondary',
	disabledButton: 'disabled',
	panes: 'panes dtsp-panesContainer',
	search: DataTable.SearchPane.classes.search,
	showAll: 'dtsp-showAll button secondary',
	title: 'dtsp-title'
});
