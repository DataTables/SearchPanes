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
		define(['jquery', 'datatables.net-bs', 'datatables.net-searchPanes'], function($) {
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

			if (! $.fn.dataTable.searchPanes) {
				require('datatables.net-searchPanes')(root, $);
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
	paneButton: 'btn btn-light',
	buttonGroup: 'btn-group',
	disabledButton: 'disabled',
	dull: 'disabled',
	narrow: 'col narrow',
	pane:{
		container: 'table',
	},
	table: 'table table-condensed',
	show: 'col',
	topRow: 'dtsp-topRow row',
	search: 'col-sm form-control search',
	searchLabelCont: 'input-group-btn',
	searchCont: 'input-group col-sm-7',
	subRows: 'dtsp-subRows',
	pill: 'badge badge-pill badge-light pill'
});

$.extend(true, DataTable.SearchPanes.classes, {
	container:'dtsp-searchPanes row',
	titleRow:'row',
	clearAll:'dtsp-clearAll col-1 btn btn-light',
	title:'dtsp-title col-10',
	panes: 'dtsp-panes container'
})
return DataTable.searchPanes;
}));
