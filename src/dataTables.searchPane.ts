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
			arrayCols: [],
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
			},
		};

		private static defaults = {
			cascadePanes: false,
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
		public arrayCols;

		constructor(settings, opts) {

			let table = new DataTable.Api(settings);
			this.panes = [];
			this.arrayCols = [];
			this.classes = $.extend(true, {}, SearchPanes.class);

			this.dom = {
				container: $('<div/>').addClass(this.classes.container)
			};

			this.c = $.extend(true, {}, SearchPanes.defaults, opts);
			this.s = {
				colOpts: [],
				columns: [],
				dt: table,
				updating: false,
			};

			table.settings()[0].searchPane = this;

			let loadedFilter;
			if (table.state.loaded()) {
				loadedFilter = table.state.loaded();
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

			table.on('stateSaveParams.dt', (e, settings, data) => {
				let paneColumns = [];
				for (let i = 0; i < this.panes.length; i++) {
					if (this.panes[i]) {
						paneColumns[i] = this.panes[i].table.rows({selected: true}).data().pluck('filter').toArray();
					}
				}
				data.searchPane = paneColumns;
			});

			table.state.save();
		}

		public _reloadSelect(loadedFilter, that) {
			if (loadedFilter === undefined) {
					return;
			}
			// For each pane, check that the loadedFilter list exists and is not null,
			// find the id of each search item and set it to be selected.
			for (let i = 0; i < that.panes.length; i++) {
				if (loadedFilter.searchPane[i] !== null && loadedFilter.searchPane[i] !== undefined) {
					let table = that.panes[i].table;
					let rows = table.rows({order: 'index'}).data().pluck('filter');
					for (let filter of loadedFilter.searchPane[i]) {
						let id = rows.indexOf(filter);
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
			let tableCols = this.s.columns;
			let column = table.column(idx);
			this.s.colOpts.push(this._getOptions(idx));
			let colOpts = this.s.colOpts[idx];
			let container = this.dom.container;
			let colType =  this._getColType(table, idx);
			let dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
			let arrayFilter = [];

			// Add an empty array for each column for holding the selected values
			tableCols.push([]);

			this._populatePane(table, colOpts, classes, idx, arrayFilter);

			// Custom search function for table
			$.fn.dataTable.ext.search.push(
				function(settings, searchData, dataIndex, origData) {
					if (settings.nTable !== table.table().node()) {
						return true;
					}
					// If no data has been selected then show all
					if (tableCols[idx].length === 0) {
						return true;
					}
					// Get the current filtered data
					let filter = searchData[idx];
					if (colOpts.orthogonal.filter !== 'filter') {
						filter = typeof(colOpts.orthogonal) === 'string'
						? table.cell(dataIndex, idx).render(colOpts.orthogonal)
						: table.cell(dataIndex, idx).render(colOpts.orthogonal.filter);
					}

					// For each item selected in the pane, check if it is available in the cell
					for (let colSelect of tableCols[idx]) {
						if (filter.indexOf(colSelect.filter) !== -1) {
							return true;
						}
					}
					return false;
				}
			);

			let bins = this._binData(this._flatten(arrayFilter));

			// Don't show the pane if there isn't enough variance in the data
			// colOpts.options is checked incase the options to restrict the choices are selected
			if (this._variance(bins) < this.c.threshold && !colOpts.options) {
				return;
			}

			// If the varaince is accceptable then display the search pane
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

			// Make sure that the values stored are unique
			this._findUnique(prev, data, arrayFilter);

			// Count the number of empty cells
			let count: number = 0;
			arrayFilter.forEach(element => {

				if (element.filter === '') {

					count++;
				}
			});

			// Add all of the search options to the pane
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

			// When an item is selected on the pane, add these to the array which holds selected items.
			// Custom search will perform.
			dtPane.table.on('select.dt', () => {
				clearTimeout(t0);

				if (!this.s.updating) {
					let selectedRows = dtPane.table.rows({selected: true}).data().toArray();
					tableCols[idx] = selectedRows;
					this._search(dtPane);
					if (this.c.cascadePanes) {
							this._updatePane(dtPane.index, true);
						}
				}
			});

			// When an item is deselected on the pane, re add the currently selected items to the array
			// which holds selected items. Custom search will be performed.
			dtPane.table.on('deselect.dt', () => {
				t0 = setTimeout(() => {

					let selectedRows = dtPane.table.rows({selected: true}).data().toArray();
					tableCols[idx] = selectedRows;
					this._search(dtPane);
					if (this.c.cascadePanes) {
						this._updatePane(dtPane.index, false);
					}
				}, 50);
			});

			return dtPane;
		}

		public _search(paneIn) {
			let table = this.s.dt;
			let filters = paneIn.table.rows({selected: true}).data().pluck('filter').toArray();
			let nullIndex = filters.indexOf(this.c.emptyMessage);
			let container = $(paneIn.table.table().container());

			// If null index is found then search for empty cells as a filter.
			if (nullIndex > -1) {
				filters[nullIndex] = '';
			}

			// If a filter has been applied then outline the respective pane, remove it when it no longer is.
			if (filters.length > 0) {
				container.addClass('selected');
			}
			else if (filters.length === 0) {
				container.removeClass('selected');
			}

			table.draw();

		}

		public _updatePane(callerIndex, select) {
			for (let pane of this.panes) {
				// Update the panes if doing a deselect. if doing a select then
				// update all of the panes except for the one causing the change
				if (pane !== undefined && (pane.index !== callerIndex || !select)) {
					let selected = pane.table.rows({selected: true}).data().toArray();
					let colOpts = this.s.colOpts[pane.index];
					let arrayFilter = [];
					let table = this.s.dt;
					let classes = this.classes;

					// Clear the pane in preparation for adding the updated search options
					pane.table.clear();

					this._populatePane(table, colOpts, classes, pane.index, arrayFilter);

					let bins = this._binData(this._flatten(arrayFilter));

					let data = [];
					let prev = [];

					this._findUnique(prev, data, arrayFilter);

					this.s.updating = true;

					for (let dataP of data) {
						if (dataP) {
							// Add all of the data found through the search should be added to the panes
							let row = pane.table.row.add({filter: dataP.filter, count: bins[dataP.filter], display: dataP.display});
							// Find out if the filter was selected in the previous search, if so select it and remove from array.
							let selectIndex = selected.findIndex(function(element) {
								return element.filter === dataP.filter;
							});
							if (selectIndex !== -1) {
								row.select();
								selected.splice(selectIndex, 1);
							}
						}
					}

					// Add search options which were previously selected but whos results are no
					// longer present in the resulting data set.
					for (let selectedEl of selected) {
						let row = pane.table.row.add({filter: selectedEl.filter, count: 0, display: selectedEl.display});
						row.select();
					}

					this.s.updating = false;
					pane.table.draw();
				}
			}
		}

		public _populatePane(table, colOpts, classes, idx, arrayFilter){
			table.rows({search: 'applied'}).every(function(rowIdx, tableLoop, rowLoop) {

				// Retrieve the rendered data from the cell
				let filter = typeof(colOpts.orthogonal) === 'string' 
					? table.cell(rowIdx, idx).render(colOpts.orthogonal) 
					: table.cell(rowIdx, idx).render(colOpts.orthogonal.filter);

				let display = typeof(colOpts.orthogonal) === 'string' 
					? table.cell(rowIdx, idx).render(colOpts.orthogonal) 
					: table.cell(rowIdx, idx).render(colOpts.orthogonal.display);

				// If the filter is an array then take a note of this, and add the elements to the arrayFilter array
				if (Array.isArray(filter) || filter instanceof DataTable.Api) {
					if (classes.arrayCols.indexOf(idx) === -1) {
						classes.arrayCols.push(idx);
					}
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
		}

		public _findUnique(prev, data, arrayFilter) {
			for (let filterEl of arrayFilter) {
				if (prev.indexOf(filterEl.filter) === -1) {
					data.push({
						display: filterEl.display,
						filter: filterEl.filter
					});
					prev.push(filterEl.filter);
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
