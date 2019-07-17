/*! SearchPane 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     SearchPane
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
	class SearchPanes {

		private static version = '0.0.2';

		private static class = {
			clear: 'clear',
			container: 'dt-searchPanes',
			item: {
				count: 'count',
				label: 'label',
				selected: 'selected'
			},
			pane: {
				active: 'filtering',
				container: 'pane',
				scroller: 'scroller',
				title: 'title',
			}
		};

		private static defaults = {
			cascaderPanes: false,
			container(dt) {
				return dt.table().container();
			},
			columns: undefined,
			emptyMessage: '<i>No Data</i>',
			insert: 'prepend',
			minRows: 1,
			searchBox: true,
			threshold: 0.5
		};

		public classes;
		public dom;
		public c;
		public s;
		public panes;

		constructor(settings, opts) {

			let table = new DataTable.Api(settings);
			this.panes = [];

			this.classes = $.extend(true, {}, SearchPanes.class);

			this.dom = {
				container: $('<div/>').addClass(this.classes.container)
			};

			this.c = $.extend(true, {}, SearchPanes.defaults, opts);

			this.s = {
				dt: table,
				updating: false
			};

			table.settings()[0].searchPane = this;

			let loadedFilter;
			let loadTest = table.state.loaded();
			if (table.state.loaded()) {
				loadedFilter = table.state.loaded().filter;
			}

			table
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					this.panes.push(this._pane(idx));
				});

			this._reloadSelect(loadedFilter, this);

			this._attach();
			$.fn.dataTable.tables({visible: true, api: true}).columns.adjust();

			table.on('stateSaveParams.dt', function(data) {
				if (!data.filter) {
					data.filter = [];
				}
				let me = () => {
					for (let i = 0; i < this.panes.length; i++) {
						if (this.panes[i] !== undefined) {
							data.filter[i] = this.panes[i].table.rows({selected: true}).data().pluck(0).flatten().toArray();
						}
					}
				};
			});

			table.state.save();
		}

		public _reloadSelect(loadedFilter, that) {
			if (loadedFilter === undefined) {
					return;
			}
			for (let i = 0; i < that.panes.length; i++) {
				if (loadedFilter[i] !== null && loadedFilter[i] !== undefined) {
					let table = that.panes[i].table;
					let rows = table.rows({order: 'index'}).data().pluck(0);
					for (let j = 0; j < loadedFilter[i].length; j++) {
						let id = loadedFilter[i].indexOf(rows[j]);
						if (id > -1) {
							table.row(id).select();
						}
					}
				}
			}
		}

		public _attach() {
			let container = this.c.container;
			let host = typeof container === 'function' ? container(this.s.dt) : container;

			if (this.c.insert === 'prepend') {
				$(this.dom.container).prependTo(host);
			}
			else {
				$(this.dom.container).appendTo(host);
			}
		}

		public _pane(idx) {
			let classes = this.classes;
			let table = this.s.dt;
			let column = table.column(idx);
			let colOpts = this._getOptions(idx);
			let dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
			let container = this.dom.container;
			let colType =  this._getColType(table, idx);
			let arrayFilter = [];

			table.rows().every(function(rowIdx, tableLoop, rowLoop) {

				let filter = typeof(colOpts.orthogonal) === 'string' ? table.cell(rowIdx, idx).render(colOpts.orthogonal) :
				 table.cell(rowIdx, idx).render(colOpts.orthogonal.filter);
				let display = typeof(colOpts.orthogonal) === 'string' ? table.cell(rowIdx, idx).render(colOpts.orthogonal) :
				 table.cell(rowIdx, idx).render(colOpts.orthogonal.display);

				if (Array.isArray(filter) || filter instanceof DataTable.Api) {

					if (filter instanceof DataTable.Api) {

						filter = filter.toArray();
						display = display.toArray();
					}

					colOpts.match = 'any';

					if (filter.length === display.length) {

						for (let i = 0; i < filter.length; i++) {

							arrayFilter.push({

								display: display[i],
								filter: filter[i]
							});
						}
					}
					else {

						throw new Error('display and filter not the same length');
					}
				}
				else {

					arrayFilter.push({
						display,
						filter
					});
				}
			});

			let bins = this._binData(this._flatten(arrayFilter));

			// Don't show the pane if there isn't enough variance in the data
			// colOpts.options is checked incase the options to restrict the choices are selected
			if (this._variance(bins) < this.c.threshold && !colOpts.options) {
				return;
			}

			$(container).append(dt);
			let dtPane = {
				index: idx,
				table: $(dt).DataTable({
					columnDefs: [
						{ data: 'display', type: colType, targets: 0},
						{ data: 'count', type: colType, targets: 1}
					],
					info: false,
					paging: false,
					scrollY: '200px',
					searching: this.c.searchBox,
					select: true
				}),
			} ;

			// On initialisation, do we need to set a filtering value from a
			// saved state or init option?
			let search = column.search();
			search = search ? search.substr(1, search.length - 2).split('|') : [];
			let data = [];
			let prev = [];

			for (let i of arrayFilter) {

					if (prev.indexOf(i.filter) === -1) {

						data.push({
							display: i.display,
							filter: i.filter
						});
						prev.push(i.filter);
					}
			}

			let count: number = 0;
			arrayFilter.forEach(element => {

				if (element.filter === '') {

					count++;
				}
			});

			for (let i = 0, ien = data.length; i < ien; i++) {
				if (data[i]) {
					for (let j of arrayFilter) {
						if (data[i].filter === j.filter || data[i] === j.display) {
							dtPane.table.row.add({
								count: bins[data[i].filter],
								display: j.display,
								filter: j.filter
							});
							break;
						}
					}
				}
				else {
					dtPane.table.row.add({filter: this.c.emptyMessage, count, display: this.c.emptyMessage});
				}
			}

			$.fn.dataTable.select.init(dtPane.table);

			dtPane.table.draw();

			let t0;

			dtPane.table.on('select.dt', () => {
				clearTimeout(t0);

				if (!this.s.updating) {
						dtPane.table.rows({selected: true}).data().toArray();
						this._search(dtPane);
						if (this.c.filterPanes) {
							this._updatePane(dtPane.index, true);
						}
				}
			});

			dtPane.table.on('deselect.dt', () => {
				t0 = setTimeout(() => {

					dtPane.table.rows({selected: true}).data().toArray();
					this._search(dtPane);

					if (this.c.filterPanes) {
						this._updatePane(dtPane.index, false);
					}
				}, 50);
			});

			return dtPane;
		}

		public _search(paneIn) {
			let columnIdx = paneIn.index;
			let table = this.s.dt;
			let options = this._getOptions(columnIdx);
			let filters = paneIn.table.rows({selected: true}).data().pluck('filter').toArray();
			let nullIndex = filters.indexOf(this.c.emptyMessage);
			let container = $(paneIn.table.table().container());
			if (nullIndex > -1) {
				filters[nullIndex] = '';
			}
			if (filters.length > 0) {
				container.addClass('selected');
			}
			if (filters.length === 0) {
				container.removeClass('selected');
				table
					.columns(columnIdx)
					.search('')
					.draw();
			}
			else if (options.match === 'any') {
				table
					.column(columnIdx)
					.search(
						'(' +
						$.map(filters, function(filter) {
							if (filter !== '') {
								return ($.fn as any).dataTable.util.escapeRegex(filter);
							}
							else {
									return '^$';
							}
						})
						.join('|')
						+ ')',
						true,
						false
					)
					.draw();
			}
			else {
				table
					.columns(columnIdx)
					.search(
						'^(' +
						$.map(filters, function(filter) {
							return($.fn as any).dataTable.util.escapeRegex(filter);
						})
						.join('|')
						+ ')$',
						true,
						false
					)
					.draw();
			}
		}

		public _updatePane(callerIndex, select) {
			for (let i of this.panes) {
				// Update the panes if doing a deselct. if doing a select then
				// update all of the panes except for the one causing the change
				if (this.panes[i] !== undefined && (this.panes[i].index !== callerIndex || !select)) {
					let selected = this.panes[i].table.rows({selected: true}).data().pluck(0);
					let colOpts = this._getOptions(this.panes[i].index);
					let column = this.s.dt.column(this.panes[i].index, {search: 'applied'});
					this.panes[i].table.clear();
					let binData = typeof colOpts.options === 'function' ?
						colOpts.options(this.s.dt, this.panes[i].index) :
						colOpts.options ?
							new DataTable.Api(null, colOpts.options) :
							column.data();
					let bins = this._binData(binData.flatten());
					let data = binData
					.unique()
					.sort()
					.toArray();

					this.s.updating = true;
					for (let j of data) {
						if (data[j]) {
							let row = this.panes[i].table.row.add([data[j], bins[data[j]]]);
							let selectIndex = selected.indexOf(data[j]);
							if (selectIndex > -1) {
								row.select();
								selected.splice(selectIndex, 1);
							}
						}
					}
					if (selected.length > 0) {
						for (let j of selected) {
							let row = this.panes[i].table.row.add([selected[j], 0]);
							row.select();

						}
					}
					this.s.updating = false;
					this.panes[i].table.draw();
				}
			}
		}

		public _getOptions(colIdx) {
			let table = this.s.dt;
			let defaults = {
				match: 'exact',
				orthogonal: {
					display: 'display',
					search: 'filter'
				},
			};
			return $.extend(true, {}, defaults, table.settings()[0].aoColumns[colIdx].searchPane);
		}

		public _variance(d) {
			let data = $.map(d, function(val, key) {
				return val;
			});

			let count = data.length;
			let sum = 0;
			for (let i = 0, ien = count; i < ien; i++) {
				sum += data[i];
			}

			let mean = sum / count;
			let varSum = 0;
			for (let i = 0, ien = count; i < ien; i++) {
				varSum += Math.pow(mean - data[i], 2);
			}

			return varSum / (count - 1);
		}

		public _binData(data): {} {
			let out = {};
			data = this._flatten(data);
			for (let i = 0, ien = data.length; i < ien; i++) {

				let d = data[i].filter;
				if (!d) {
					continue;
				}

				if (!out[d]) {
					out[d] = 1;
				}
				else {
					out[d]++;
				}
			}

			return out;
		}

		public rebuild() {
			this.dom.container.empty();
			this.s.dt
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					this._pane(idx);
				});
		}

		private _getColType(table, idx) {
			return table.settings()[0].aoColumns[idx].sType;
		}

		private _flatten(arr) {
			return arr.reduce(function flatten(res, a) {
				Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
				return res;
			}, []);
		}

	}
	($.fn as any).dataTable.SearchPanes = SearchPanes;
	($.fn as any).DataTable.SearchPanes = SearchPanes;

	DataTable.Api.register('searchPanes.rebuild()', function() {
		return this.iterator('table', function(ctx) {
			if (ctx.searchPane) {
				ctx.searchPane.rebuild();
			}
		});
	});

	DataTable.Api.register('column().paneOptions()', function(options) {
		return this.iterator('column', function(ctx, idx) {
			let col = ctx.aoColumns[idx];

			if (!col.searchPane) {
				col.searchPane = {};
			}
			col.searchPane.values = options;

			if (ctx.searchPane) {
				ctx.searchPane.rebuild();
			}
		});
	});

	$(document).on('init.dt', function(e, settings, json) {
		if (e.namespace !== 'dt') {
			return;
		}

		let init = settings.oInit.searchPane;
		let defaults = DataTable.defaults.searchPane;

		if (init || defaults) {
			let opts = $.extend({}, init, defaults);

			if (init !== false) {
				let sep = new SearchPanes(settings, opts);
			}
		}
	});

	return SearchPanes;
}));
