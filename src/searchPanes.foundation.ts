/*! Bootstrap integration for DataTables' SearchPanes
 * ©2016 SpryMedia Ltd - datatables.net/license
 */
// Hack to allow TypeScript to compile our UMD
declare var define: {
	(string, Function): any;
	amd: string;
};
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net-zf', 'datatables.net-searchpanes'], function($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function(root, $) {
			if (! root) {
				root = window;
			}

			if (! $ || ! $.fn.dataTable) {
				$ = require('datatables.net-zf')(root, $).$;
			}

			if (! $.fn.dataTable.SearchPanes) {
				require('datatables.net-searchpanes')(root, $);
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function($, window, document) {
'use strict';
let DataTable = $.fn.dataTable;

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
	disabledButton: 'disabled',
	panes: 'panes dtsp-panesContainer',
	title: 'dtsp-title'
});

return DataTable.searchPanes;
}));
