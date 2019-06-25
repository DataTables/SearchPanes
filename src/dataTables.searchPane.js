/*! SearchPane 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
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
            this.classes = $.extend(true, {}, SearchPanes["class"]);
            this.dom = {
                container: $('<div/>').addClass(this.classes.container)
            };
            this.c = $.extend(true, {}, SearchPanes.defaults, opts);
            this.s = {
                dt: table
            };
            table.settings()[0].searchPane = this;
            table
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                that._pane(idx);
            });
            $(this.dom.container)
                .on('click', 'li', function () {
                that._toggle(this);
            })
                .on('click', 'button.' + this.classes.clear, function () {
                that._clear($(this).closest('div.' + that.classes.pane.container));
            });
            table
                .on('draw.dtsp', function () {
                console.log("IN");
                console.log(table.page.info().recordsTotal);
                console.log(that.c.minRows);
                if (table.page.info().recordsTotal < that.c.minRows) {
                    that.dom.container.css('display', 'none');
                }
                else {
                    that.dom.container.css('display', 'flex');
                }
            });
            this._attach();
        }
        SearchPanes.prototype.rebuild = function () {
            var that = this;
            this.dom.container.empty();
            this.s.dt
                .columns(this.c.columns)
                .eq(0)
                .each(function (idx) {
                that._pane(idx);
            });
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
        SearchPanes.prototype._clear = function (pane) {
            var classes = this.classes;
            var itemSelected = classes.item.selected;
            pane.find('li.' + itemSelected).removeClass(itemSelected);
            pane.removeClass(classes.pane.active);
            this.s.dt
                .column(pane.data('column'))
                .search('')
                .draw();
        };
        SearchPanes.prototype._pane = function (idx) {
            var classes = this.classes;
            var itemClasses = classes.item;
            var paneClasses = classes.pane;
            var table = this.s.dt;
            var column = table.column(idx);
            var colOpts = this._getOptions(idx);
            var list = $('<ul/>');
            var binData = typeof colOpts.options === 'function' ?
                colOpts.options(table, idx) :
                colOpts.options ?
                    new DataTable.Api(null, colOpts.options) :
                    column.data();
            var bins = this._binData(binData.flatten());
            // Don't show the pane if there isn't enough variance in the data
            if (this._variance(bins) < this.c.threshold) {
                return;
            }
            // On initialisation, do we need to set a filtering value from a
            // saved state or init option?
            var search = column.search();
            search = search ? search.substr(1, search.length - 2).split('|') : [];
            var data = binData
                .unique()
                .sort()
                .toArray();
            for (var i = 0, ien = data.length; i < ien; i++) {
                if (data[i]) {
                    var li = $('<li/>')
                        .html('<span class="' + itemClasses.label + '">' + data[i] + '</span>')
                        .data('filter', data[i])
                        .append($('<span/>')
                        .addClass(itemClasses.count)
                        .html(bins[data[i]]));
                    if (search.length) {
                        var escaped = data[i].replace ? $.fn.dataTable.util.escapeRegex(data[i]) : data[i];
                        if ($.inArray(escaped, search) !== -1) {
                            li.addClass(itemClasses.selected);
                        }
                    }
                    list.append(li);
                }
            }
            var pane = $('<div/>')
                .data('column', idx)
                .addClass(paneClasses.container)
                .addClass(search.length ? paneClasses.active : '')
                .append($('<button type="button">&times;</button>').addClass(this.classes.clear))
                .append($('<div/>')
                .addClass(paneClasses.title)
                .html($(column.header()).text()))
                .append($('<div/>')
                .addClass(paneClasses.scroller)
                .append(list));
            var container = this.dom.container;
            var replace = container.children().map(function () {
                if ($(this).data('column') == idx) {
                    return this;
                }
            });
            if (replace.length) {
                replace.replaceWith(pane);
            }
            else {
                $(container).append(pane);
            }
        };
        SearchPanes.prototype._getOptions = function (colIdx) {
            var table = this.s.dt;
            return table.settings()[0].aoColumns[colIdx].searchPane || {};
        };
        SearchPanes.prototype._toggle = function (liIn) {
            var classes = this.classes;
            var itemSelected = classes.item.selected;
            var table = this.s.dt;
            var li = $(liIn);
            var pane = li.closest('div.' + classes.pane.container);
            var columnIdx = pane.data('column');
            var options = this._getOptions(columnIdx);
            li.toggleClass(itemSelected, !li.hasClass(itemSelected));
            var filters = pane.find('li.' + itemSelected);
            if (filters.length === 0) {
                pane.removeClass(classes.pane.active);
                table
                    .column(columnIdx)
                    .search('')
                    .draw();
            }
            else if (options.match === 'any') {
                // Allow sub-word matching
                pane.addClass(classes.pane.active);
                table
                    .column(columnIdx)
                    .search('(' +
                    $.map(filters, function (filter) {
                        var d = $(filter)
                            .data('filter')
                            .toString();
                        var decoded = $('<div/>')
                            .html(d)
                            .text();
                        return $.fn.dataTable.util.escapeRegex(decoded);
                    }).join('|') +
                    ')', true, false)
                    .draw();
            }
            else {
                // Only search on the full phrase
                pane.addClass(classes.pane.active);
                table
                    .column(columnIdx)
                    .search('^(' +
                    $.map(filters, function (filter) {
                        var d = $(filter)
                            .data('filter')
                            .toString();
                        var decoded = $('<div/>')
                            .html(d)
                            .text();
                        return $.fn.dataTable.util.escapeRegex(decoded);
                    }).join('|') +
                    ')$', true, false)
                    .draw();
            }
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
            minRows: 1
        };
        SearchPanes.version = '0.0.2';
        return SearchPanes;
    }());
    ;
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
