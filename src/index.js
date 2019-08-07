/*! SearchPanes 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
 */
import SearchPane from './searchPane';
import SearchPanes from './searchPanes';
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
    $.fn.dataTable.SearchPanes = SearchPanes;
    $.fn.DataTable.SearchPanes = SearchPanes;
    $.fn.dataTable.SearchPane = SearchPane;
    $.fn.DataTable.SearchPane = SearchPane;
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
    var apiRegister = $.fn.dataTable.Api.register;
    apiRegister('searchPanes()', function () {
        return this;
    });
    apiRegister('searchPanes.repopulatePane()', function (callerIndex) {
        var ctx = this.context[0];
        ctx._searchPanes.repopulatePane(callerIndex);
    });
    apiRegister('searchPanes.clearSelections()', function () {
        var ctx = this.context[0];
        ctx._searchPanes.clearSelections();
    });
    apiRegister('searchPanes.hidePanes()', function (section) {
        if (section === void 0) { section = 'search'; }
        var ctx = this.context[0];
        ctx._searchPanes._hidePanes(section);
    });
    apiRegister('searchPanes.rebuild()', function () {
        var ctx = this.context[0];
        ctx._searchPanes.rebuild();
    });
    $.fn.dataTable.ext.buttons.searchPanesClear = {
        text: 'Clear Panes',
        action: function (e, dt, node, config) {
            dt.searchPanes.clearSelections();
        }
    };
    $.fn.dataTable.ext.buttons.searchPanesCollapse = {
        text: 'Search Panes',
        action: function (e, dt, node, config) {
            dt.searchPanes.hidePanes();
        }
    };
    $.fn.dataTable.ext.buttons.customPanesCollapse = {
        text: 'Custom Panes',
        action: function (e, dt, node, config) {
            dt.searchPanes.hidePanes('custom');
        }
    };
    $.fn.dataTable.ext.buttons.searchPanes = {
        text: 'Search Panes',
        init: function (dt, node, config) {
            var panes = new $.fn.dataTable.SearchPanes(dt);
            var message = dt.i18n('searchPanes.collapse', 'SearchPanes');
            dt.button(0).text(message);
            config._panes = panes;
        },
        action: function (e, dt, node, config) {
            e.stopPropagation();
            this.popover(config._panes.getNode(), {
                align: 'dt-container'
            });
            config._panes.adjust();
        }
    };
    function _init(settings) {
        var api = new DataTable.Api(settings);
        var opts = api.init().searchPanes || DataTable.defaults.searchPanes;
        return new SearchPanes(api, opts).getNode();
    }
    // DataTables `dom` feature option
    DataTable.ext.feature.push({
        cFeature: 'S',
        fnInit: _init
    });
    // DataTables 2 layout feature
    if (DataTable.ext.features) {
        DataTable.ext.features.register('searchPanes', _init);
    }
}));
