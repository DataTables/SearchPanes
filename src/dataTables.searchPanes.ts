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

		// Define SearchPanes default options
		private static defaults = {
			cascadePanes: false,
			clear: true,
			collapse: false,
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

			// Check that the required version of DataTables is included
			if (! DataTable || ! DataTable.versionCheck || ! DataTable.versionCheck('1.10.0')) {
				throw new Error('SearchPane requires DataTables 1.10 or newer');
			}

			// Check that Select is included
			if (! DataTable.select) {
				throw new Error('SearchPane requires Select');
			}

			let table = new DataTable.Api(paneSettings);
			this.panes = [];
			this.arrayCols = [];
			this.classes = $.extend(true, {}, SearchPanes.class);

			// Add extra elements to DOM object including clear and hide buttons
			this.dom = {
				clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
				container: $('<div/>').addClass(this.classes.container),
				hide: $('<button type="button">Hide Panes</button>').addClass(this.classes.hide),
				title: $('<div/>').addClass(this.classes.title),
			};

			// Get options from user
			this.c = $.extend(true, {}, SearchPanes.defaults, opts);

			this.s = {
				colOpts: [],
				columns: [],
				dt: table,
				filteringActive: false,
				redraw: false,
				updating: false,
			};

			table.settings()[0]._searchPanes = this;

			let loadedFilter;
			if (table.state.loaded()) {
				loadedFilter = table.state.loaded();
			}

			// Create Panes
			table
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					this.panes.push(this._pane(idx));
				});

			// If the table is empty don't do anything else
			if (table.data().toArray().length === 0) {
				return;
			}

			// If there is any extra custom panes defined then create panes for them too
			let rowLength = table.columns().eq(0).toArray().length;
			if (this.c.panes !== undefined) {
				let paneLength = this.c.panes.length;
				for (let i = 0; i < paneLength; i++) {
					let id = rowLength + i;
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

			this._reloadSelect(loadedFilter);

			// Attach panes, clear buttons, hide button and title bar to the document
			this._attach();

			$.fn.dataTable.tables({visible: true, api: true}).columns.adjust();

			// Update the title bar to show how many filters have been selected
			this._updateFilterCount();

			// When saving the state store all of the selected rows for preselection next time around
			table.on('stateSaveParams.dt', (e, settings, data) => {
				let paneColumns = [];
				for (let i = 0; i < this.panes.length; i++) {
					if (this.panes[i]) {
						paneColumns[i] = this.panes[i].table.rows({selected: true}).data().pluck('filter').toArray();
					}
				}
				data.searchPanes = paneColumns;
			});

			// If the panes are to be collapsed on initialisation then do so
			if (this.c.collapse) {
				this._hidePanes();
			}

			// When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
			table.on('draw.dt', (e, settings, data) => {
				if (!this.s.updating) {
					let filterActive = true;
					if (table.rows({search: 'applied'}).data().toArray().length === table.rows().data().toArray().length) {
						filterActive = false;
					}
					this._updatePane(false, filterActive, true);
				}
			});

			// When the clear All button has been pressed clear all of the selections in the panes
			if (this.c.clear) {
				this.dom.clearAll[0].addEventListener('click', () => {
					this._clearSelections();
				});
			}

			// When the hide button has been pressed collapse or show the panes depending on the current state
			if (this.c.hide) {
				this.dom.hide[0].addEventListener('click', () => {
					this._hidePanes();
				});
			}

			table.state.save();
		}

		/**
		 * rebuilds all of the panes
		 */
		public rebuild() {
			this.dom.container.empty();
			this.s.dt
				.columns(this.c.columns)
				.eq(0)
				.each((idx) => {
					this._pane(idx);
				});
		}

		/**
		 * Rebuilds an individual pane
		 * @param callerIndex The index of the pane that has caused the selection/deselection
		 */
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

		/**
		 * Attach the panes, buttons and title to the document
		 */
		private _attach() {
			let container = this.c.container;
			let host = typeof container === 'function' ? container(this.s.dt) : container;

			// If the panes are to appear after the table
			if (this.c.insert === 'append') {
				// If the hide button is permitted attach it
				if (this.c.hide) {
					$(this.dom.hide).appendTo(host);
				}
				$(this.dom.title).appendTo(host);
				// If the clear button is permitted attach it
				if (this.c.clear) {
					$(this.dom.clearAll).appendTo(host);
				}
				$(this.dom.container).appendTo(host);
			}
			// If the panes are to appear before the table
			else {
				$(this.dom.container).prependTo(host);
				$(this.dom.title).prependTo(host);
				// If the hide button is permitted attach it
				if (this.c.clear) {
					$(this.dom.clearAll).prependTo(host);
				}
				// If the clear button is permitted attach it
				if (this.c.hide) {
					$(this.dom.hide).prependTo(host);
				}
			}
		}

		/**
		 * Caclulate the count for each different value in a column.
		 * @param data The data to be binned
		 * @return {object} out Object of different cell values as keys and counts as values
		 */
		private _binData(data): {} {
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

		/**
		 * Clear the selections in a pane
		 * @param pane the pane to have its selections cleared
		 */
		private _clearPane(pane) {
			// Deselect all rows which are selected and update the table and filter count.
			pane.table.rows({selected: true}).deselect();
			this._updateTable(pane, this.s.columns, pane.index, false);
			this._updateFilterCount();
		}

		/**
		 * Clear the selections of all of the panes
		 */
		private _clearSelections() {
			for (let pane of this.panes) {
				this._clearPane(pane);
			}
		}

		/**
		 * Get the bins for the custom options
		 * @param val the data in a row
		 * @param comparisonObj The data for the custom Option
		 * @param bins The counts for each of the different options in the column
		 * @param binsTotal The total counts for each of the different options in the column
		 * @return {object} comparisonObj the same object as a parameter but with updated counts
		 */
		private _comparisonStatUpdate(val, comparisonObj, bins, binsTotal) {
			// If the value of the filter is a function then it will throw an error if we try to push on to it
			if (typeof comparisonObj.filter !== 'function') {
				comparisonObj.filter.push(val.filter);
			}
			// Update the totals
			bins !== undefined ? comparisonObj.shown += bins : comparisonObj.shown += 0;
			binsTotal !== undefined ? comparisonObj.total += binsTotal : comparisonObj.total += 0;
			return comparisonObj;
		}

		/**
		 * Update the array which holds the display and filter values for the table
		 * @param table The DataTable
		 * @param colOpts The options for this column of the DataTable
		 * @param classes The class for the pane
		 * @param idx the id of the column
		 * @param arrayTotals the array of filter and display values for the rows
		 */
		private _detailsPane(table, colOpts, classes, idx, arrayTotals) {
			table.rows().every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayTotals);
			});
		}

		/**
		 * Find the unique filter values in an array
		 * @param prev empty array to push past data on to
		 * @param data empty array to populate with data which has not yet been found
		 * @param arrayFilter the array of all of the display and filter values for the table
		 */
		private _findUnique(prev, data, arrayFilter) {
			for (let filterEl of arrayFilter) {
				// If the data has not already been processed then add it to the unique array and the previously processed array.
				if (prev.indexOf(filterEl.filter) === -1) {
					data.push({
						display: filterEl.display,
						filter: filterEl.filter
					});
					prev.push(filterEl.filter);
				}
			}
		}

		/**
		 * Adds the custom options to the panes
		 * @param dtPane The pane for which the custom options are to be added
		 * @param colOpts The options for the column of which this pane is assigned
		 * @param bins The counts of the different values which are currently visible in the column of the DataTable
		 * @param binsTotal The counts of the different values which are in the original column of the DataTable
		 * @returns {Array} Returns the array of rows which have been added to the pane
		 */
		private _getComparisonRows(dtPane, colOpts, bins, binsTotal) {
			let vals = dtPane.table.rows().data();
			// Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
			let options = colOpts.options !== undefined ?
				colOpts.options :
				colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined ?
					colOpts.searchPanes.options :
					undefined;
			if (options === undefined) {
				return;
			}
			let tableVals = this.s.dt.rows({search: 'applied'}).data().toArray();
			let appRows = this.s.dt.rows({search: 'applied'});
			let tableValsTotal = this.s.dt.rows().data().toArray();
			let allRows = this.s.dt.rows();
			// Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
			dtPane.table.clear();
			let rows = [];
			for (let comp of options) {
				// Initialise the object which is to be placed in the row
				let comparisonObj = {
					display: comp.label !== '' ? comp.label : this.c.emptyMessage,
					filter: typeof comp.value === 'function' ? comp.value : [],
					shown: 0,
					total: 0,
				};
				// If a custom function is in place
				if (typeof comp.value === 'function') {
					let count = 0;
					let total = 0;
					// Count the number of times the function evaluates to true for the data currently being displayed
					for (let tVal = 0; tVal < tableVals.length; tVal++) {
						if (comp.value.call(this.s.dt, tableVals[tVal], appRows[0][tVal])) {
							count++;
						}
					}
					// Count the number of times the function evaluates to true for the original data in the Table
					for (let i = 0; i < tableValsTotal.length; i++) {
						if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
							total++;
						}
					}
					// Update the comparisonObj
					comparisonObj = this._comparisonStatUpdate(comp, comparisonObj, count, total);
				}
				// If not a custom option must be a predefined contition
				else {
					for (let val of vals) {
						let condition = comp.condition;
						// If the condition is one of the predefined conditions and the value
						// of the rows filter meets the condition update the comparisonObj
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
				// If cascadePanes is not active or if it is and the comparisonObj should be shown then add it to the pane
				if (!this.c.cascadePanes || (this.c.cascadePanes && comparisonObj.shown !== 0)) {
					rows.push(dtPane.table.row.add(comparisonObj));
				}
			}
			return rows;
		}

		/**
		 * Gets the options for the row for the customPanes
		 * @param Idx The index of the column the options should be retrieved for
		 * @returns {object} The options for the row extended to include the options from the user.
		 */
		private _getBonusOptions(Idx) {
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
		/**
		 * Gets the options for the row for the customPanes
		 * @param Idx The index of the column the options should be retrieved for
		 * @returns {object} The options for the row extended to include the options from the user.
		 */
		private _getOptions(colIdx) {
			let table = this.s.dt;
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
					table.settings()[0].aoColumns[colIdx].searchPanes
			);
		}

		/**
		 * Adds to an array the number of selections which have been made in a certain pane.
		 * @param pane The pane in question
		 * @param selectArray an array to be populated with the number of selected rows
		 * @param filterCount a running total of the number of filters in place
		 * @returns {integer} filterCount
		 */
		private _getSelected(pane, selectArray, filterCount) {
			// If the pane doesn't exist there are no filters in place on it
			if (pane !== undefined) {
				let selected = pane.table.rows({selected: true}).data().toArray().length;
				if (selected > 0) {
					this.s.filteringActive = true;
				}
				// Push on the number of selected rows in this pane and update filterCount
				selectArray.push(selected);
				filterCount += selected;
			}
			else {
				selectArray.push(0);
			}
			return filterCount;
		}

		/**
		 * Collapses the pane so that they are out of sight or makes them re-appear
		 */
		private _hidePanes() {
			let elements = document.getElementsByClassName('dt-searchPanes');
			// If the innerHTML is Hide then hide the panes and set it to show for the next time around.
			// Otherwise show the panes and set the innerHTML to Show
			if (this.dom.hide[0].innerHTML === 'Hide Panes') {
				$(elements[0]).hide();
				this.dom.hide[0].innerHTML = 'Show Panes';
			}
			else {
				$(elements[0]).show();
				this.dom.hide[0].innerHTML = 'Hide Panes';
			}
		}

		/**
		 * Creates the panes, sets up the search function
		 * @param idx the index of the column for this pane
		 * @returns {object} the pane that has been created, including the table and the index of the pane
		 */
		private _pane(idx) {
			let table = this.s.dt;
			let classes = this.classes;
			let tableCols = this.s.columns;
			let container = this.dom.container;
			let colOpts =  this.s.colOpts[idx];
			let rowLength = table.columns().eq(0).toArray().length;
			let colExists = idx < rowLength;
			let column = table.column(colExists ? idx : 0);
			this.s.colOpts.push(colExists ? this._getOptions(idx) : this._getBonusOptions(idx - rowLength));
			let clear = $('<button class="clear" type="button">Clear Pane</button>');
			let dt = $('<table><thead><tr><th>' + (colExists ?
				$(column.header()).text() :
				this.c.panes[idx - rowLength].header) + '</th><th/></tr></thead></table>');

			let countMessage = table.i18n('searchPanes.count', '{total}');
			let filteredMessage = table.i18n('searchPanes.countFiltered', '{shown} ({total})');
			let arrayFilter = [];
			let arrayTotals = [];
			let bins = {};
			let binsTotal = {};

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

					let filter: string | string[] = '';
					if (colExists) {
						// Get the current filtered data
						filter = searchData[idx];
						if (colOpts.orthogonal.filter !== 'filter') {
							filter = typeof(colOpts.orthogonal) === 'string'
								? table.cell(dataIndex, idx).render(colOpts.orthogonal)
								: table.cell(dataIndex, idx).render(colOpts.orthogonal.search);
							if ((filter as any) instanceof $.fn.dataTable.Api) {
								filter = (filter as any).toArray();
							}
						}
					}
					// For each item selected in the pane, check if it is available in the cell
					for (let colSelect of tableCols[idx]) {
						if (Array.isArray(filter)) {
							if (filter.indexOf(colSelect.filter) !== -1) {
								return true;
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

			// If it is not a custom pane in place
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
				// Don't show the pane if there are too few rows for it to qualify,
				// assuming it is not a custom pane or containing custom options
				if (Object.keys(bins).length < this.c.minRows && (colOpts.options === undefined
					&& (colOpts.searchPanes === undefined || colOpts.searchPanes.options === undefined))) {
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

			// If it is not a custom pane
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

			// If there are custom options set or it is a custom pane then get them
			if (colOpts.options !== undefined ||
				(colOpts.searchPanes !== undefined  && colOpts.searchPanes.options !== undefined)) {

				this._getComparisonRows(dtPane, colOpts, bins, binsTotal);
			}
			$.fn.dataTable.select.init(dtPane.table);

			// Display the pane
			dtPane.table.draw();

			// Hide the count column if that is desired
			if (colOpts.hideCount || this.c.hideCount) {
				dtPane.table.column(1).visible(false);
			}

			// Declare timeout Variable
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

			// If the clear button for this pane is clicked clear the selections
			if (this.c.clear) {
				clear[0].addEventListener('click', () => {
					this._clearPane(this.panes[idx]);
				});
			}

			return dtPane;
		}

		/**
		 * populates an array with all of the data for the table
		 * @param colOpts The options for this panes column
		 * @param table The DataTable
		 * @param rowIdx The current row index to be compared
		 * @param idx The column Index
		 * @param classes The searchPanes classes
		 * @param array the array to be populated for the pane
		 */
		private _populatePaneArray(colOpts, table, rowIdx, idx, classes, array) {
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

		/**
		 * Fill the array with the values that are currently being displayed in the table
		 * @param table the DataTable
		 * @param colOpts the options for this pane's Column
		 * @param classes the searchPane classes
		 * @param idx the index of the pane's column
		 * @param arrayFilter the array to be populated with the currently displayed values
		 */
		private _populatePane(table, colOpts, classes, idx, arrayFilter) {
			table.rows({search: 'applied'}).every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayFilter);
			});
		}

		/**
		 * Reloads all of the previous selects into the panes
		 * @param loadedFilter The loaded filters from a previous state
		 */
		private _reloadSelect(loadedFilter) {
			// If the state was not saved don't selected any
			if (loadedFilter === undefined) {
					return;
			}
			// For each pane, check that the loadedFilter list exists and is not null,
			// find the id of each search item and set it to be selected.
			for (let i = 0; i < this.panes.length; i++) {
				if (loadedFilter.searchPanes[i] !== null && loadedFilter.searchPanes[i] !== undefined) {
					let table = this.panes[i].table;
					let rows = table.rows({order: 'index'}).data().pluck('filter');
					for (let filter of loadedFilter.searchPanes[i]) {
						let id = rows.indexOf(filter);
						if (id > -1) {
							table.row(id).select();
						}
					}
				}
			}
		}

		/**
		 * Adds outline to the panes where a selection has been made
		 * @param paneIn the pane in question
		 */
		private _searchExtras(paneIn) {
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

		/**
		 * Finds the ratio of the number of different options in the table to the number of rows
		 * @param bins the number of different options in the table
		 * @param rowCount the total number of rows in the table
		 * @returns {number} returns the ratio
		 */
		private _uniqueRatio(bins, rowCount) {
			return bins / rowCount;
		}

		/**
		 * updates the options within the pane
		 * @param pane The pane in question
		 * @param callerIndex the index of the pane that triggered this action
		 * @param filterIdx the index of the postition of a sole selected option
		 * @param draw a flag to define whether this has been called due to a draw event or not
		 */
		private _updateCommon(pane, callerIndex, filterIdx, draw = false) {
			// Update the panes if doing a deselect. if doing a select then
			// update all of the panes except for the one causing the change
			if (pane !== undefined && (pane.index !== callerIndex || !this.s.filteringActive)) {
				let table = this.s.dt;
				let classes = this.classes;
				let colOpts = this.s.colOpts[pane.index];
				let selected = pane.table.rows({selected: true}).data().toArray();
				let rowLength = table.columns().eq(0).toArray().length;
				let scrollTop = $(pane.table.table().node()).parent()[0].scrollTop;
				let colExists = pane.index < rowLength;
				let arrayFilter = [];
				let arrayTotals = [];
				let data = [];
				let prev = [];
				let bins = {};
				let binsTotal = {};

				// Clear the pane in preparation for adding the updated search options
				pane.table.clear();

				// If it is not a custom pane
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
				if ((colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined) ||
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

		/**
		 * Updates the number of filters that have been applied in the title
		 */
		private _updateFilterCount() {
			let filterCount = 0;
			for (let pane of this.panes) {
				if (pane !== undefined) {
					filterCount += pane.table.rows({selected: true}).data().toArray().length;
				}
			}
			let message = this.s.dt.i18n('searchPanes.title', 'Filters Active - %d', filterCount);
			this.dom.title[0].innerHTML = (message);
		}

		/**
		 * Updates the values of all of the panes
		 * @param callerIndex the index of the pane that caused this to run
		 * @param select whether a select has been made in a pane or not
		 * @param draw whether this has been triggered by a draw event or not
		 */
		private _updatePane(callerIndex, select, draw = false) {
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

		/**
		 * Updates the panes if one of the options to do so has been set to true
		 * @param dtPane the pane in question
		 * @param tableCols the array of all of the selected rows across the panes
		 * @param idx the index of the column for this pane
		 * @param select whether this has been triggered by a select event or not
		 */
		private _updateTable(dtPane, tableCols, idx, select) {
			let selectedRows = dtPane.table.rows({selected: true}).data().toArray();
			tableCols[idx] = selectedRows;
			this._searchExtras(dtPane);
			// If either of the options that effect how the panes are displayed are selected then update the Panes
			if (this.c.cascadePanes || this.c.viewTotal) {
				this._updatePane(dtPane.index, select);
			}
		}

		/**
		 * flattens?
		 * @param arr the array to be flattened
		 */
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

 $(document).on('init.dt', function(e, settings, json) {
		if (e.namespace !== 'dt') {
			return;
		}

		let init = settings.oInit.searchPanes;
		let defaults = DataTable.defaults.searchPanes;

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

apiRegister('searchPanes()', function() {
	return this;
});

apiRegister('searchPanes.rebuildPane()', function(callerIndex) {
	let ctx = this.context[0];
	ctx._searchPanes.rebuildPane(callerIndex);

});
