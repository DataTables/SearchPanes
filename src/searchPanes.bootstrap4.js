(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net-bs4', 'datatables.net-searchPanes'], function ($) {
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
                $ = require('datatables.net-bs4')(root, $).$;
            }
            if (!$.fn.dataTable.searchPanes) {
                require('datatables.net-searchPanes')(root, $);
            }
            return factory($, root, root.document);
        };
    }
    else {
        // Browser
        factory(jQuery, window, document);
    }
}(function ($, window, document) {
    'use strict';
    var DataTable = $.fn.dataTable;
    $.extend(true, DataTable.SearchPane.classes, {
        paneButton: 'btn btn-light',
        buttonGroup: 'btn-group col-',
        dull: 'disabled',
        pane: {
            container: 'table'
        },
        table: 'table table-sm',
        show: 'col',
        topRow: 'topRow row',
        search: 'col-sm form-control',
        searchLabelCont: 'input-group-append',
        //searchLabel:'btn-outline-secondary',
        searchCont: 'input-group col-sm'
    });
    $.extend(true, DataTable.SearchPanes.classes, {
        container: 'dt-searchPanes row',
        titleRow: 'row',
        clearAll: 'clearAll col-1 btn btn-light',
        title: 'dtsp-title col-10',
        panes: 'panes container'
    });
    return DataTable.searchPanes;
}));
