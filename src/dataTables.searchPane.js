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
/// <reference path = "../node_modules/@types/jquery/index.d.ts"/>
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
            var that = this;
            var table = new DataTable.Api(settings);
            this.panes = [];
            this.classes = $.extend(true, {}, SearchPanes["class"]);
            this.dom = {
                container: $('<div/>').addClass(this.classes.container)
            };
            this.c = $.extend(true, {}, SearchPanes.defaults, opts);
            this.s = {
                dt: table,
                updating: false
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
                that.panes.push(that._pane(idx));
            });
            this._reloadSelect(loadedFilter, that);
            this._attach();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            table.on('stateSaveParams.dt', function (e, settings, data) {
                if (!data.filter) {
                    data.filter = [];
                }
                for (var i = 0; i < that.panes.length; i++) {
                    if (that.panes[i] !== undefined) {
                        data.filter[i] = that.panes[i].table.rows({ selected: true }).data().pluck(0).flatten().toArray();
                    }
                }
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
                    var rows = table.rows({ order: "index" }).data().pluck(0);
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
        SearchPanes.prototype._getColType = function (table, idx) {
            return table.settings()[0].aoColumns[idx].sType;
        };
        SearchPanes.prototype._pane = function (idx) {
            var _this = this;
            var classes = this.classes;
            var itemClasses = classes.item;
            var paneClasses = classes.pane;
            var table = this.s.dt;
            var column = table.column(idx);
            var colOpts = this._getOptions(idx);
            var dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
            var container = this.dom.container;
            var colType = this._getColType(table, idx);
            if (!colOpts.options) {
            }
            var binData = typeof colOpts.options === 'function' ?
                colOpts.options(table, idx) :
                colOpts.options ?
                    new DataTable.Api(null, colOpts.options) :
                    column.data();
            var bins = this._binData(binData.flatten());
            // Don't show the pane if there isn't enough variance in the data
            // colOpts.options is checked incase the options to restrict the choices are selected
            if (this._variance(bins) < this.c.threshold && !colOpts.options) {
                console.log(binData);
                return;
            }
            $(container).append(dt);
            var dtPane = {
                table: $(dt).DataTable({
                    "paging": false,
                    "scrollY": "200px",
                    "info": false,
                    select: true,
                    'searching': this.c.searchBox,
                    columnDefs: [
                        { type: colType, targets: 0 }
                    ]
                }),
                index: idx
            };
            // On initialisation, do we need to set a filtering value from a
            // saved state or init option?
            var search = column.search();
            search = search ? search.substr(1, search.length - 2).split('|') : [];
            var data = binData
                .unique()
                .sort()
                .toArray();
            var count = 0;
            binData.toArray().forEach(function (element) {
                if (element === '') {
                    count++;
                }
            });
            for (var i = 0, ien = data.length; i < ien; i++) {
                if (data[i]) {
                    dtPane.table.row.add([data[i], bins[data[i]]]);
                }
                else {
                    dtPane.table.row.add([this.c.emptyMessage, count]);
                }
            }
            $.fn.dataTable.select.init(dtPane.table);
            dtPane.table.draw();
            var t0;
            dtPane.table.on('select.dt', function () {
                clearTimeout(t0);
                if (!_this.s.updating) {
                    dtPane.table.rows({ selected: true }).data().toArray();
                    _this._search(dtPane);
                    if (_this.c.filterPanes) {
                        _this._updatePane(dtPane.index, true);
                    }
                }
            });
            dtPane.table.on('deselect.dt', function () {
                t0 = setTimeout(function () {
                    dtPane.table.rows({ selected: true }).data().toArray();
                    _this._search(dtPane);
                    if (_this.c.filterPanes) {
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
            var filters = paneIn.table.rows({ selected: true }).data().pluck(0).flatten().toArray();
            var nullIndex = filters.indexOf(this.c.emptyMessage);
            var container = $(paneIn.table.table().container());
            if (nullIndex > -1) {
                filters[nullIndex] = '';
            }
            if (filters.length > 0) {
                container.addClass("selected");
            }
            if (filters.length === 0) {
                container.removeClass("selected");
                table
                    .columns(columnIdx)
                    .search('')
                    .draw();
            }
            else if (options.match === 'any') {
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
                table
                    .columns(columnIdx)
                    .search('^(' +
                    $.map(filters, function (filter) {
                        return $.fn.dataTable.util.escapeRegex(filter);
                    })
                        .join('|')
                    + ')$', true, false)
                    .draw();
            }
        };
        SearchPanes.prototype._updatePane = function (callerIndex, select) {
            for (var i = 0; i < this.panes.length; i++) {
                // Update the panes if doing a deselct. if doing a select then 
                // update all of the panes except for the one causing the change
                if (this.panes[i] !== undefined && (this.panes[i].index !== callerIndex || !select)) {
                    var selected = this.panes[i].table.rows({ selected: true }).data().pluck(0);
                    var colOpts = this._getOptions(this.panes[i].index);
                    var column = this.s.dt.column(this.panes[i].index, { search: "applied" });
                    this.panes[i].table.clear();
                    var binData = typeof colOpts.options === 'function' ?
                        colOpts.options(this.s.dt, this.panes[i].index) :
                        colOpts.options ?
                            new DataTable.Api(null, colOpts.options) :
                            column.data();
                    var bins = this._binData(binData.flatten());
                    var data = binData
                        .unique()
                        .sort()
                        .toArray();
                    this.s.updating = true;
                    for (var j = 0; j < data.length; j++) {
                        if (data[j]) {
                            var row = this.panes[i].table.row.add([data[j], bins[data[j]]]);
                            var selectIndex = selected.indexOf(data[j]);
                            if (selectIndex > -1) {
                                row.select();
                                selected.splice(selectIndex, 1);
                            }
                        }
                    }
                    if (selected.length > 0) {
                        for (var j = 0; j < selected.length; j++) {
                            var row = this.panes[i].table.row.add([selected[j], 0]);
                            row.select();
                        }
                    }
                    this.s.updating = false;
                    this.panes[i].table.draw();
                }
            }
        };
        SearchPanes.prototype._getOptions = function (colIdx) {
            var table = this.s.dt;
            return table.settings()[0].aoColumns[colIdx].searchPane || {};
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
            for (var i = 0, ien = data.length; i < ien; i++) {
                var d = data[i];
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
            var that = this;
            this.dom.container.empty();
            this.s.dt
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                that._pane(idx);
            });
            //$.fn.dataTable.tables({visible: true, api: true}).columns.adjust();
        };
        SearchPanes["class"] = {
            container: 'dt-searchPanes',
            clear: 'clear',
            pane: {
                active: 'filtering',
                container: 'pane',
                title: 'title',
                scroller: 'scroller'
            },
            item: {
                selected: 'selected',
                label: 'label',
                count: 'count'
            }
        };
        SearchPanes.defaults = {
            container: function (dt) {
                return dt.table().container();
            },
            columns: undefined,
            insert: 'prepend',
            threshold: 0.5,
            minRows: 1,
            searchBox: true,
            cascaderPanes: false,
            emptyMessage: "<i>No Data</i>"
        };
        SearchPanes.version = '0.0.2';
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
                new SearchPanes(settings, opts);
            }
        }
    });
    return SearchPanes;
}));
