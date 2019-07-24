/*! SearchPane 0.0.2
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
        function SearchPanes(settings, opts) {
            var _this = this;
            var table = new DataTable.Api(settings);
            this.panes = [];
            this.arrayCols = [];
            this.classes = $.extend(true, {}, SearchPanes["class"]);
            this.dom = {
                container: $('<div/>').addClass(this.classes.container)
            };
            this.c = $.extend(true, {}, SearchPanes.defaults, opts);
            this.s = {
                colOpts: [],
                columns: [],
                dt: table,
                filteringActive: false,
                updating: false
            };
            table.settings()[0].searchPane = this;
            var loadedFilter;
            if (table.state.loaded()) {
                loadedFilter = table.state.loaded();
            }
            table
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                _this.panes.push(_this._pane(idx));
            });
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
            this._reloadSelect(loadedFilter, this);
            this._attach();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            table.on('stateSaveParams.dt', function (e, settings, data) {
                var paneColumns = [];
                for (var i = 0; i < _this.panes.length; i++) {
                    if (_this.panes[i]) {
                        paneColumns[i] = _this.panes[i].table.rows({ selected: true }).data().pluck('filter').toArray();
                    }
                }
                data.searchPane = paneColumns;
            });
            table.state.save();
        }
        SearchPanes.prototype._reloadSelect = function (loadedFilter, that) {
            if (loadedFilter === undefined) {
                return;
            }
            // For each pane, check that the loadedFilter list exists and is not null,
            // find the id of each search item and set it to be selected.
            for (var i = 0; i < that.panes.length; i++) {
                if (loadedFilter.searchPane[i] !== null && loadedFilter.searchPane[i] !== undefined) {
                    var table = that.panes[i].table;
                    var rows = table.rows({ order: 'index' }).data().pluck('filter');
                    for (var _i = 0, _a = loadedFilter.searchPane[i]; _i < _a.length; _i++) {
                        var filter = _a[_i];
                        var id = rows.indexOf(filter);
                        if (id > -1) {
                            table.row(id).select();
                        }
                    }
                }
            }
        };
        SearchPanes.prototype._attach = function () {
            var container = this.c.container;
            var host = typeof container === 'function' ? container(this.s.dt) : container;
            if (this.c.insert === 'prepend') {
                $(this.dom.container).prependTo(host);
            }
            else {
                $(this.dom.container).appendTo(host);
            }
        };
        SearchPanes.prototype._pane = function (idx) {
            var _this = this;
            var classes = this.classes;
            var table = this.s.dt;
            var tableCols = this.s.columns;
            var column = table.column(idx);
            this.s.colOpts.push(this._getOptions(idx));
            var colOpts = this.s.colOpts[idx];
            var container = this.dom.container;
            var colType = this._getColType(table, idx);
            var dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
            var arrayFilter = [];
            var arrayTotals = [];
            var binsTotal;
            var countMessage = table.i18n('searchPane.count', '{total}');
            var filteredMessage = table.i18n('searchPane.countFiltered', '{shown} ({total})');
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
            $.fn.dataTable.ext.search.push(function (settings, searchData, dataIndex, origData) {
                if (settings.nTable !== table.table().node()) {
                    return true;
                }
                // If no data has been selected then show all
                if (tableCols[idx].length === 0) {
                    return true;
                }
                // Get the current filtered data
                var filter = searchData[idx];
                if (colOpts.orthogonal.filter !== 'filter') {
                    filter = typeof (colOpts.orthogonal) === 'string'
                        ? table.cell(dataIndex, idx).render(colOpts.orthogonal)
                        : table.cell(dataIndex, idx).render(colOpts.orthogonal.search);
                }
                // For each item selected in the pane, check if it is available in the cell
                for (var _i = 0, _a = tableCols[idx]; _i < _a.length; _i++) {
                    var colSelect = _a[_i];
                    if (filter.indexOf(colSelect.filter) !== -1) {
                        return true;
                    }
                }
                return false;
            });
            var bins = this._binData(this._flatten(arrayFilter));
            // Don't show the pane if there isn't enough variance in the data
            // colOpts.options is checked incase the options to restrict the choices are selected
            if ((colOpts.show === undefined &&
                this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > this.c.threshold) ||
                colOpts.show === false ||
                (!isNaN(colOpts.show) &&
                    this._uniqueRatio(Object.keys(bins).length, table.rows()[0].length) > colOpts.show)) {
                return;
            }
            // If the varaince is accceptable then display the search pane
            $(container).append(dt);
            var dtPane = {
                index: idx,
                table: $(dt).DataTable({
                    columnDefs: [
                        {
                            data: 'display',
                            render: function (data, type, row) {
                                return !_this.c.dataLength ?
                                    data : data.length > _this.c.dataLength ?
                                    data.substr(0, _this.c.dataLength) + '...' :
                                    data;
                            },
                            targets: 0,
                            type: colType
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
                    searching: this.c.searchBox,
                    select: true
                })
            };
            // On initialisation, do we need to set a filtering value from a
            // saved state or init option?
            var search = column.search();
            search = search ? search.substr(1, search.length - 2).split('|') : [];
            var data = [];
            var prev = [];
            // Make sure that the values stored are unique
            this._findUnique(prev, data, arrayFilter);
            // Count the number of empty cells
            var count = 0;
            arrayFilter.forEach(function (element) {
                if (element.filter === '') {
                    count++;
                }
            });
            // Add all of the search options to the pane
            for (var i = 0, ien = data.length; i < ien; i++) {
                if (data[i]) {
                    for (var _i = 0, arrayFilter_1 = arrayFilter; _i < arrayFilter_1.length; _i++) {
                        var j = arrayFilter_1[_i];
                        if (data[i].filter === j.filter || data[i] === j.display) {
                            if ((colOpts.hide === undefined || colOpts.hide.indexOf(data[i].filter) === -1)) {
                                var row = dtPane.table.row.add({
                                    display: j.display,
                                    filter: j.filter,
                                    shown: bins[data[i].filter],
                                    total: bins[data[i].filter]
                                });
                                console.log(row.data());
                            }
                            break;
                        }
                    }
                }
                else {
                    dtPane.table.row.add({ filter: this.c.emptyMessage, shown: count, total: count, display: this.c.emptyMessage });
                }
            }
            $.fn.dataTable.select.init(dtPane.table);
            dtPane.table.draw();
            var t0;
            // When an item is selected on the pane, add these to the array which holds selected items.
            // Custom search will perform.
            dtPane.table.on('select.dt', function () {
                clearTimeout(t0);
                if (!_this.s.updating) {
                    _this._updateTable(dtPane, tableCols, idx, true);
                }
            });
            // When an item is deselected on the pane, re add the currently selected items to the array
            // which holds selected items. Custom search will be performed.
            dtPane.table.on('deselect.dt', function () {
                t0 = setTimeout(function () {
                    _this._updateTable(dtPane, tableCols, idx, false);
                }, 50);
            });
            return dtPane;
        };
        SearchPanes.prototype._updateTable = function (dtPane, tableCols, idx, select) {
            var selectedRows = dtPane.table.rows({ selected: true }).data().toArray();
            tableCols[idx] = selectedRows;
            this._search(dtPane);
            // If either of the options that effect how the panes are displayed are selected then update the Panes
            if (this.c.cascadePanes || this.c.viewTotal) {
                this._updatePane(dtPane.index, select);
            }
        };
        SearchPanes.prototype._search = function (paneIn) {
            var table = this.s.dt;
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
        };
        SearchPanes.prototype._updatePane = function (callerIndex, select) {
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
                        if (pane !== undefined) {
                            var selected = pane.table.rows({ selected: true }).data().toArray().length;
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
            for (var _b = 0, _c = this.panes; _b < _c.length; _b++) {
                var pane = _c[_b];
                // Update the panes if doing a deselect. if doing a select then
                // update all of the panes except for the one causing the change
                if (pane !== undefined && (pane.index !== callerIndex || !select || !this.s.filteringActive)) {
                    var selected = pane.table.rows({ selected: true }).data().toArray();
                    var colOpts = this.s.colOpts[pane.index];
                    var arrayFilter = [];
                    var arrayTotals = [];
                    var table = this.s.dt;
                    var classes = this.classes;
                    var data = [];
                    var prev = [];
                    var binsTotal = void 0;
                    var scrollTop = $(pane.table.table().node()).parent()[0].scrollTop;
                    // Clear the pane in preparation for adding the updated search options
                    pane.table.clear();
                    this._populatePane(table, colOpts, classes, pane.index, arrayFilter);
                    // If the viewTotal option is selected then find the totals for the table
                    if (this.c.viewTotal) {
                        this._detailsPane(table, colOpts, classes, pane.index, arrayTotals);
                        binsTotal = this._binData(this._flatten(arrayTotals));
                        this._findUnique(prev, data, arrayTotals);
                    }
                    var bins = this._binData(this._flatten(arrayFilter));
                    this._findUnique(prev, data, arrayFilter);
                    // If a filter has been removed so that only one remains then the remaining filter should have
                    // the non filtered formatting, therefore set filteringActive to be false.
                    if (filterIdx !== undefined && filterIdx === pane.index) {
                        this.s.filteringActive = false;
                    }
                    var _loop_1 = function (dataP) {
                        if (dataP && (colOpts.hide === undefined || colOpts.hide.indexOf(data.filter) === -1)) {
                            var row = void 0;
                            // If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
                            // Do this also if the viewTotal option has been selected and cascadePanes has not
                            row = pane.table.row.add({
                                display: dataP.display,
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
                    for (var _d = 0, data_1 = data; _d < data_1.length; _d++) {
                        var dataP = data_1[_d];
                        _loop_1(dataP);
                    }
                    // Set filtering Active to be again if it was previously set to false,
                    // so that succeeding panes have the correct formatting.
                    if (filterIdx !== undefined && filterIdx === pane.index) {
                        this.s.filteringActive = true;
                    }
                    // Add search options which were previously selected but whos results are no
                    // longer present in the resulting data set.
                    for (var _e = 0, selected_1 = selected; _e < selected_1.length; _e++) {
                        var selectedEl = selected_1[_e];
                        var row = pane.table.row.add({ filter: selectedEl.filter, shown: 0, total: 0, display: selectedEl.display });
                        row.select();
                    }
                    pane.table.draw();
                    pane.table.table().node().parentNode.scrollTop = scrollTop;
                }
            }
            this.s.updating = false;
        };
        SearchPanes.prototype._detailsPane = function (table, colOpts, classes, idx, arrayTotals) {
            var _this = this;
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayTotals);
            });
        };
        SearchPanes.prototype._populatePane = function (table, colOpts, classes, idx, arrayFilter) {
            var _this = this;
            table.rows({ search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(colOpts, table, rowIdx, idx, classes, arrayFilter);
            });
        };
        SearchPanes.prototype._populatePaneArray = function (colOpts, table, rowIdx, idx, classes, array) {
            // Retrieve the rendered data from the cell
            var filter = typeof (colOpts.orthogonal) === 'string'
                ? table.cell(rowIdx, idx).render(colOpts.orthogonal)
                : table.cell(rowIdx, idx).render(colOpts.orthogonal.search);
            var display = typeof (colOpts.orthogonal) === 'string'
                ? table.cell(rowIdx, idx).render(colOpts.orthogonal)
                : table.cell(rowIdx, idx).render(colOpts.orthogonal.display);
            console.log(filter, display, colOpts.orthogonal);
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
        SearchPanes.prototype._findUnique = function (prev, data, arrayFilter) {
            for (var _i = 0, arrayFilter_2 = arrayFilter; _i < arrayFilter_2.length; _i++) {
                var filterEl = arrayFilter_2[_i];
                if (prev.indexOf(filterEl.filter) === -1) {
                    data.push({
                        display: filterEl.display,
                        filter: filterEl.filter
                    });
                    prev.push(filterEl.filter);
                }
            }
        };
        SearchPanes.prototype._getOptions = function (colIdx) {
            var table = this.s.dt;
            var defaults = {
                grouping: undefined,
                match: 'exact',
                orthogonal: {
                    display: 'display',
                    hide: undefined,
                    search: 'filter',
                    show: undefined
                },
                preSelect: undefined
            };
            return $.extend(true, {}, defaults, table.settings()[0].aoColumns[colIdx].searchPane);
        };
        SearchPanes.prototype._variance = function (d) {
            var data = $.map(d, function (val, key) {
                return val;
            });
            var count = data.length;
            var sum = 0;
            for (var i = 0, ien = count; i < ien; i++) {
                sum += data[i];
            }
            var mean = sum / count;
            var varSum = 0;
            for (var i = 0, ien = count; i < ien; i++) {
                varSum += Math.pow(mean - data[i], 2);
            }
            return varSum / (count - 1);
        };
        SearchPanes.prototype._uniqueRatio = function (bins, rowCount) {
            return bins / rowCount;
        };
        SearchPanes.prototype._binData = function (data) {
            var out = {};
            data = this._flatten(data);
            for (var i = 0, ien = data.length; i < ien; i++) {
                var d = data[i].filter;
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
        };
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
        SearchPanes.prototype._getColType = function (table, idx) {
            return table.settings()[0].aoColumns[idx].sType;
        };
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
                title: 'title'
            }
        };
        SearchPanes.defaults = {
            cascadePanes: false,
            container: function (dt) {
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
            viewTotal: false
        };
        return SearchPanes;
    }());
    $.fn.dataTable.SearchPanes = SearchPanes;
    $.fn.DataTable.SearchPanes = SearchPanes;
    DataTable.Api.register('searchPanes.rebuild()', function () {
        return this.iterator('table', function (ctx) {
            if (ctx.searchPane) {
                ctx.searchPane.rebuild();
            }
        });
    });
    DataTable.Api.register('column().paneOptions()', function (options) {
        return this.iterator('column', function (ctx, idx) {
            var col = ctx.aoColumns[idx];
            if (!col.searchPane) {
                col.searchPane = {};
            }
            col.searchPane.values = options;
            if (ctx.searchPane) {
                ctx.searchPane.rebuild();
            }
        });
    });
    $(document).on('init.dt', function (e, settings, json) {
        if (e.namespace !== 'dt') {
            return;
        }
        var init = settings.oInit.searchPane;
        var defaults = DataTable.defaults.searchPane;
        if (init || defaults) {
            var opts = $.extend({}, init, defaults);
            if (init !== false) {
                var sep = new SearchPanes(settings, opts);
            }
        }
    });
    return SearchPanes;
}));
