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
			countWidth: '50px',
			dataLength: 30,
			emptyMessage: '<i>No Data</i>',
			insert: 'prepend',
			maxOptions: 5,
			minRows: 1,
			searchBox: true,
			threshold: 0.6,
			viewTotal: false,
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
				filteringActive: false,
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

			// PreSelect any selections which have been defined using the preSelect option
			table
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					if (this.s.colOpts[idx].preSelect !== undefined) {
						for (let i = 0; i < this.panes[idx].table.rows().data().toArray().length; i++) {
							if (this.s.colOpts[idx].preSelect.indexOf(this.panes[idx].table.cell(i, 0).data()) !== -1) {
								this.panes[idx].table.row(i).select();
								if (!this.s.updating) {
									this._updateTable(this.panes[idx], this.s.columns, idx, true);
								}
							}
						}
					}
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
			let arrayTotals = [];
			let binsTotal;
			let countMessage = table.i18n('searchPane.count', '{total}');
			let filteredMessage = table.i18n('searchPane.countFiltered', '{shown} ({total})');
			//console.log(colOpts);
			// Add an empty array for each column for holding the selected values
			tableCols.push([]);

			this._populatePane(table, colOpts, classes, idx, arrayFilter);

			// If the option viewTotal is true then find
			// the total count for the whole table to display alongside the displayed count
			if (this.c.viewTotal) {
				this._detailsPane(table, colOpts, classes, idx, arrayTotals);
				binsTotal = this._binData(this._flatten(arrayTotals));
			}

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
						: table.cell(dataIndex, idx).render(colOpts.orthogonal.search);
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
			if ((colOpts.show === undefined && 
					(colOpts.threshold === undefined ?
						this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > this.c.threshold :
						this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > colOpts.threshold))
				|| colOpts.show === false
				|| (colOpts.show !== undefined && colOpts.show !== true)) {
				return;
			}

			// If the varaince is accceptable then display the search pane
			$(container).append(dt);

			let dtPane = {
				index: idx,
				table: $(dt).DataTable({
					columnDefs: [
						{
							data: 'display',
							render: (data, type, row) => {
								return !this.c.dataLength ?
									data : data.length > this.c.dataLength ?
									data.substr(0, this.c.dataLength) + '...' :
									data;
							},
							targets: 0,
							type: colType,

						},
						{
							className:'dtsp-countColumn',
							data: 'count',
							render: (data, type, row) => {
								let message;
								this.s.filteringActive
									? message = filteredMessage.replace(/{total}/, row.total)
									: message = countMessage.replace(/{total}/, row.total) ;
								message = message.replace(/{shown}/, row.shown);
								return message;
							},
							targets: 1,
							width: this.c.countWidth,
						}
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
							if ((colOpts.hide === undefined || colOpts.hide.indexOf(data[i].filter) === -1)) {
								let row = dtPane.table.row.add({
									display: j.display,
									filter: j.filter,
									shown: bins[data[i].filter],
									total: bins[data[i].filter],
								});
							}
							break;
						}
					}
				}
				else {
					dtPane.table.row.add({filter: this.c.emptyMessage, shown: count, total: count, display: this.c.emptyMessage});
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
					this._updateTable(dtPane, tableCols, idx, true);
				}
			});

			// When an item is deselected on the pane, re add the currently selected items to the array
			// which holds selected items. Custom search will be performed.
	  dtPane.table.on('deselect.dt', () => {
				t0 = setTimeout(() => {
					this._updateTable(dtPane, tableCols, idx, false);
				}, 50);
			});

			return dtPane;
		}

		public _updateTable(dtPane, tableCols, idx, select) {
			let selectedRows = dtPane.table.rows({selected: true}).data().toArray();
			tableCols[idx] = selectedRows;
			this._search(dtPane);
			// If either of the options that effect how the panes are displayed are selected then update the Panes
			if (this.c.cascadePanes || this.c.viewTotal) {
				this._updatePane(dtPane.index, select);
			}
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
			this.s.updating = true;
			this.s.filteringActive = false;
			let selectArray = [];
			let filterCount = 0;
			let filterIdx;

			// If the viewTotal option is active then it must be determined whether there is a filter in place already
			if (this.c.viewTotal) {
				// There is if select is true
				if (select) {
					this.s.filteringActive = true;
				}
				else {
					// Check each pane to find how many filters are in place in each
					for (let pane of this.panes) {
						if (pane !== undefined) {
							let selected = pane.table.rows({selected: true}).data().toArray().length;
							if (selected > 0) {
								this.s.filteringActive = true;
							}
							selectArray.push(selected);
							filterCount += selected;
						}
						else {
							selectArray.push(0);
						}
					}
				}
				// If there is only one in place then find the index of the corresponding pane
				if (filterCount === 1) {
					filterIdx = selectArray.indexOf(1);
				}
			}

			for (let pane of this.panes) {
				// Update the panes if doing a deselect. if doing a select then
				// update all of the panes except for the one causing the change
				if (pane !== undefined && (pane.index !== callerIndex || !select || !this.s.filteringActive)) {
					let selected = pane.table.rows({selected: true}).data().toArray();
					let colOpts = this.s.colOpts[pane.index];
					let arrayFilter = [];
					let arrayTotals = [];
					let table = this.s.dt;
					let classes = this.classes;
					let data = [];
					let prev = [];
					let binsTotal;
					let scrollTop = $(pane.table.table().node()).parent()[0].scrollTop;

					// Clear the pane in preparation for adding the updated search options
					pane.table.clear();

					this._populatePane(table, colOpts, classes, pane.index, arrayFilter);

					// If the viewTotal option is selected then find the totals for the table
					if (this.c.viewTotal) {
						this._detailsPane(table, colOpts, classes, pane.index, arrayTotals);

						binsTotal = this._binData(this._flatten(arrayTotals));

						this._findUnique(prev, data, arrayTotals);
					}

					let bins = this._binData(this._flatten(arrayFilter));

					this._findUnique(prev, data, arrayFilter);

					// If a filter has been removed so that only one remains then the remaining filter should have
					// the non filtered formatting, therefore set filteringActive to be false.
					if (filterIdx !== undefined && filterIdx === pane.index) {
						this.s.filteringActive = false;
					}

					for (let dataP of data) {
						if (dataP && (colOpts.hide === undefined || colOpts.hide.indexOf(data.filter) === -1)) {
							let row;
							// If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
							// Do this also if the viewTotal option has been selected and cascadePanes has not
							row = pane.table.row.add({
								display: dataP.display,
								filter: dataP.filter,
								shown: !this.c.viewTotal
									? bins[dataP.filter]
									: bins[dataP.filter] !== undefined
										? bins[dataP.filter]
										: '0',
								total: this.c.viewTotal
									? String(binsTotal[dataP.filter])
									: bins[dataP.filter],
							});
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
					// Set filtering Active to be again if it was previously set to false,
					// so that succeeding panes have the correct formatting.
					if (filterIdx !== undefined && filterIdx === pane.index) {
						this.s.filteringActive = true;
					}

					// Add search options which were previously selected but whos results are no
					// longer present in the resulting data set.
					for (let selectedEl of selected) {
						let row = pane.table.row.add({filter: selectedEl.filter, shown: 0, total: 0, display: selectedEl.display});
						row.select();
					}
					pane.table.draw();
					pane.table.table().node().parentNode.scrollTop = scrollTop;
				}
			}
			this.s.updating = false;
		}

		public _detailsPane(table, colOpts, classes, idx, arrayTotals) {
			table.rows().every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayTotals);
			});
		}

		public _populatePane(table, colOpts, classes, idx, arrayFilter) {
			table.rows({search: 'applied'}).every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayFilter);
			});
		}

		public _populatePaneArray(colOpts, table, rowIdx, idx, classes, array) {
			// Retrieve the rendered data from the cell
			let filter = typeof(colOpts.orthogonal) === 'string'
				? table.cell(rowIdx, idx).render(colOpts.orthogonal)
				: table.cell(rowIdx, idx).render(colOpts.orthogonal.search);

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

						array.push({

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

				array.push({
					display,
					filter
				});
			}
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
				grouping: undefined,
				match: 'exact',
				orthogonal: {
					display: 'display',
					hide: undefined,
					search: 'filter',
					show: undefined,
					threshold: undefined,
				},
				preSelect: undefined,
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

		public _uniqueRatio(bins, rowCount) {
			return bins / rowCount;
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
