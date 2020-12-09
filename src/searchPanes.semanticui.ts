/*! semantic ui integration for DataTables' SearchPanes
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
		define(['jquery', 'datatables.net-se', 'datatables.net-searchpanes'], function($) {
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
				$ = require('datatables.net-se')(root, $).$;
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
	buttonGroup: 'right floated ui buttons column',
	dull: 'disabled',
	narrowSearch: 'dtsp-narrowSearch',
	narrowSub: 'dtsp-narrow',
	paneButton: 'ui button',
	paneInputButton: 'circular search link icon',
	topRow: 'row dtsp-topRow'
});

$.extend(true, DataTable.SearchPanes.classes, {
	clearAll: 'dtsp-clearAll ui button',
	dull: 'disabled'
});

// This override is required for the integrated search Icon in sematic ui
DataTable.SearchPane.prototype._searchContSetup = function() {
	$('<i class="' + this.classes.paneInputButton + '"></i>').appendTo(this.dom.searchCont);
};

return DataTable.searchPanes;
}));
