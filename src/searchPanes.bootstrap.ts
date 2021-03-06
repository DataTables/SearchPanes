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
		define(['jquery', 'datatables.net-bs', 'datatables.net-searchpanes'], function($) {
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
				$ = require('datatables.net-bs')(root, $).$;
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
	buttonGroup: 'btn-group',
	disabledButton: 'disabled',
	narrow: 'col narrow',
	narrowSub: 'row',
	pane: {
		container: 'table'
	},
	paneButton: 'btn btn-light',
	pill: 'badge badge-pill badge-light pill',
	search: 'col-sm form-control search',
	searchCont: 'input-group dtsp-searchCont',
	searchLabelCont: 'input-group-btn',
	subRow1: 'dtsp-subRow1 text-right',
	subRow2: 'dtsp-subRow2 text-right',
	table: 'table table-condensed'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll btn btn-light',
	disabledButton: 'disabled'
});

return DataTable.searchPanes;
}));
