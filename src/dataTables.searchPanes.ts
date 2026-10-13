/*! SearchPanes for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable, { Api, Buttons, Context, Dom, util } from 'datatables.net';
import './interface';
import SearchPane from './SearchPane';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneCascadeViewTotal from './SearchPaneCascadeViewTotal';
import SearchPanes from './SearchPanes';
import SearchPanesST from './SearchPanesST';
import SearchPaneViewTotal from './SearchPaneViewTotal';

DataTable.SearchPanes = SearchPanes;
DataTable.SearchPanesST = SearchPanesST;
DataTable.SearchPane = SearchPane;
DataTable.SearchPaneViewTotal = SearchPaneViewTotal;
DataTable.SearchPaneCascade = SearchPaneCascade;
DataTable.SearchPaneCascadeViewTotal = SearchPaneCascadeViewTotal;

Api.register('searchPanes()', function () {
	return this;
});

Api.register('searchPanes.clearSelections()', function () {
	return this.iterator('table', function (ctx: Context) {
		if (ctx._searchPanes) {
			ctx._searchPanes.clearSelections();
		}
	});
});

Api.register(
	'searchPanes.rebuildPane()',
	function (targetIdx: number, maintainSelections?: boolean) {
		return this.iterator('table', function (ctx: Context) {
			if (ctx._searchPanes) {
				ctx._searchPanes.rebuild(targetIdx, maintainSelections);
			}
		});
	}
);

Api.register('searchPanes.resizePanes()', function () {
	let ctx = this.context[0];

	return ctx._searchPanes ? ctx._searchPanes.resizePanes() : null;
});

Api.register('searchPanes.container()', function () {
	let ctx = this.context[0];

	return ctx._searchPanes ? ctx._searchPanes.getNode() : null;
});

DataTable.ext.buttons.searchPanesClear = {
	action(e: Event, dt: Api) {
		dt.searchPanes.clearSelections();
	},
	text: 'Clear Panes'
};

DataTable.ext.buttons.searchPanes = {
	action(
		e: Event,
		dt: Api,
		node: HTMLElement,
		config: Buttons['searchPanes']
	) {
		var that = this;

		if (!config._panes) {
			// No SearchPanes on this button yet - initialise and show
			this.processing(true);

			setTimeout(() => {
				_buttonSourced(dt, node, config);

				this.popover(config._panes.getNode(), {
					align: 'container',
					span: 'container'
				});

				config._panes.rebuild(undefined, true);

				// Tables were hidden in the popover, need to be resized
				new DataTable.Api(
					Dom.s(config._panes.getNode()).find('table.dataTable')
				).columns.adjust();

				that.processing(false);
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
	init: function (
		dt: Api,
		node: HTMLElement,
		config: Buttons['searchPanes']
	) {
		this.text(
			config.text || dt.i18n('searchPanes.collapse', 'SearchPanes', 0)
		);

		// For cases when we need to initialise the SearchPane immediately
		if (dt.init().stateSave || config.delayInit === false) {
			_buttonSourced(dt, node, config);
		}
	},
	config: {},
	text: '',
	delayInit: true
};

function _buttonSourced(
	dt: any,
	node: HTMLElement,
	config: Buttons['searchPanes']
) {
	let buttonOpts = util.object.assign(
		{
			filterChanged(count: number) {
				dt.button(node).text(
					dt.i18n(
						'searchPanes.collapse',
						dt.context[0].language.searchPanes !== undefined
							? dt.context[0].language.searchPanes.collapse
							: dt.context[0]._searchPanes.c.i18n.collapse,
						count
					)
				);
			}
		},
		config.config
	) as any;

	let panes =
		buttonOpts && (buttonOpts.cascadePanes || buttonOpts.viewTotal)
			? new DataTable.SearchPanesST(dt, buttonOpts)
			: new DataTable.SearchPanes(dt, buttonOpts);

	dt.button(node).text(
		config.text || dt.i18n('searchPanes.collapse', panes.c.i18n.collapse, 0)
	);

	config._panes = panes;
}

function _init(settings: Context, options = null, fromPre = false) {
	let api = new DataTable.Api(settings);
	let opts = options
		? options
		: api.init().searchPanes || DataTable.defaults.searchPanes;

	let searchPanes =
		opts && (opts.cascadePanes || opts.viewTotal)
			? new SearchPanesST(api, opts, fromPre)
			: new SearchPanes(api, opts, fromPre);
	let node = searchPanes.getNode();

	return node;
}

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
Dom.on('preInit.dt.dtsp', function (e, settings: Context) {
	if (e.namespace !== 'dt') {
		return;
	}

	if (settings.init.searchPanes || DataTable.defaults.searchPanes) {
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
if (DataTable.feature) {
	DataTable.feature.register('searchPanes', _init);
}
