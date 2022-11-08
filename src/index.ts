/*! SearchPanes 2.1.0
 * 2019-2022 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     SearchPanes
 * @description Search Panes for DataTables columns
 * @version     2.1.0
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @copyright   Copyright 2019-2022 SpryMedia Ltd.
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

import SearchPane, {setJQuery as searchPaneJQuery} from './SearchPane';
import SearchPaneViewTotal, {setJQuery as searchPaneViewTotalJQuery} from './SearchPaneViewTotal';
import SearchPaneCascade, {setJQuery as searchPaneCascadeJQuery} from './SearchPaneCascade';
import SearchPaneCascadeViewTotal, {setJQuery as searchPaneCascadeViewTotalJQuery} from './SearchPaneCascadeViewTotal';
import SearchPanes, {setJQuery as searchPanesJQuery} from './SearchPanes';
import SearchPanesST from './SearchPanesST';

searchPaneJQuery($);
searchPanesJQuery($);
searchPaneViewTotalJQuery($);
searchPaneCascadeJQuery($);
searchPaneCascadeViewTotalJQuery($);

// Work around until we sort out the typing
declare var DataTable: any;
let dataTable: any = $.fn.dataTable;

// eslint-disable-next-line no-extra-parens
dataTable.SearchPanes = SearchPanes;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPanes = SearchPanes;
// eslint-disable-next-line no-extra-parens
dataTable.SearchPanesST = SearchPanesST;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPanesST = SearchPanesST;
// eslint-disable-next-line no-extra-parens
dataTable.SearchPane = SearchPane;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPane = SearchPane;
// eslint-disable-next-line no-extra-parens
dataTable.SearchPaneViewTotal = SearchPaneViewTotal;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPaneViewTotal = SearchPaneViewTotal;
// eslint-disable-next-line no-extra-parens
dataTable.SearchPaneCascade = SearchPaneCascade;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPaneCascade = SearchPaneCascade;
// eslint-disable-next-line no-extra-parens
dataTable.SearchPaneCascadeViewTotal = SearchPaneCascadeViewTotal;
// eslint-disable-next-line no-extra-parens
DataTable.SearchPaneCascadeViewTotal = SearchPaneCascadeViewTotal;

// eslint-disable-next-line no-extra-parens
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

DataTable.ext.buttons.searchPanesClear = {
	action(e, dt) {
		dt.searchPanes.clearSelections();
	},
	text: 'Clear Panes'
};

DataTable.ext.buttons.searchPanes = {
	action(e, dt, node, config) {
		if (! config._panes) {
			// No SearchPanes on this button yet - initialise and show
			this.processing(true);

			setTimeout(() => {
				_buttonSourced(dt, node, config);

				this.popover(config._panes.getNode(), {
					align: 'container',
					span: 'container'
				});

				config._panes.rebuild(undefined, true);

				this.processing(false);
			}, 10);
		}
		else {
			// Already got SP - show it
			this.popover(config._panes.getNode(), {
				align: 'container',
				span: 'container'
			});

			config._panes.rebuild(undefined, true);
		}
	},
	init: function (dt, node, config) {
		dt.button(node).text(
			config.text || dt.i18n('searchPanes.collapse', 'SearchPanes', 0)
		);

		// If state save is enabled, we need to initialise SP immediately
		// to allow any saved state to be restored. Otherwise we can delay
		// the init until needed by button press
		if (dt.init().stateSave) {
			_buttonSourced(dt, node, config);
		}
	},
	config: {},
	text: ''
};

function _buttonSourced(dt, node, config) {
	let buttonOpts = $.extend(
		{
			filterChanged(count) {
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
	);

	let panes = buttonOpts && (buttonOpts.cascadePanes || buttonOpts.viewTotal) ?
		new DataTable.SearchPanesST(dt, buttonOpts) :
		new DataTable.SearchPanes(dt, buttonOpts);
	dt.button(node).text(
		config.text || dt.i18n('searchPanes.collapse', panes.c.i18n.collapse, 0)
	);
	config._panes = panes;
}

function _init(settings, options = null, fromPre = false) {
	let api = new dataTable.Api(settings);
	let opts = options
		? options
		: api.init().searchPanes || dataTable.defaults.searchPanes;

	let searchPanes = opts && (opts.cascadePanes || opts.viewTotal) ?
		new SearchPanesST(api, opts, fromPre) :
		new SearchPanes(api, opts, fromPre);
	let node = searchPanes.getNode();

	return node;
}

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtsp', function(e, settings) {
	if (e.namespace !== 'dt') {
		return;
	}

	if (settings.oInit.searchPanes ||
		DataTable.defaults.searchPanes
	) {
		if (!settings._searchPanes) {
			_init(settings, null, true);
		}
	}
});

// DataTables `dom` feature option
DataTable.ext.feature.push({
	cFeature: 'P',
	fnInit: _init
});

// DataTables 2 layout feature
if (DataTable.ext.features) {
	DataTable.ext.features.register('searchPanes', _init);
}
