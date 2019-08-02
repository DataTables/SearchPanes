/*! SearchPanes 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
 */
// DataTables extensions common UMD. Note that this allows for AMD, CommonJS
// (with window and jQuery being allowed as parameters to the returned
// function) or just default browser loading.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    }
    else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }
            if (!$ || !$.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }
            return factory($, root, root.document);
        };
    }
    else {
        // Browser - assume jQuery has already been loaded
        factory(window.jQuery, window, document);
    }
}(function ($, window, document) {
    var DataTable = $.fn.dataTable;
    var SearchPanes = /** @class */ (function () {
        function SearchPanes(paneSettings, opts) {
            var _this = this;
            // Check that the required version of DataTables is included
            if (!DataTable || !DataTable.versionCheck || !DataTable.versionCheck('1.10.0')) {
                throw new Error('SearchPane requires DataTables 1.10 or newer');
            }
            // Check that Select is included
            if (!DataTable.select) {
                throw new Error('SearchPane requires Select');
            }
            var table = new DataTable.Api(paneSettings);
            this.panes = [];
            this.arrayCols = [];
            this.classes = $.extend(true, {}, SearchPanes["class"]);
            // Add extra elements to DOM object including clear and hide buttons
            this.dom = {
                clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
                container: $('<div/>').addClass(this.classes.container),
                hide: $('<button type="button">Hide Panes</button>').addClass(this.classes.hide),
                title: $('<div/>').addClass(this.classes.title)
            };
            // Get options from user
            this.c = $.extend(true, {}, SearchPanes.defaults, opts);
            this.s = {
                colOpts: [],
                columns: [],
                dt: table,
                filteringActive: false,
                redraw: false,
                updating: false
            };
            table.settings()[0]._searchPanes = this;
            this.dom.clearAll[0].innerHTML = table.i18n('searchPanes.clearMessage', 'Clear All');
            this.dom.hide[0].innerHTML = table.i18n('searchPanes.collapse.hide', 'Hide Panes');
            var loadedFilter;
            if (table.state.loaded()) {
                loadedFilter = table.state.loaded();
            }
            // Create Panes
            table
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                _this.panes.push(_this._pane(idx));
            });
            // If the table is empty don't do anything else
            if (table.data().toArray().length === 0) {
                return;
            }
            // If there is any extra custom panes defined then create panes for them too
            var rowLength = table.columns().eq(0).toArray().length;
            if (this.c.panes !== undefined) {
                var paneLength = this.c.panes.length;
                for (var i = 0; i < paneLength; i++) {
                    var id = rowLength + i;
                    this.panes.push(this._pane(id));
                }
            }
            // PreSelect any selections which have been defined using the preSelect option
            table
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                if (_this.s.colOpts[idx].preSelect !== undefined) {
                    for (var i = 0; i < _this.panes[idx].table.rows().data().toArray().length; i++) {
                        if (_this.s.colOpts[idx].preSelect.indexOf(_this.panes[idx].table.cell(i, 0).data()) !== -1) {
                            _this.panes[idx].table.row(i).select();
                            if (!_this.s.updating) {
                                _this._updateTable(_this.panes[idx], _this.s.columns, idx, true);
                            }
                        }
                    }
                }
            });
            this._reloadSelect(loadedFilter);
            // Attach panes, clear buttons, hide button and title bar to the document
            this._attach();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            // Update the title bar to show how many filters have been selected
            this._updateFilterCount();
            // When saving the state store all of the selected rows for preselection next time around
            table.on('stateSaveParams.dt', function (e, settings, data) {
                var paneColumns = [];
                for (var i = 0; i < _this.panes.length; i++) {
                    if (_this.panes[i]) {
                        paneColumns[i] = _this.panes[i].table.rows({ selected: true }).data().pluck('filter').toArray();
                    }
                }
                data.searchPanes = paneColumns;
            });
            // If the panes are to be collapsed on initialisation then do so
            if (this.c.collapse) {
                this._hidePanes();
            }
            // When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
            table.on('draw.dt', function (e, settings, data) {
                if (!_this.s.updating) {
                    var filterActive = true;
                    if (table.rows({ search: 'applied' }).data().toArray().length === table.rows().data().toArray().length) {
                        filterActive = false;
                    }
                    _this._updatePane(false, filterActive, true);
                }
            });
            // When the clear All button has been pressed clear all of the selections in the panes
            if (this.c.clear) {
                this.dom.clearAll[0].addEventListener('click', function () {
                    _this.clearSelections();
                });
            }
            // When the hide button has been pressed collapse or show the panes depending on the current state
            if (this.c.hide) {
                this.dom.hide[0].addEventListener('click', function () {
                    _this._hidePanes();
                });
            }
            table.state.save();
        }
        /**
         * Clear the selections of all of the panes
         */
        SearchPanes.prototype.clearSelections = function () {
            for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane !== undefined) {
                    this._clearPane(pane);
                }
            }
        };
        /**
         * rebuilds all of the panes
         */
        SearchPanes.prototype.rebuild = function () {
            var _this = this;
            this.dom.container.empty();
            this.s.dt
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                _this._pane(idx);
            });
        };
        /**
         * Rebuilds an individual pane
         * @param callerIndex The index of the pane that has caused the selection/deselection
         */
        SearchPanes.prototype.rebuildPane = function (callerIndex) {
            this.s.updating = true;
            var selectArray = [];
            var filterCount = 0;
            var filterIdx;
            var pane = this.panes[callerIndex];
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
        };
        /**
         * Attach the panes, buttons and title to the document
         */
        SearchPanes.prototype._attach = function () {
            var container = this.c.container;
            var host = typeof container === 'function' ? container(this.s.dt) : container;
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
        };
        /**
         * Caclulate the count for each different value in a column.
         * @param data The data to be binned
         * @return {object} out Object of different cell values as keys and counts as values
         */
        SearchPanes.prototype._binData = function (data) {
            var out = {};
            data = this._flatten(data);
            for (var i = 0, ien = data.length; i < ien; i++) {
                var d = data[i].filter;
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
        };
        /**
         * Clear the selections in a pane
         * @param pane the pane to have its selections cleared
         */
        SearchPanes.prototype._clearPane = function (pane) {
            // Deselect all rows which are selected and update the table and filter count.
            pane.table.rows({ selected: true }).deselect();
            this._updateTable(pane, this.s.columns, pane.index, false);
            this._updateFilterCount();
        };
        /**
         * Get the bins for the custom options
         * @param val the data in a row
         * @param comparisonObj The data for the custom Option
         * @param bins The counts for each of the different options in the column
         * @param binsTotal The total counts for each of the different options in the column
         * @return {object} comparisonObj the same object as a parameter but with updated counts
         */
        SearchPanes.prototype._comparisonStatUpdate = function (val, comparisonObj, bins, binsTotal) {
            // If the value of the filter is a function then it will throw an error if we try to push on to it
            if (typeof comparisonObj.filter !== 'function') {
                comparisonObj.filter.push(val.filter);
            }
            // Update the totals
            bins !== undefined ? comparisonObj.shown += bins : comparisonObj.shown += 0;
            binsTotal !== undefined ? comparisonObj.total += binsTotal : comparisonObj.total += 0;
            return comparisonObj;
        };
        /**
         * Update the array which holds the display and filter values for the table
         * @param table The DataTable
         * @param colOpts The options for this column of the DataTable
         * @param classes The class for the pane
         * @param idx the id of the column
         * @param arrayTotals the array of filter and display values for the rows
         */
        SearchPanes.prototype._detailsPane = function (table, colOpts, classes, idx, arrayTotals) {
            var _this = this;
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayTotals);
            });
        };
        /**
         * Find the unique filter values in an array
         * @param prev empty array to push past data on to
         * @param data empty array to populate with data which has not yet been found
         * @param arrayFilter the array of all of the display and filter values for the table
         */
        SearchPanes.prototype._findUnique = function (prev, data, arrayFilter) {
            for (var _i = 0, arrayFilter_1 = arrayFilter; _i < arrayFilter_1.length; _i++) {
                var filterEl = arrayFilter_1[_i];
                // If the data has not already been processed then add it to the unique array and the previously processed array.
                if (prev.indexOf(filterEl.filter) === -1) {
                    data.push({
                        display: filterEl.display,
                        filter: filterEl.filter
                    });
                    prev.push(filterEl.filter);
                }
            }
        };
        /**
         * Adds the custom options to the panes
         * @param dtPane The pane for which the custom options are to be added
         * @param colOpts The options for the column of which this pane is assigned
         * @param bins The counts of the different values which are currently visible in the column of the DataTable
         * @param binsTotal The counts of the different values which are in the original column of the DataTable
         * @returns {Array} Returns the array of rows which have been added to the pane
         */
        SearchPanes.prototype._getComparisonRows = function (dtPane, colOpts, bins, binsTotal) {
            var vals = dtPane.table.rows().data();
            // Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
            var options = colOpts.options !== undefined ?
                colOpts.options :
                colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined ?
                    colOpts.searchPanes.options :
                    undefined;
            if (options === undefined) {
                return;
            }
            var tableVals = this.s.dt.rows({ search: 'applied' }).data().toArray();
            var appRows = this.s.dt.rows({ search: 'applied' });
            var tableValsTotal = this.s.dt.rows().data().toArray();
            var allRows = this.s.dt.rows();
            // Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
            dtPane.table.clear();
            var rows = [];
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var comp = options_1[_i];
                // Initialise the object which is to be placed in the row
                var comparisonObj = {
                    display: comp.label !== '' ? comp.label : this.c.emptyMessage,
                    filter: typeof comp.value === 'function' ? comp.value : [],
                    shown: 0,
                    total: 0
                };
                // If a custom function is in place
                if (typeof comp.value === 'function') {
                    var count = 0;
                    var total = 0;
                    // Count the number of times the function evaluates to true for the data currently being displayed
                    for (var tVal = 0; tVal < tableVals.length; tVal++) {
                        if (comp.value.call(this.s.dt, tableVals[tVal], appRows[0][tVal])) {
                            count++;
                        }
                    }
                    // Count the number of times the function evaluates to true for the original data in the Table
                    for (var i = 0; i < tableValsTotal.length; i++) {
                        if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
                            total++;
                        }
                    }
                    // Update the comparisonObj
                    comparisonObj = this._comparisonStatUpdate(comp, comparisonObj, count, total);
                }
                // If not a custom option must be a predefined contition
                else {
                    for (var _a = 0, vals_1 = vals; _a < vals_1.length; _a++) {
                        var val = vals_1[_a];
                        var condition = comp.condition;
                        // If the condition is one of the predefined conditions and the value
                        // of the rows filter meets the condition update the comparisonObj
                        if ((condition === '==' && val.filter === comp.value) ||
                            (condition === '!=' && val.filter !== comp.value) ||
                            (condition === '<' && val.filter < comp.value) ||
                            (condition === '>' && val.filter > comp.value) ||
                            (condition === '<=' && val.filter <= comp.value) ||
                            (condition === '>=' && val.filter >= comp.value) ||
                            (condition === 'includes' && val.filter.indexOf(comp.value) !== -1)) {
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
        };
        /**
         * Gets the options for the row for the customPanes
         * @param Idx The index of the column the options should be retrieved for
         * @returns {object} The options for the row extended to include the options from the user.
         */
        SearchPanes.prototype._getBonusOptions = function (Idx) {
            var defaults = {
                grouping: undefined,
                orthogonal: {
                    comparison: undefined,
                    display: 'display',
                    hideCount: false,
                    search: 'filter',
                    show: undefined,
                    threshold: undefined
                },
                preSelect: undefined
            };
            return $.extend(true, {}, defaults, this.c.panes[Idx] !== undefined ? this.c.panes[Idx] : {});
        };
        /**
         * Gets the options for the row for the customPanes
         * @param Idx The index of the column the options should be retrieved for
         * @returns {object} The options for the row extended to include the options from the user.
         */
        SearchPanes.prototype._getOptions = function (colIdx) {
            var table = this.s.dt;
            var defaults = {
                grouping: undefined,
                orthogonal: {
                    comparison: undefined,
                    display: 'display',
                    hideCount: false,
                    search: 'filter',
                    show: undefined,
                    threshold: undefined
                },
                preSelect: undefined
            };
            return $.extend(true, {}, defaults, table.settings()[0].aoColumns[colIdx].searchPanes);
        };
        /**
         * Adds to an array the number of selections which have been made in a certain pane.
         * @param pane The pane in question
         * @param selectArray an array to be populated with the number of selected rows
         * @param filterCount a running total of the number of filters in place
         * @returns {integer} filterCount
         */
        SearchPanes.prototype._getSelected = function (pane, selectArray, filterCount) {
            // If the pane doesn't exist there are no filters in place on it
            if (pane !== undefined) {
                var selected = pane.table.rows({ selected: true }).data().toArray().length;
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
        };
        /**
         * Collapses the pane so that they are out of sight or makes them re-appear
         */
        SearchPanes.prototype._hidePanes = function () {
            var elements = document.getElementsByClassName('dt-searchPanes');
            // If the innerHTML is Hide then hide the panes and set it to show for the next time around.
            // Otherwise show the panes and set the innerHTML to Show
            if (this.dom.hide[0].innerHTML === this.s.dt.i18n('searchPanes.collapse.hide', 'Hide Panes')) {
                $(elements[0]).hide();
                this.dom.hide[0].innerHTML = this.s.dt.i18n('searchPanes.collapse.show', 'Show Panes');
            }
            else {
                $(elements[0]).show();
                this.dom.hide[0].innerHTML = this.s.dt.i18n('searchPanes.collapse.hide', 'Hide Panes');
            }
        };
        /**
         * Creates the panes, sets up the search function
         * @param idx the index of the column for this pane
         * @returns {object} the pane that has been created, including the table and the index of the pane
         */
        SearchPanes.prototype._pane = function (idx) {
            var _this = this;
            var table = this.s.dt;
            var classes = this.classes;
            var tableCols = this.s.columns;
            var container = this.dom.container;
            var rowLength = table.columns().eq(0).toArray().length;
            var colExists = idx < rowLength;
            var column = table.column(colExists ? idx : 0);
            this.s.colOpts.push(colExists ? this._getOptions(idx) : this._getBonusOptions(idx - rowLength));
            var colOpts = this.s.colOpts[idx];
            var clear = $('<button class="clear" type="button">X</button>');
            clear[0].innerHTML = table.i18n('searchPanes.clearPane', 'X');
            var dt = $('<table><thead><tr><th>' + (colExists ?
                $(column.header()).text() :
                this.c.panes[idx - rowLength].header) + '</th><th/></tr></thead></table>');
            var countMessage = table.i18n('searchPanes.count', '{total}');
            var filteredMessage = table.i18n('searchPanes.countFiltered', '{shown} ({total})');
            var arrayFilter = [];
            var arrayTotals = [];
            var bins = {};
            var binsTotal = {};
            // Add an empty array for each column for holding the selected values
            tableCols.push([]);
            // Custom search function for table
            $.fn.dataTable.ext.search.push(function (settings, searchData, dataIndex, origData) {
                if (settings.nTable !== table.table().node()) {
                    return true;
                }
                // If no data has been selected then show all
                if (tableCols[idx].length === 0) {
                    return true;
                }
                var filter = '';
                if (colExists) {
                    // Get the current filtered data
                    filter = searchData[idx];
                    if (colOpts.orthogonal.filter !== 'filter') {
                        filter = typeof (colOpts.orthogonal) === 'string'
                            ? table.cell(dataIndex, idx).render(colOpts.orthogonal)
                            : table.cell(dataIndex, idx).render(colOpts.orthogonal.search);
                        if (filter instanceof $.fn.dataTable.Api) {
                            filter = filter.toArray();
                        }
                    }
                }
                // For each item selected in the pane, check if it is available in the cell
                for (var _i = 0, _a = tableCols[idx]; _i < _a.length; _i++) {
                    var colSelect = _a[_i];
                    if (Array.isArray(filter)) {
                        if (filter.indexOf(colSelect.filter) !== -1) {
                            return true;
                        }
                    }
                    else if (typeof colSelect.filter === 'function') {
                        if (colSelect.filter.call(table, table.row(dataIndex).data(), dataIndex)) {
                            if (!_this.s.redraw) {
                                _this.rebuildPane(rowLength + idx);
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
            });
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
                    || (colOpts.show !== true && Object.keys(bins).length <= 1)) {
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
            var dtPane = {
                index: this.panes.length,
                table: $(dt).DataTable($.extend(true, {
                    columnDefs: [
                        {
                            data: 'display',
                            render: function (data, type, row) {
                                return !_this.c.dataLength ?
                                    data : data.length > _this.c.dataLength ?
                                    data.substr(0, _this.c.dataLength) + '...' :
                                    data;
                            },
                            targets: 0
                        },
                        {
                            className: 'dtsp-countColumn',
                            data: 'count',
                            render: function (data, type, row) {
                                var message;
                                _this.s.filteringActive
                                    ? message = filteredMessage.replace(/{total}/, row.total)
                                    : message = countMessage.replace(/{total}/, row.total);
                                message = message.replace(/{shown}/, row.shown);
                                return message;
                            },
                            targets: 1,
                            width: this.c.countWidth
                        }
                    ],
                    info: false,
                    paging: false,
                    scrollY: '200px',
                    searching: true,
                    select: true
                }, this.c.dtOpts, colOpts !== undefined ? colOpts.dtOpts : {}))
            };
            // If it is not a custom pane
            if (colExists) {
                // On initialisation, do we need to set a filtering value from a
                // saved state or init option?
                var search = column.search();
                search = search ? search.substr(1, search.length - 2).split('|') : [];
                var dataFilter = [];
                var prev = [];
                // Make sure that the values stored are unique
                this._findUnique(prev, dataFilter, arrayFilter);
                // Count the number of empty cells
                var count_1 = 0;
                arrayFilter.forEach(function (element) {
                    if (element.filter === '') {
                        count_1++;
                    }
                });
                // Add all of the search options to the pane
                for (var i = 0, ien = dataFilter.length; i < ien; i++) {
                    if (dataFilter[i]) {
                        for (var _i = 0, arrayFilter_2 = arrayFilter; _i < arrayFilter_2.length; _i++) {
                            var j = arrayFilter_2[_i];
                            if (dataFilter[i].filter === j.filter || dataFilter[i] === j.display) {
                                var row = dtPane.table.row.add({
                                    display: j.display !== '' ? j.display : this.c.emptyMessage,
                                    filter: j.filter,
                                    shown: bins[dataFilter[i].filter],
                                    total: bins[dataFilter[i].filter]
                                });
                                break;
                            }
                        }
                    }
                    else {
                        dtPane.table.row.add({ filter: this.c.emptyMessage, shown: count_1, total: count_1, display: this.c.emptyMessage });
                    }
                }
            }
            // If there are custom options set or it is a custom pane then get them
            if (colOpts.options !== undefined ||
                (colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined)) {
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
            var t0;
            // When an item is selected on the pane, add these to the array which holds selected items.
            // Custom search will perform.
            dtPane.table.on('select.dt', function () {
                clearTimeout(t0);
                if (!_this.s.updating) {
                    _this._updateTable(dtPane, tableCols, idx, true);
                    _this._updateFilterCount();
                }
            });
            // When an item is deselected on the pane, re add the currently selected items to the array
            // which holds selected items. Custom search will be performed.
            dtPane.table.on('deselect.dt', function () {
                t0 = setTimeout(function () {
                    _this._updateTable(dtPane, tableCols, idx, false);
                    _this._updateFilterCount();
                }, 50);
            });
            // If the clear button for this pane is clicked clear the selections
            if (this.c.clear) {
                clear[0].addEventListener('click', function () {
                    _this._clearPane(_this.panes[idx]);
                });
            }
            return dtPane;
        };
        /**
         * populates an array with all of the data for the table
         * @param colOpts The options for this panes column
         * @param table The DataTable
         * @param rowIdx The current row index to be compared
         * @param idx The column Index
         * @param classes The searchPanes classes
         * @param array the array to be populated for the pane
         */
        SearchPanes.prototype._populatePaneArray = function (colOpts, table, rowIdx, idx, classes, array) {
            // Retrieve the rendered data from the cell
            var filter = typeof (colOpts.orthogonal) === 'string'
                ? table.cell(rowIdx, idx).render(colOpts.orthogonal)
                : table.cell(rowIdx, idx).render(colOpts.orthogonal.search);
            var display = typeof (colOpts.orthogonal) === 'string'
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
                    for (var i = 0; i < filter.length; i++) {
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
                    display: display,
                    filter: filter
                });
            }
        };
        /**
         * Fill the array with the values that are currently being displayed in the table
         * @param table the DataTable
         * @param colOpts the options for this pane's Column
         * @param classes the searchPane classes
         * @param idx the index of the pane's column
         * @param arrayFilter the array to be populated with the currently displayed values
         */
        SearchPanes.prototype._populatePane = function (table, colOpts, classes, idx, arrayFilter) {
            var _this = this;
            table.rows({ search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayFilter);
            });
        };
        /**
         * Reloads all of the previous selects into the panes
         * @param loadedFilter The loaded filters from a previous state
         */
        SearchPanes.prototype._reloadSelect = function (loadedFilter) {
            // If the state was not saved don't selected any
            if (loadedFilter === undefined) {
                return;
            }
            // For each pane, check that the loadedFilter list exists and is not null,
            // find the id of each search item and set it to be selected.
            for (var i = 0; i < this.panes.length; i++) {
                if (loadedFilter.searchPanes[i] !== null && loadedFilter.searchPanes[i] !== undefined) {
                    var table = this.panes[i].table;
                    var rows = table.rows({ order: 'index' }).data().pluck('filter');
                    for (var _i = 0, _a = loadedFilter.searchPanes[i]; _i < _a.length; _i++) {
                        var filter = _a[_i];
                        var id = rows.indexOf(filter);
                        if (id > -1) {
                            table.row(id).select();
                        }
                    }
                }
            }
        };
        /**
         * Adds outline to the panes where a selection has been made
         * @param paneIn the pane in question
         */
        SearchPanes.prototype._searchExtras = function (paneIn) {
            var table = this.s.dt;
            this.s.updating = true;
            var filters = paneIn.table.rows({ selected: true }).data().pluck('filter').toArray();
            var nullIndex = filters.indexOf(this.c.emptyMessage);
            var container = $(paneIn.table.table().container());
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
        };
        /**
         * Finds the ratio of the number of different options in the table to the number of rows
         * @param bins the number of different options in the table
         * @param rowCount the total number of rows in the table
         * @returns {number} returns the ratio
         */
        SearchPanes.prototype._uniqueRatio = function (bins, rowCount) {
            return bins / rowCount;
        };
        /**
         * updates the options within the pane
         * @param pane The pane in question
         * @param callerIndex the index of the pane that triggered this action
         * @param filterIdx the index of the postition of a sole selected option
         * @param draw a flag to define whether this has been called due to a draw event or not
         */
        SearchPanes.prototype._updateCommon = function (pane, callerIndex, filterIdx, draw) {
            if (draw === void 0) { draw = false; }
            // Update the panes if doing a deselect. if doing a select then
            // update all of the panes except for the one causing the change
            if (pane !== undefined && (pane.index !== callerIndex || !this.s.filteringActive)) {
                var table = this.s.dt;
                var classes = this.classes;
                var colOpts = this.s.colOpts[pane.index];
                var selected = pane.table.rows({ selected: true }).data().toArray();
                var rowLength = table.columns().eq(0).toArray().length;
                var scrollTop = $(pane.table.table().node()).parent()[0].scrollTop;
                var colExists = pane.index < rowLength;
                var arrayFilter = [];
                var arrayTotals = [];
                var data = [];
                var prev = [];
                var bins = {};
                var binsTotal = {};
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
                    var _loop_1 = function (dataP) {
                        if (dataP) {
                            var row = void 0;
                            // If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
                            // Do this also if the viewTotal option has been selected and cascadePanes has not
                            if (bins[dataP.filter] !== undefined || !this_1.c.cascadePanes) {
                                row = pane.table.row.add({
                                    display: dataP.display !== '' ? dataP.display : this_1.c.emptyMessage,
                                    filter: dataP.filter,
                                    shown: !this_1.c.viewTotal
                                        ? bins[dataP.filter]
                                        : bins[dataP.filter] !== undefined
                                            ? bins[dataP.filter]
                                            : '0',
                                    total: this_1.c.viewTotal
                                        ? String(binsTotal[dataP.filter])
                                        : bins[dataP.filter]
                                });
                            }
                            // Find out if the filter was selected in the previous search, if so select it and remove from array.
                            var selectIndex = selected.findIndex(function (element) {
                                return element.filter === dataP.filter;
                            });
                            if (selectIndex !== -1) {
                                row.select();
                                selected.splice(selectIndex, 1);
                            }
                        }
                    };
                    var this_1 = this;
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var dataP = data_1[_i];
                        _loop_1(dataP);
                    }
                }
                if ((colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined) ||
                    colOpts.options !== undefined) {
                    var rows = this._getComparisonRows(pane, colOpts, bins, binsTotal);
                    var _loop_2 = function (row) {
                        var selectIndex = selected.findIndex(function (element) {
                            if (element.display === row.data().display) {
                                return true;
                            }
                        });
                        if (selectIndex !== -1) {
                            row.select();
                            selected.splice(selectIndex, 1);
                        }
                    };
                    for (var _a = 0, rows_1 = rows; _a < rows_1.length; _a++) {
                        var row = rows_1[_a];
                        _loop_2(row);
                    }
                }
                // Set filtering Active to be again if it was previously set to false,
                // so that succeeding panes have the correct formatting.
                if (filterIdx !== undefined && filterIdx === pane.index) {
                    this.s.filteringActive = true;
                }
                // Add search options which were previously selected but whos results are no
                // longer present in the resulting data set.
                for (var _b = 0, selected_1 = selected; _b < selected_1.length; _b++) {
                    var selectedEl = selected_1[_b];
                    if ((draw && bins[selectedEl.filter] !== undefined) || !draw) {
                        var row = pane.table.row.add({ filter: selectedEl.filter, shown: 0, total: 0, display: selectedEl.display });
                        row.select();
                    }
                    else {
                        var id = void 0;
                        for (var _c = 0, _d = this.s.columns[pane.index]; _c < _d.length; _c++) {
                            var selection = _d[_c];
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
                    for (var _e = 0, data_2 = data; _e < data_2.length; _e++) {
                        var element = data_2[_e];
                        pane.table.row.add({
                            display: element.filter,
                            filter: element.filter,
                            shown: binsTotal[element.filter],
                            total: binsTotal[element.filter]
                        });
                    }
                }
                pane.table.draw();
                pane.table.table().node().parentNode.scrollTop = scrollTop;
            }
        };
        /**
         * Updates the number of filters that have been applied in the title
         */
        SearchPanes.prototype._updateFilterCount = function () {
            var filterCount = 0;
            for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane !== undefined) {
                    filterCount += pane.table.rows({ selected: true }).data().toArray().length;
                }
            }
            var message = this.s.dt.i18n('searchPanes.title', 'Filters Active - %d', filterCount);
            this.dom.title[0].innerHTML = (message);
        };
        /**
         * Updates the values of all of the panes
         * @param callerIndex the index of the pane that caused this to run
         * @param select whether a select has been made in a pane or not
         * @param draw whether this has been triggered by a draw event or not
         */
        SearchPanes.prototype._updatePane = function (callerIndex, select, draw) {
            if (draw === void 0) { draw = false; }
            this.s.updating = true;
            this.s.filteringActive = false;
            var selectArray = [];
            var filterCount = 0;
            var filterIdx;
            // If the viewTotal option is active then it must be determined whether there is a filter in place already
            if (this.c.viewTotal) {
                // There is if select is true
                if (select) {
                    this.s.filteringActive = true;
                }
                else {
                    // Check each pane to find how many filters are in place in each
                    for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                        var pane = _a[_i];
                        this._getSelected(pane, selectArray, filterCount);
                    }
                }
                // If there is only one in place then find the index of the corresponding pane
                if (filterCount === 1) {
                    filterIdx = selectArray.indexOf(1);
                }
            }
            for (var _b = 0, _c = this.panes; _b < _c.length; _b++) {
                var pane = _c[_b];
                this._updateCommon(pane, callerIndex, filterIdx, draw);
            }
            this.s.updating = false;
        };
        /**
         * Updates the panes if one of the options to do so has been set to true
         * @param dtPane the pane in question
         * @param tableCols the array of all of the selected rows across the panes
         * @param idx the index of the column for this pane
         * @param select whether this has been triggered by a select event or not
         */
        SearchPanes.prototype._updateTable = function (dtPane, tableCols, idx, select) {
            var selectedRows = dtPane.table.rows({ selected: true }).data().toArray();
            tableCols[idx] = selectedRows;
            this._searchExtras(dtPane);
            // If either of the options that effect how the panes are displayed are selected then update the Panes
            if (this.c.cascadePanes || this.c.viewTotal) {
                this._updatePane(dtPane.index, select);
            }
        };
        /**
         * flattens?
         * @param arr the array to be flattened
         */
        SearchPanes.prototype._flatten = function (arr) {
            return arr.reduce(function flatten(res, a) {
                Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
                return res;
            }, []);
        };
        SearchPanes.version = '0.0.2';
        SearchPanes["class"] = {
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
                title: 'title'
            },
            title: 'dtsp-title'
        };
        // Define SearchPanes default options
        SearchPanes.defaults = {
            cascadePanes: false,
            clear: true,
            collapse: false,
            container: function (dt) {
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
            viewTotal: false
        };
        return SearchPanes;
    }());
    $.fn.dataTable.SearchPanes = SearchPanes;
    $.fn.DataTable.SearchPanes = SearchPanes;
    DataTable.Api.register('searchPanes.rebuild()', function () {
        return this.iterator('table', function () {
            if (this.searchPanes) {
                this.searchPanes.rebuild();
            }
        });
    });
    DataTable.Api.register('column().paneOptions()', function (options) {
        return this.iterator('column', function (idx) {
            var col = this.aoColumns[idx];
            if (!col.searchPanes) {
                col.searchPanes = {};
            }
            col.searchPanes.values = options;
            if (this.searchPanes) {
                this.searchPanes.rebuild();
            }
        });
    });
    $(document).on('init.dt', function (e, settings, json) {
        if (e.namespace !== 'dt') {
            return;
        }
        var init = settings.oInit.searchPanes;
        var defaults = DataTable.defaults.searchPanes;
        if (init || defaults) {
            var opts = $.extend({}, init, defaults);
            if (init !== false) {
                var sep = new SearchPanes(settings, opts);
            }
        }
    });
    var apiRegister = $.fn.dataTable.Api.register;
    apiRegister('searchPanes()', function () {
        return this;
    });
    apiRegister('searchPanes.rebuildPane()', function (callerIndex) {
        var ctx = this.context[0];
        ctx._searchPanes.rebuildPane(callerIndex);
    });
    apiRegister('searchPanes.clearSelections()', function () {
        var ctx = this.context[0];
        ctx._searchPanes.clearSelections();
    });
    $.fn.dataTable.ext.buttons.searchPanesClear = {
        text: 'Clear Panes',
        action: function (e, dt, node, config) {
            dt.searchPanes.clearSelections();
        }
    };
    return SearchPanes;
}));
