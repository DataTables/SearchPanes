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
			clearAll: 'clearAll',
			container: 'dt-searchPanes',
			hide: 'hide',
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
			title: 'dtsp-title',
		};

		private static defaults = {
			cascadePanes: false,
			clear: true,
			container(dt) {
				return dt.table().container();
			},
			columns: undefined,
			countWidth: '50px',
			dataLength: 30,
			emptyMessage: '<i>No Data</i>',
			hide: true,
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

		constructor(paneSettings, opts) {

			let table = new DataTable.Api(paneSettings);
			this.panes = [];
			this.arrayCols = [];
			this.classes = $.extend(true, {}, SearchPanes.class);

			this.dom = {
				clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
				container: $('<div/>').addClass(this.classes.container),
				hide: $('<button type="button">Hide Panes</button>').addClass(this.classes.hide),
				title: $('<div/>').addClass(this.classes.title),
			};

			this.c = $.extend(true, {}, SearchPanes.defaults, opts);

			this.s = {
				colOpts: [],
				columns: [],
				dt: table,
				filteringActive: false,
				redraw: false,
				updating: false,
			};

			table.settings()[0]._searchPane = this;

			let loadedFilter;
			if (table.state.loaded()) {
				loadedFilter = table.state.loaded();
			}

			table
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					console.log(idx);
					this.panes.push(this._pane(idx));
				});

			if (table.data().toArray().length === 0) {
				return;
			}

			let rowLength = table.columns().eq(0).toArray().length;
			if (this.c.panes !== undefined) {
				let paneLength = this.c.panes.length;
				for (let i = 0; i < paneLength; i++) {
					let id = rowLength + i;
					//console.log(rowLength, i, id, table.columns().eq(0).toArray())
					this.panes.push(this._pane(id));
				}
			}

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

			this._updateFilterCount();

			table.on('stateSaveParams.dt', (e, settings, data) => {
				let paneColumns = [];
				for (let i = 0; i < this.panes.length; i++) {
					if (this.panes[i]) {
						paneColumns[i] = this.panes[i].table.rows({selected: true}).data().pluck('filter').toArray();
					}
				}
				data.searchPane = paneColumns;
			});

			table.on('draw.dt', (e, settings, data) => {
				if (!this.s.updating) {
					let filterActive = true;
					if (table.rows({search: 'applied'}).data().toArray().length === table.rows().data().toArray().length) {
						filterActive = false;
					}
					this._updatePane(false, filterActive, true);
					// this.s.redraw = true;
					// this.s.dt.draw();
					// this.s.redraw = false;
				}
			});

			if (this.c.clear) {
				this.dom.clearAll[0].addEventListener('click', () => {
					this._clearSelections();
				});
			}

			if (this.c.hide) {
				this.dom.hide[0].addEventListener('click', () => {
					let elements = document.getElementsByClassName('dt-searchPanes');
					if (this.dom.hide[0].innerHTML === 'Hide Panes') {
						$(elements[0]).hide();
						this.dom.hide[0].innerHTML = 'Show Panes';
					}
					else {
						$(elements[0]).show();
						this.dom.hide[0].innerHTML = 'Hide Panes';
					}
				});
			}

			table.state.save();
		}

		public _attach() {
			let container = this.c.container;
			let host = typeof container === 'function' ? container(this.s.dt) : container;

			if (this.c.insert === 'append') {
				if (this.c.hide) {
					$(this.dom.hide).appendTo(host);
				}
				$(this.dom.title).appendTo(host);
				if (this.c.clear) {
					$(this.dom.clearAll).appendTo(host);
				}
				$(this.dom.container).appendTo(host);
			}
			else {
				$(this.dom.container).prependTo(host);
				$(this.dom.title).prependTo(host);
				if (this.c.clear) {
					$(this.dom.clearAll).prependTo(host);
				}
				if (this.c.hide) {
					$(this.dom.hide).prependTo(host);
				}
			}
		}

		public _binData(data): {} {
			let out = {};
			data = this._flatten(data);
			for (let i = 0, ien = data.length; i < ien; i++) {

				let d = data[i].filter;
				if (d === null || d === undefined) {
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

		public _clearPane(pane) {
			pane.table.rows({selected: true}).deselect();
			this._updateTable(pane, this.s.columns, pane.index, false);
			this._updateFilterCount();
		}

		public _clearSelections() {
			for (let pane of this.panes) {
				this._clearPane(pane);
			}
		}

		public _comparisonStatUpdate(val, comparisonObj, bins, binsTotal) {
			if (typeof comparisonObj.filter !== 'function') {
				comparisonObj.filter.push(val.filter);
			}
			bins !== undefined ? comparisonObj.shown += bins : comparisonObj.shown += 0;
			binsTotal !== undefined ? comparisonObj.total += binsTotal : comparisonObj.total += 0;
			return comparisonObj;
		}

		public _detailsPane(table, colOpts, classes, idx, arrayTotals) {
			table.rows().every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayTotals);
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

		public _getComparisonRows(dtPane, colOpts, bins, binsTotal) {
			let vals = dtPane.table.rows().data();
			let options = colOpts.options !== undefined ? colOpts.options :
				colOpts.searchPane !== undefined && colOpts.searchPane.options !== undefined ?
					colOpts.searchPane.options :
					undefined;
			console.log(options)
			if (options === undefined) {
				return;
			}
			let tableVals = this.s.dt.rows({search: 'applied'}).data().toArray();
			let appRows = this.s.dt.rows({search: 'applied'});
			let tableValsTotal = this.s.dt.rows().data().toArray();
			let allRows = this.s.dt.rows();
			dtPane.table.clear();
			let rows = [];
			for (let comp of options) {
				let comparisonObj = {
					display: comp.label !== '' ? comp.label : this.c.emptyMessage,
					filter: typeof comp.value === 'function' ? comp.value : [],
					shown: 0,
					total: 0,
				};
				if (typeof comp.value === 'function') {
					let count = 0;
					let total = 0;
					for (let tVal = 0; tVal < tableVals.length; tVal++) {
						if (comp.value.call(this.s.dt, tableVals[tVal], appRows[0][tVal])) {
							count++;
						}
					}
					for (let i = 0; i < tableValsTotal.length; i++) {
						if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
							total++;
						}
					}
					comparisonObj = this._comparisonStatUpdate(comp, comparisonObj, count, total);
				}
				else {
					for (let val of vals) {
						let condition = comp.condition;
						if (
							(condition === '==' && val.filter === comp.value) ||
							(condition === '!=' && val.filter !== comp.value) ||
							(condition === '<' && val.filter < comp.value) ||
							(condition === '>' && val.filter > comp.value) ||
							(condition === '<=' && val.filter <= comp.value) ||
							(condition === '>=' && val.filter >= comp.value) ||
							(condition === 'includes' && val.filter.indexOf(comp.value) !== -1)
						) {
							comparisonObj = this._comparisonStatUpdate(val, comparisonObj, bins[val.filter], binsTotal[val.filter]);
						}
					}
				}
				if (!this.c.cascadePanes || (this.c.cascadePanes && comparisonObj.shown !== 0)) {
					rows.push(dtPane.table.row.add(comparisonObj));
				}
			}
			return rows;
		}

		public _getBonusOptions(Idx) {
			let defaults = {
				grouping: undefined,
				orthogonal: {
					comparison: undefined,
					display: 'display',
					hideCount: false,
					search: 'filter',
					show: undefined,
					threshold: undefined,
				},
				preSelect: undefined,
			};
			return $.extend(
				true,
				{},
				defaults,
				this.c.panes[Idx] !== undefined ? this.c.panes[Idx] : {}
			);
		}

		public _getOptions(colIdx) {
			let table = this.s.dt;
			let rowLength = table.columns().eq(0).toArray().length;
			let defaults = {
				grouping: undefined,
				orthogonal: {
					comparison: undefined,
					display: 'display',
					hideCount: false,
					search: 'filter',
					show: undefined,
					threshold: undefined,
				},
				preSelect: undefined,
			};
			return $.extend(
				true,
				{},
				defaults,
					table.settings()[0].aoColumns[colIdx].searchPane
			);
		}

		public _getSelected(pane, selectArray, filterCount) {
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
			return filterCount;
		}

		public _pane(idx) {
			let table = this.s.dt;
			let classes = this.classes;
			let rowLength = table.columns().eq(0).toArray().length;
			let tableCols = this.s.columns;
			let container = this.dom.container;
			let colExists = idx < rowLength;
			let column = table.column(colExists ? idx : 0);
			this.s.colOpts.push(colExists ? this._getOptions(idx) : this._getBonusOptions(idx - rowLength));
			let colOpts =  this.s.colOpts[idx];
			let colType =  this._getColType(table, colExists ? idx : 0);
			let clear = $('<button class="clear" type="button">Clear Pane</button>');
			console.log(this.c.panes, idx, rowLength)
			let dt = $('<table><thead><tr><th>' + (colExists ?
				$(column.header()).text() :
				this.c.panes[idx - rowLength].header) + '</th><th/></tr></thead></table>');
			let arrayFilter = [];
			let arrayTotals = [];
			let binsTotal;
			let countMessage = table.i18n('searchPane.count', '{total}');
			let filteredMessage = table.i18n('searchPane.countFiltered', '{shown} ({total})');
			// Add an empty array for each column for holding the selected values
			tableCols.push([]);

			// Custom search function for table
			$.fn.dataTable.ext.search.push(
				(settings, searchData, dataIndex, origData) => {
					if (settings.nTable !== table.table().node()) {
						return true;
					}
					// If no data has been selected then show all
					if (tableCols[idx].length === 0) {
						return true;
					}

					let filter = '';
					if (colExists) {
						// Get the current filtered data
						filter = searchData[idx];
						if (colOpts.orthogonal.filter !== 'filter') {
							filter = typeof(colOpts.orthogonal) === 'string'
							? table.cell(dataIndex, idx).render(colOpts.orthogonal)
							: table.cell(dataIndex, idx).render(colOpts.orthogonal.search);
						}
					}

					// For each item selected in the pane, check if it is available in the cell
					for (let colSelect of tableCols[idx]) {
						if (Array.isArray(colSelect.filter)) {
							for (let filterP of colSelect.filter) {
								if (filter.indexOf(filterP) !== -1) {
									return true;
								}
							}
						}
						else if (typeof colSelect.filter === 'function') {
							if (colSelect.filter.call(table, table.row(dataIndex).data(), dataIndex)) {
								if (!this.s.redraw) {
									this.rebuildPane(rowLength + idx);
								}
								return true;
							}
							return false;
						}
						else {
							if (filter === colSelect.filter) {
								return true;
							}
						}

					}
					return false;
				}
			);

			let bins = {};
			if (colExists) {
				this._populatePane(table, colOpts, classes, idx, arrayFilter);

				bins = this._binData(this._flatten(arrayFilter));

				// If the option viewTotal is true then find
				// the total count for the whole table to display alongside the displayed count
				if (this.c.viewTotal) {
					this._detailsPane(table, colOpts, classes, idx, arrayTotals);
					binsTotal = this._binData(this._flatten(arrayTotals));
				}
				else {
					binsTotal = bins;
				}

				// Don't show the pane if there isn't enough variance in the data
				// colOpts.options is checked incase the options to restrict the choices are selected
				if ((colOpts.show === undefined && (colOpts.threshold === undefined ?
						this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > this.c.threshold :
						this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > colOpts.threshold))
					|| colOpts.show === false
					|| (colOpts.show !== undefined && colOpts.show !== true)
					|| (colOpts.show !== true  && Object.keys(bins).length <= 1)
				) {
					return;
				}
				if (Object.keys(bins).length < this.c.minRows && (colOpts.options === undefined
					&& (colOpts.searchPane === undefined || colOpts.searchPane.options === undefined))) {
					return;
				}
			}

			// If the varaince is accceptable then display the search pane
			if (this.c.clear) {
				$(container).append(clear);
			}
			$(container).append(dt);
			let dtPane = {
				index: this.panes.length,
				table: $(dt).DataTable($.extend(true, {
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
						},
						{
							className: 'dtsp-countColumn',
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
					searching: true,
					select: true
				}, this.c.dtOpts, colOpts !== undefined ? colOpts.dtOpts : {})),
			} ;

			if (colExists) {
				// On initialisation, do we need to set a filtering value from a
				// saved state or init option?
				let search = column.search();
				search = search ? search.substr(1, search.length - 2).split('|') : [];
				let dataFilter = [];
				let prev = [];

				// Make sure that the values stored are unique
				this._findUnique(prev, dataFilter, arrayFilter);

				// Count the number of empty cells
				let count: number = 0;
				arrayFilter.forEach(element => {
					if (element.filter === '') {
						count++;
					}
				});

				// Add all of the search options to the pane
				for (let i = 0, ien = dataFilter.length; i < ien; i++) {
					if (dataFilter[i]) {
						for (let j of arrayFilter) {
							if (dataFilter[i].filter === j.filter || dataFilter[i] === j.display) {
								let row = dtPane.table.row.add({
									display: j.display !== '' ? j.display : this.c.emptyMessage,
									filter: j.filter,
									shown: bins[dataFilter[i].filter],
									total: bins[dataFilter[i].filter],
								});
								break;
							}
						}
					}
					else {
						dtPane.table.row.add({filter: this.c.emptyMessage, shown: count, total: count, display: this.c.emptyMessage});
					}
				}
			}
			console.log(colOpts)
			if (colOpts.options !== undefined ||
				(colOpts.searchPane !== undefined  && colOpts.searchPane.options !== undefined)) {

				this._getComparisonRows(dtPane, colOpts, bins, binsTotal);
			}
			$.fn.dataTable.select.init(dtPane.table);

			dtPane.table.draw();

			if (colOpts.hideCount || this.c.hideCount) {
				dtPane.table.column(1).visible(false);
			}
			let t0;

			// When an item is selected on the pane, add these to the array which holds selected items.
			// Custom search will perform.
	  dtPane.table.on('select.dt', () => {
				clearTimeout(t0);
				if (!this.s.updating) {
					this._updateTable(dtPane, tableCols, idx, true);
					this._updateFilterCount();
				}
			});

			// When an item is deselected on the pane, re add the currently selected items to the array
			// which holds selected items. Custom search will be performed.
	  dtPane.table.on('deselect.dt', () => {
				t0 = setTimeout(() => {
					this._updateTable(dtPane, tableCols, idx, false);
					this._updateFilterCount();
				}, 50);
			});

			if (this.c.clear) {
				clear[0].addEventListener('click', () => {
					this._clearPane(this.panes[idx]);
				});
			}

			return dtPane;
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

		public _populatePane(table, colOpts, classes, idx, arrayFilter) {
			table.rows({search: 'applied'}).every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayFilter);
			});
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

		public rebuildPane(callerIndex) {
			this.s.updating = true;
			let selectArray = [];
			let filterCount = 0;
			let filterIdx;
			let pane = this.panes[callerIndex];

			// If the viewTotal option is active then it must be determined whether there is a filter in place already
			if (this.c.viewTotal) {

				// Check each pane to find how many filters are in place in each
				filterCount = this._getSelected(pane, selectArray, filterCount);

				// If there is only one in place then find the index of the corresponding pane
				if (filterCount === 1) {
					filterIdx = selectArray.indexOf(1);
				}
			}
			this._updateCommon(pane, callerIndex, filterIdx);
			this.s.updating = false;
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

		public _searchExtras(paneIn) {
			let table = this.s.dt;
			this.s.updating = true;
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
			this.s.updating = false;
		}

		public _uniqueRatio(bins, rowCount) {
			return bins / rowCount;
		}

		public _updateCommon(pane, callerIndex, filterIdx, draw = false) {
			// Update the panes if doing a deselect. if doing a select then
			// update all of the panes except for the one causing the change
			if (pane !== undefined && (pane.index !== callerIndex || !this.s.filteringActive)) {
				let selected = pane.table.rows({selected: true}).data().toArray();
				let colOpts = this.s.colOpts[pane.index];
				let arrayFilter = [];
				let arrayTotals = [];
				let table = this.s.dt;
				let rowLength = table.columns().eq(0).toArray().length;			
				let colExists = pane.index < rowLength;
				let classes = this.classes;
				let data = [];
				let prev = [];
				let binsTotal;
				let scrollTop = $(pane.table.table().node()).parent()[0].scrollTop;

				// Clear the pane in preparation for adding the updated search options
				pane.table.clear();
				let bins = {};

				if (colExists) {
					this._populatePane(table, colOpts, classes, pane.index, arrayFilter);

					bins = this._binData(this._flatten(arrayFilter));

					// If the viewTotal option is selected then find the totals for the table
					if (this.c.viewTotal) {
						this._detailsPane(table, colOpts, classes, pane.index, arrayTotals);

						binsTotal = this._binData(this._flatten(arrayTotals));

						this._findUnique(prev, data, arrayTotals);
					}
					else {
						binsTotal = bins;
					}

					this._findUnique(prev, data, arrayFilter);

					// If a filter has been removed so that only one remains then the remaining filter should have
					// the non filtered formatting, therefore set filteringActive to be false.
					if (filterIdx !== undefined && filterIdx === pane.index) {
						this.s.filteringActive = false;
					}

					for (let dataP of data) {
						if (dataP) {
							let row;
							// If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
							// Do this also if the viewTotal option has been selected and cascadePanes has not
							if (bins[dataP.filter] !== undefined || !this.c.cascadePanes) {
								row = pane.table.row.add({
									display: dataP.display !== '' ? dataP.display : this.c.emptyMessage,
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
							}

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
				}
				if ((colOpts.searchPane !== undefined && colOpts.searchPane.options !== undefined) ||
					colOpts.options !== undefined) {
					let rows = this._getComparisonRows(pane, colOpts, bins, binsTotal);
					for (let row of rows) {
						let selectIndex = selected.findIndex(function(element) {
							if (element.display === row.data().display) {
								return true;
							}
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
					if ((draw && bins[selectedEl.filter] !== undefined) || !draw) {
						let row = pane.table.row.add({filter: selectedEl.filter, shown: 0, total: 0, display: selectedEl.display});
						row.select();
					}
					else {
						let id;
						for (let selection of this.s.columns[pane.index]) {
							if (selection.filter === selectedEl.filter) {
								id = this.s.columns[pane.index].indexOf(selection);
								break;
							}
						}
						if (id !== undefined) {
							this.s.columns[pane.index].splice(id, 1);
						}
					}
				}
				if (pane.table.rows().data().toArray().length === 0) {
					this._detailsPane(table, colOpts, classes, pane.index, arrayTotals);

					binsTotal = this._binData(this._flatten(arrayTotals));

					this._findUnique(prev, data, arrayTotals);

					for (let element of data) {
						pane.table.row.add({
							display: element.filter,
							filter: element.filter,
							shown : binsTotal[element.filter],
							total: binsTotal[element.filter],
						});
					}
				}
				pane.table.draw();
				pane.table.table().node().parentNode.scrollTop = scrollTop;
			}
		}

		public _updateFilterCount() {
			let filterCount = 0;
			for (let pane of this.panes) {
				if (pane !== undefined) {
					filterCount += pane.table.rows({selected: true}).data().toArray().length;
				}
			}
			let message = this.s.dt.i18n('searchPane.title', 'Filters Active - %d', filterCount);
			this.dom.title[0].innerHTML = (message);
		}

		public _updatePane(callerIndex, select, draw = false) {
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
						this._getSelected(pane, selectArray, filterCount);
					}
				}
				// If there is only one in place then find the index of the corresponding pane
				if (filterCount === 1) {
					filterIdx = selectArray.indexOf(1);
				}
			}
			for (let pane of this.panes) {
				this._updateCommon(pane, callerIndex, filterIdx, draw);
			}
			this.s.updating = false;
		}

		public _updateTable(dtPane, tableCols, idx, select) {
			let selectedRows = dtPane.table.rows({selected: true}).data().toArray();
			tableCols[idx] = selectedRows;
			this._searchExtras(dtPane);
			// If either of the options that effect how the panes are displayed are selected then update the Panes
			if (this.c.cascadePanes || this.c.viewTotal) {
				this._updatePane(dtPane.index, select);
			}
		}

		private _getColType(table, idx) {
			return table.settings()[0].aoColumns[idx] !== undefined ?
				table.settings()[0].aoColumns[idx].sType :
				table.settings()[0].aoColumns[0].sType;
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
		return this.iterator('table', function(this) {
			if (this.searchPane) {
				this.searchPane.rebuild();
			}
		});
	});

 DataTable.Api.register('column().paneOptions()', function(options) {
		return this.iterator('column', function(this, idx) {
			let col = this.aoColumns[idx];

			if (!col.searchPane) {
				col.searchPane = {};
			}
			col.searchPane.values = options;

			if (this.searchPane) {
				this.searchPane.rebuild();
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

let apiRegister = ($.fn.dataTable.Api as any).register;

apiRegister('searchPane()', function() {
	return this;
});

apiRegister('searchPane.rebuildPane()', function(callerIndex) {
	let ctx = this.context[0];
	ctx._searchPane.rebuildPane(callerIndex);

});
