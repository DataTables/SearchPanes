/*! SearchPanes 1.0.1
 * 2019-2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     SearchPanes
 * @description Search Panes for DataTables columns
 * @version     1.0.1
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @copyright   Copyright 2019-2020 SpryMedia Ltd.
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

	apiRegister('searchPanes.clearSelections()', function() {
		let ctx = this.context[0];
		ctx._searchPanes.clearSelections();
		return this;
	});

	apiRegister('searchPanes.rebuildPane()', function(targetIdx) {
		let ctx = this.context[0];
		ctx._searchPanes.rebuild(targetIdx);
		return this;
	});

	apiRegister('searchPanes.container()', function() {
		let ctx = this.context[0];
		return ctx._searchPanes.getNode();
	});

	$.fn.dataTable.ext.buttons.searchPanesClear = {
		text: 'Clear Panes',
		action(e, dt, node, config) {
			dt.searchPanes.clearSelections();
		}
	};

	$.fn.dataTable.ext.buttons.searchPanes = {
		text: 'Search Panes',
		init(dt, node, config) {
			let panes = new $.fn.dataTable.SearchPanes(dt, {
				filterChanged(count) {
					dt.button(node).text(dt.i18n('searchPanes.collapse', {0: 'SearchPanes', _: 'SearchPanes (%d)'}, count));
				}
			});
			let message = dt.i18n('searchPanes.collapse', 'SearchPanes', 0);
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

	function _init(settings, fromPre = false) {
		let api = new DataTable.Api(settings);
		let opts = api.init().searchPanes || DataTable.defaults.searchPanes;
		let searchPanes =  new SearchPanes(api, opts, fromPre);
		let node = searchPanes.getNode();
		return node;
	}

	// Attach a listener to the document which listens for DataTables initialisation
	// events so we can automatically initialise
	$(document).on( 'preInit.dt.dtsp', function (e, settings, json) {
		if ( e.namespace !== 'dt' ) {
			return;
		}

		if (settings.oInit.searchPanes ||
			DataTable.defaults.searchPanes
		) {
			if (!settings._searchPanes) {
				_init(settings, true);
			}
		}
	} );

	// DataTables `dom` feature option
	DataTable.ext.feature.push({
		cFeature: 'P',
		fnInit: _init,
	});

	// DataTables 2 layout feature
	if (DataTable.ext.features) {
		DataTable.ext.features.register('searchPanes', _init);
	}

}));
