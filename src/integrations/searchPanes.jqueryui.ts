/*! SearchPanes jQuery UI styling for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { util } from 'datatables.net';
import '../interface';

util.object.assignDeep(DataTable.SearchPane.classes, {
	disabledButton: 'dtsp-paneInputButton dtsp-disabledButton',
	paneButton: 'dtsp-paneButton ui-button',
	topRow: 'dtsp-topRow ui-state-default'
});

util.object.assignDeep(DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll ui-button',
	collapseAll: 'dtsp-collapseAll ui-button',
	container: 'dtsp-searchPanes',
	panes: 'dtsp-panesContainer fg-toolbar ui-toolbar ui-widget-header',
	showAll: 'dtsp-showAll ui-button'
});
