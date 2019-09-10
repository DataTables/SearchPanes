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

			if (! $.fn.dataTable.searchPanes) {
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
	container: 'dtsp-searchPane column ui grid',
	paneButton: 'ui button',
	buttonGroup: 'right floated ui buttons column',
	searchCont: 'ui icon input eight wide column',
	narrowSub: 'dtsp-narrow',
	narrowSearch: 'dtsp-narrowSearch',
	paneInputButton: 'circular search link icon',
	dull: 'disabled',
	topRow: 'row dtsp-topRow'
});

$.extend(true, DataTable.SearchPanes.classes, {
	container: 'dtsp-searchPanes ui grid',
	clearAll: 'dtsp-clearAll ui button'

});
return DataTable.searchPanes;
}));
