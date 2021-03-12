/*! Bulma integration for DataTables' SearchPanes
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
		define(['jquery', 'datatables.net-bulma', 'datatables.net-searchpanes'], function($) {
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
				$ = require('datatables.net-bulma')(root, $).$;
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
	disabledButton: 'is-disabled',
	paneButton: 'button dtsp-paneButton is-white',
	search: 'input search',
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll button',
	disabledButton: 'is-disabled',
});

return DataTable.searchPanes;
}));
