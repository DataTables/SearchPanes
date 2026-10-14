/*! SearchPanes Bulma styling for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { util } from 'datatables.net';
import '../interface';

util.object.assignDeep(DataTable.SearchPane.classes, {
	disabledButton: 'is-disabled',
	paneButton: 'button dtsp-paneButton is-white',
	search: 'input search'
});

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll button',
	collapseAll: 'dtsp-collapseAll button',
	disabledButton: 'is-disabled',
	search: DataTable.SearchPane.classes.search,
	showAll: 'dtsp-showAll button'
});
