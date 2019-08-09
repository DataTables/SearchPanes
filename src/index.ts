/*! SearchPanes 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     SearchPanes
 * @description Search Panes for DataTables columns
 * @version     0.0.2
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @copyright   Copyright 2018 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

 /// <reference path = '../node_modules/@types/jquery/index.d.ts'

// Hack to allow TypeScript to compile our UMD
declare var define: {
	(string, Function): any;
	amd: string;
};

import SearchPane from './searchPane';
import SearchPanes from './searchPanes';

// DataTables extensions common UMD. Note that this allows for AMD, CommonJS
// (with window and jQuery being allowed as parameters to the returned
// function) or just default browser loading.
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function($) {
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
				$ = require('datatables.net')(root, $).$;
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser - assume jQuery has already been loaded
		factory((window as any).jQuery, window, document);
	}
}(function($, window, document) {
	let DataTable = $.fn.dataTable;

	($.fn as any).dataTable.SearchPanes = SearchPanes;
	($.fn as any).DataTable.SearchPanes = SearchPanes;
	($.fn as any).dataTable.SearchPane = SearchPane;
	($.fn as any).DataTable.SearchPane = SearchPane;

	DataTable.Api.register('searchPanes.rebuild()', function() {
		return this.iterator('table', function(this) {
			if (this.searchPanes) {
				this.searchPanes.rebuild();
			}
		});
	});

	DataTable.Api.register('column().paneOptions()', function(options) {
		return this.iterator('column', function(this, idx) {
			let col = this.aoColumns[idx];

			if (!col.searchPanes) {
				col.searchPanes = {};
			}
			col.searchPanes.values = options;

			if (this.searchPanes) {
				this.searchPanes.rebuild();
			}
		});
	});

	let apiRegister = ($.fn.dataTable.Api as any).register;

	apiRegister('searchPanes()', function() {
		return this;
	});

	apiRegister('searchPanes.repopulatePane()', function(callerIndex) {
		let ctx = this.context[0];
		ctx._searchPanes.repopulatePane(callerIndex);
	});

	apiRegister('searchPanes.clearSelections()', function() {
		let ctx = this.context[0];
		ctx._searchPanes.clearSelections();
	});

	apiRegister('searchPanes.hidePanes()', function(section = 'search') {
		let ctx = this.context[0];
		ctx._searchPanes._hidePanes(section);
	});

	apiRegister('searchPanes.rebuild()', function() {
		let ctx = this.context[0];
		ctx._searchPanes.rebuild();
	});

	$.fn.dataTable.ext.buttons.searchPanesClear = {
		text: 'Clear Panes',
		action(e, dt, node, config) {
			dt.searchPanes.clearSelections();
		}
	};

	$.fn.dataTable.ext.buttons.searchPanesCollapse = {
		text: 'Search Panes',
		action(e, dt, node, config) {
			dt.searchPanes.hidePanes();
		}
	};

	$.fn.dataTable.ext.buttons.customPanesCollapse = {
		text: 'Custom Panes',
		action(e, dt, node, config) {
			dt.searchPanes.hidePanes('custom');
		}
	};

	$.fn.dataTable.ext.buttons.searchPanes = {
		text: 'Search Panes',
		init(dt, node, config) {
			let panes = new $.fn.dataTable.SearchPanes(dt, {
				filterChanged(count){
					dt.button(node).text(dt.i18n('searchPanes.collapse', {0: 'SearchPanes', _: 'SearchPanes (%d)'}, count));
				}
			});
			let message = dt.i18n('searchPanes.collapse', 'SearchPanes');
			dt.button(node).text(message);
			config._panes = panes;
		},
		action(e, dt, node, config) {
			e.stopPropagation();
			this.popover(config._panes.getNode(), {
				align: 'dt-container'
			});
			config._panes.adjust();
		}
	};

	function _init(settings) {
		let api = new DataTable.Api(settings);
		let opts = api.init().searchPanes || DataTable.defaults.searchPanes;

		return new SearchPanes(api, opts).getNode();
	}

	// DataTables `dom` feature option
	DataTable.ext.feature.push({
		cFeature: 'S',
		fnInit: _init,
	});

	// DataTables 2 layout feature
	if (DataTable.ext.features) {
		DataTable.ext.features.register('searchPanes', _init);
	}

}));
