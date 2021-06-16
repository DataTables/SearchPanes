/*! SearchPanes 1.3.0
 * 2019-2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     SearchPanes
 * @description Search Panes for DataTables columns
 * @version     1.3.0
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @copyright   Copyright 2019-2020 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 * MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/// <reference path = '../node_modules/@types/jquery/index.d.ts'

// Hack to allow TypeScript to compile our UMD
declare let define: {
	amd: string;
	(stringValue, Function): any;
};

import SearchPane, {setJQuery as searchPaneJQuery} from './searchPane';
import SearchPanes, {setJQuery as searchPanesJQuery} from './searchPanes';

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
				// eslint-disable-next-line @typescript-eslint/no-var-requires
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

	searchPaneJQuery($);
	searchPanesJQuery($);

	let dataTable = $.fn.dataTable;

	($.fn as any).dataTable.SearchPanes = SearchPanes;
	($.fn as any).DataTable.SearchPanes = SearchPanes;
	($.fn as any).dataTable.SearchPane = SearchPane;
	($.fn as any).DataTable.SearchPane = SearchPane;

	let apiRegister = ($.fn.dataTable.Api as any).register;

	apiRegister('searchPanes()', function() {
		return this;
	});

	apiRegister('searchPanes.clearSelections()', function() {
		return this.iterator('table', function(ctx) {
			if (ctx._searchPanes) {
				ctx._searchPanes.clearSelections();
			}
		});
	});

	apiRegister('searchPanes.rebuildPane()', function(targetIdx, maintainSelections) {
		return this.iterator('table', function(ctx) {
			if (ctx._searchPanes) {
				ctx._searchPanes.rebuild(targetIdx, maintainSelections);
			}
		});
	});

	apiRegister('searchPanes.resizePanes()', function() {
		let ctx = this.context[0];

		return ctx._searchPanes ?
			ctx._searchPanes.resizePanes() :
			null;
	});

	apiRegister('searchPanes.container()', function() {
		let ctx = this.context[0];

		return ctx._searchPanes
			? ctx._searchPanes.getNode()
			: null;
	});

	$.fn.dataTable.ext.buttons.searchPanesClear = {
		action(e, dt, node, config) {
			dt.searchPanes.clearSelections();
		},
		text: 'Clear Panes'
	};

	$.fn.dataTable.ext.buttons.searchPanes = {
		action(e, dt, node, config) {
			e.stopPropagation();
			this.popover(config._panes.getNode(), {
				align: 'dt-container'
			});
			config._panes.rebuild(undefined, true);
		},
		config: {},
		init(dt, node, config) {
			let panes = new $.fn.dataTable.SearchPanes(dt, $.extend(
				{
					filterChanged(count) {
						// console.log(dt.context[0])
						dt.button(node).text(dt.i18n(
							'searchPanes.collapse',
							dt.context[0].oLanguage.searchPanes !== undefined ?
								dt.context[0].oLanguage.searchPanes.collapse :
								dt.context[0]._searchPanes.c.i18n.collapse,
							count
						));
					}
				},
				config.config
			));
			let message = dt.i18n('searchPanes.collapse', panes.c.i18n.collapse, 0);
			dt.button(node).text(message);
			config._panes = panes;
		},
		text: 'Search Panes'
	};

	function _init(settings, options = null, fromPre = false) {
		let api = new dataTable.Api(settings);
		let opts = options
			? options
			: api.init().searchPanes || dataTable.defaults.searchPanes;

		let searchPanes = new SearchPanes(api, opts, fromPre);
		let node = searchPanes.getNode();

		return node;
	}

	// Attach a listener to the document which listens for DataTables initialisation
	// events so we can automatically initialise
	$(document).on('preInit.dt.dtsp', function(e, settings, json) {
		if (e.namespace !== 'dt') {
			return;
		}

		if (settings.oInit.searchPanes ||
			dataTable.defaults.searchPanes
		) {
			if (!settings._searchPanes) {
				_init(settings, null, true);
			}
		}
	});

	// DataTables `dom` feature option
	dataTable.ext.feature.push({
		cFeature: 'P',
		fnInit: _init
	});

	// DataTables 2 layout feature
	if (dataTable.ext.features) {
		dataTable.ext.features.register('searchPanes', _init);
	}
}));
