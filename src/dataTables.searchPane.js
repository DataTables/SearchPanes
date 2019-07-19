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
                dt: table,
                updating: false,
                columns: [
                // { selected: []},
                ]
            };
            table.settings()[0].searchPane = this;
            var loadedFilter;
            var loadTest = table.state.loaded();
            if (table.state.loaded()) {
                loadedFilter = table.state.loaded().filter;
            }
            table
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                _this.panes.push(_this._pane(idx));
            });
            this._reloadSelect(loadedFilter, this);
            this._attach();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            table.on('stateSaveParams.dt', function (data) {
                var _this = this;
                if (!data.filter) {
                    data.filter = [];
                }
                var me = function () {
                    for (var i = 0; i < _this.panes.length; i++) {
                        if (_this.panes[i] !== undefined) {
                            data.filter[i] = _this.panes[i].table.rows({ selected: true }).data().pluck(0).flatten().toArray();
                        }
                    }
                };
            });
            table.state.save();
        }
        SearchPanes.prototype._reloadSelect = function (loadedFilter, that) {
            if (loadedFilter === undefined) {
                return;
            }
            for (var i = 0; i < that.panes.length; i++) {
                if (loadedFilter[i] !== null && loadedFilter[i] !== undefined) {
                    var table = that.panes[i].table;
                    var rows = table.rows({ order: 'index' }).data().pluck(0);
                    for (var j = 0; j < loadedFilter[i].length; j++) {
                        var id = loadedFilter[i].indexOf(rows[j]);
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
            var colOpts = this._getOptions(idx);
            var dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
            var container = this.dom.container;
            var colType = this._getColType(table, idx);
            var arrayFilter = [];
            tableCols.push([]);
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var filter = typeof (colOpts.orthogonal) === 'string' ? table.cell(rowIdx, idx).render(colOpts.orthogonal) :
                    table.cell(rowIdx, idx).render(colOpts.orthogonal.filter);
                var display = typeof (colOpts.orthogonal) === 'string' ? table.cell(rowIdx, idx).render(colOpts.orthogonal) :
                    table.cell(rowIdx, idx).render(colOpts.orthogonal.display);
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
                        display: display,
                        filter: filter
                    });
                }
            });
            $.fn.dataTable.ext.search.push(function (settings, data, dataIndex, origData) {
                if (tableCols[idx].length === 0) {
                    return true;
                }
                var filter = data[idx];
                if (colOpts.orthogonal.filter !== 'filter') {
                    filter = typeof (colOpts.orthogonal) === 'string'
                        ? table.cell(dataIndex, idx).render(colOpts.orthogonal)
                        : table.cell(dataIndex, idx).render(colOpts.orthogonal.filter);
                }
                for (var i = 0; i < tableCols[idx].length; i++) {
                    var town = data[2] || '';
                    if (filter.indexOf(tableCols[idx][i].filter) !== -1) {
                        return true;
                    }
                }
                return false;
            });
            var bins = this._binData(this._flatten(arrayFilter));
            // Don't show the pane if there isn't enough variance in the data
            // colOpts.options is checked incase the options to restrict the choices are selected
            if (this._variance(bins) < this.c.threshold && !colOpts.options) {
                return;
            }
            $(container).append(dt);
            var dtPane = {
                index: idx,
                table: $(dt).DataTable({
                    columnDefs: [
                        { data: 'display', type: colType, targets: 0 },
                        { data: 'count', type: colType, targets: 1 }
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
            for (var _i = 0, arrayFilter_1 = arrayFilter; _i < arrayFilter_1.length; _i++) {
                var i = arrayFilter_1[_i];
                if (prev.indexOf(i.filter) === -1) {
                    data.push({
                        display: i.display,
                        filter: i.filter
                    });
                    prev.push(i.filter);
                }
            }
            var count = 0;
            arrayFilter.forEach(function (element) {
                if (element.filter === '') {
                    count++;
                }
            });
            for (var i = 0, ien = data.length; i < ien; i++) {
                if (data[i]) {
                    for (var _a = 0, arrayFilter_2 = arrayFilter; _a < arrayFilter_2.length; _a++) {
                        var j = arrayFilter_2[_a];
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
                    dtPane.table.row.add({ filter: this.c.emptyMessage, count: count, display: this.c.emptyMessage });
                }
            }
            $.fn.dataTable.select.init(dtPane.table);
            dtPane.table.draw();
            var t0;
            dtPane.table.on('select.dt', function () {
                clearTimeout(t0);
                if (!_this.s.updating) {
                    var selectedRows = dtPane.table.rows({ selected: true }).data().toArray();
                    tableCols[idx] = selectedRows;
                    _this._search(dtPane);
                    if (_this.c.cascadePanes) {
                        _this._updatePane(dtPane.index, true);
                    }
                }
            });
            dtPane.table.on('deselect.dt', function () {
                t0 = setTimeout(function () {
                    var selectedRows = dtPane.table.rows({ selected: true }).data().toArray();
                    tableCols[idx] = selectedRows;
                    _this._search(dtPane);
                    if (_this.c.cascadePanes) {
                        _this._updatePane(dtPane.index, false);
                    }
                }, 50);
            });
            return dtPane;
        };
        SearchPanes.prototype._search = function (paneIn) {
            var columnIdx = paneIn.index;
            var table = this.s.dt;
            var options = this._getOptions(columnIdx);
            var filters = paneIn.table.rows({ selected: true }).data().pluck('filter').toArray();
            var nullIndex = filters.indexOf(this.c.emptyMessage);
            var container = $(paneIn.table.table().container());
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
            else if (options.match === 'any' || this.classes.arrayCols.indexOf(columnIdx) !== -1) {
                table
                    .column(columnIdx)
                    .search('(' +
                    $.map(filters, function (filter) {
                        if (filter !== '') {
                            return $.fn.dataTable.util.escapeRegex(filter);
                        }
                        else {
                            return '^$';
                        }
                    })
                        .join('|')
                    + ')', true, false)
                    .draw();
            }
            else {
                table.draw();
                /**
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
                // */
            }
        };
        SearchPanes.prototype._updatePane = function (callerIndex, select) {
            var _loop_1 = function (pane) {
                // Update the panes if doing a deselct. if doing a select then
                // update all of the panes except for the one causing the change
                if (pane !== undefined && (pane.index !== callerIndex || !select)) {
                    var selected = pane.table.rows({ selected: true }).data().pluck(0);
                    var colOpts_1 = this_1._getOptions(pane.index);
                    var column = this_1.s.dt.column(pane.index, { search: 'applied' });
                    var arrayFilter_4 = [];
                    var table_1 = this_1.s.dt;
                    var idx_1 = pane.index;
                    var visibleRows = table_1.rows();
                    var classes_1 = this_1.classes;
                    pane.table.clear();
                    visibleRows.every(function (rowIdx, tableLoop, rowLoop) {
                        var filter = typeof (colOpts_1.orthogonal) === 'string' ? table_1.cell(rowIdx, idx_1).render(colOpts_1.orthogonal) :
                            table_1.cell(rowIdx, idx_1).render(colOpts_1.orthogonal.filter);
                        var display = typeof (colOpts_1.orthogonal) === 'string' ? table_1.cell(rowIdx, idx_1).render(colOpts_1.orthogonal) :
                            table_1.cell(rowIdx, idx_1).render(colOpts_1.orthogonal.display);
                        if (Array.isArray(filter) || filter instanceof DataTable.Api) {
                            if (classes_1.arrayCols.indexOf(idx_1) === -1) {
                                classes_1.arrayCols.push(idx_1);
                            }
                            if (filter instanceof DataTable.Api) {
                                filter = filter.toArray();
                                display = display.toArray();
                            }
                            colOpts_1.match = 'any';
                            if (filter.length === display.length) {
                                for (var i = 0; i < filter.length; i++) {
                                    arrayFilter_4.push({
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
                            arrayFilter_4.push({
                                display: display,
                                filter: filter
                            });
                        }
                    });
                    var bins = this_1._binData(this_1._flatten(arrayFilter_4));
                    var data = [];
                    var prev = [];
                    for (var _i = 0, arrayFilter_3 = arrayFilter_4; _i < arrayFilter_3.length; _i++) {
                        var i = arrayFilter_3[_i];
                        if (prev.indexOf(i.filter) === -1) {
                            data.push({
                                display: i.display,
                                filter: i.filter
                            });
                            prev.push(i.filter);
                        }
                    }
                    this_1.s.updating = true;
                    for (var _a = 0, data_1 = data; _a < data_1.length; _a++) {
                        var dataP = data_1[_a];
                        if (dataP) {
                            var row = pane.table.row.add({ filter: dataP.filter, count: bins[dataP.filter], display: dataP.display });
                            var selectIndex = selected.indexOf(dataP);
                            if (selectIndex > -1) {
                                row.select();
                                selected.splice(selectIndex, 1);
                            }
                        }
                    }
                    if (selected.length > 0) {
                        for (var _b = 0, selected_1 = selected; _b < selected_1.length; _b++) {
                            var selectPoint = selected_1[_b];
                            var row = pane.table.row.add({ filter: selectPoint, count: 0, display: selectPoint });
                            row.select();
                        }
                    }
                    this_1.s.updating = false;
                    pane.table.draw();
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                _loop_1(pane);
            }
        };
        SearchPanes.prototype._getOptions = function (colIdx) {
            var table = this.s.dt;
            var defaults = {
                match: 'exact',
                orthogonal: {
                    display: 'display',
                    search: 'filter'
                }
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
            emptyMessage: '<i>No Data</i>',
            insert: 'prepend',
            minRows: 1,
            searchBox: true,
            threshold: 0.5
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
