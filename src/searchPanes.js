var DataTable = $.fn.dataTable;
import SearchPane from './searchPane';
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
        this.classes = $.extend(true, {}, SearchPanes.classes);
        // Get options from user
        this.c = $.extend(true, {}, SearchPanes.defaults, opts);
        // Add extra elements to DOM object including clear
        this.dom = {
            clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
            container: $('<div/>').addClass(this.classes.panes),
            options: $('<div/>').addClass(this.classes.container),
            panes: $('<div/>').addClass(this.classes.container),
            title: $('<div/>').addClass(this.classes.title),
            wrapper: $('<div/>')
        };
        this.s = {
            colOpts: [],
            dt: table
        };
        table.settings()[0]._searchPanes = this;
        this.dom.clearAll[0].innerHTML = table.i18n('searchPanes.clearMessage', 'Clear All');
        // Create Panes
        table
            .columns(this.c.columns)
            .eq(0)
            .each(function (idx) {
            _this.panes.push(new SearchPane(paneSettings, opts, idx, _this.c.layout));
        });
        // If there is any extra custom panes defined then create panes for them too
        var rowLength = table.columns().eq(0).toArray().length;
        if (this.c.panes !== undefined) {
            var paneLength = this.c.panes.length;
            for (var i = 0; i < paneLength; i++) {
                var id = rowLength + i;
                this.panes.push(new SearchPane(paneSettings, opts, id, this.c.layout, this.c.panes[i]));
            }
        }
        // PreSelect any selections which have been defined using the preSelect option
        table
            .columns(this.c.columns)
            .eq(0)
            .each(function (idx) {
            if (_this.panes[idx] !== undefined && _this.panes[idx].s.dtPane !== undefined && _this.panes[idx].s.colOpts.preSelect !== undefined) {
                var tableLength = _this.panes[idx].s.dtPane.rows().data().toArray().length;
                for (var i = 0; i < tableLength; i++) {
                    if (_this.panes[idx].s.colOpts.preSelect.indexOf(_this.panes[idx].s.dtPane.cell(i, 0).data()) !== -1) {
                        _this.panes[idx].s.dtPane.row(i).select();
                        _this.panes[idx]._updateTable(true);
                    }
                }
            }
        });
        // Attach panes, clear buttons, and title bar to the document
        this._updateFilterCount();
        this._attachPaneContainer();
        // (DataTable as any).tables({visible: true, api: true}).columns.adjust();
        table.columns(this.c.columns).eq(0).each(function (idx) {
            if (_this.panes[idx] !== undefined && _this.panes[idx].s.dtPane !== undefined) {
                _this.panes[idx].s.dtPane.columns.adjust();
            }
        });
        // Update the title bar to show how many filters have been selected
        this.panes[0]._updateFilterCount();
        // When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
        var initDraw = true;
        table.on('draw.dt', function (e, settings, data) {
            _this._updateFilterCount();
            if (initDraw) {
                initDraw = false;
            }
            else {
                if (_this.c.cascadePanes || _this.c.viewTotal) {
                    _this.redrawPanes();
                }
            }
        });
        // When the clear All button has been pressed clear all of the selections in the panes
        if (this.c.clear) {
            this.dom.clearAll[0].addEventListener('click', function () {
                _this.clearSelections();
            });
        }
        table.settings()[0]._searchPanes = this;
    }
    /**
     * Call the adjust function for all of the panes
     */
    SearchPanes.prototype.adjust = function () {
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            if (pane.s.dtPane !== undefined) {
                pane.adjust();
            }
        }
    };
    SearchPanes.prototype.redrawPanes = function () {
        var table = this.s.dt;
        if (!this.s.updating) {
            var filterActive = true;
            if (table.rows({ search: 'applied' }).data().toArray().length === table.rows().data().toArray().length) {
                filterActive = false;
            }
            for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.dtPane !== undefined) {
                    pane._updatePane(false, filterActive, true);
                }
            }
            this._updateFilterCount();
        }
    };
    /**
     * Clear the selections of all of the panes
     */
    SearchPanes.prototype.clearSelections = function () {
        var searches = document.getElementsByClassName('dtsp-search');
        for (var i = 0; i < searches.length; i++) {
            $(searches[i]).val('');
            $(searches[i]).trigger('input');
        }
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            if (pane.s.dtPane !== undefined) {
                pane.clearPane();
            }
        }
    };
    /**
     * returns the container node for the searchPanes
     */
    SearchPanes.prototype.getNode = function () {
        return this._attachPaneContainer();
    };
    /**
     * rebuilds all of the panes
     */
    SearchPanes.prototype.rebuild = function (targetIdx) {
        if (targetIdx === void 0) { targetIdx = false; }
        this.dom.container.empty();
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            if (targetIdx !== false && pane.s.index !== targetIdx) {
                continue;
            }
            pane.rebuildPane();
        }
        // Attach panes, clear buttons, and title bar to the document
        this._updateFilterCount();
        this._attachPaneContainer();
        DataTable.tables({ visible: true, api: true }).columns.adjust();
        // Update the title bar to show how many filters have been selected
        this.panes[0]._updateFilterCount();
    };
    /**
     * repopulates the desired pane by extracting new data from the table. faster than doing a rebuild
     * @param callerIndex the index of the pane to be rebuilt
     */
    SearchPanes.prototype.repopulatePane = function (callerIndex) {
        this.panes[callerIndex].repopulatePane();
    };
    /**
     * Updates the number of filters that have been applied in the title
     */
    SearchPanes.prototype._updateFilterCount = function () {
        var filterCount = 0;
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            if (pane.s.dtPane !== undefined) {
                filterCount += pane._updateFilterCount();
            }
        }
        var message = this.s.dt.i18n('searchPanes.title', 'Filters Active - %d', filterCount);
        this.dom.title[0].innerHTML = (message);
        this.c.filterChanged(filterCount);
    };
    /**
     * Attach the panes, buttons and title to the document
     */
    SearchPanes.prototype._attach = function () {
        var titleRow = $('<div/>');
        titleRow.addClass(this.classes.titleRow);
        $(this.dom.title).appendTo(titleRow);
        // If the clear button is permitted attach it
        if (this.c.clear) {
            $(this.dom.clearAll).appendTo(titleRow);
        }
        $(titleRow).appendTo(this.dom.container);
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            $(pane.dom.container).appendTo(this.dom.panes);
        }
        $(this.dom.panes).appendTo(this.dom.container);
        $(this.dom.container.appendTo(this.dom.wrapper));
        return this.dom.wrapper;
    };
    SearchPanes.prototype._attachMessage = function () {
        var emptyMessage = $('<div/>');
        var message = this.s.dt.i18n('searchPanes.emptyPanes', '');
        emptyMessage[0].innerHTML = message;
        $(this.dom.container).empty();
        emptyMessage.appendTo(this.dom.container);
        if (message === '') {
            $(this.dom.container).remove();
            return this.dom.wrapper;
        }
        $(this.dom.container).appendTo(this.dom.wrapper);
        return this.dom.wrapper;
    };
    SearchPanes.prototype._attachPaneContainer = function () {
        var showMSG = true;
        if (this.panes !== undefined) {
            for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.displayed === true) {
                    showMSG = false;
                    return this._attach();
                    break;
                }
            }
        }
        if (showMSG) {
            return this._attachMessage();
        }
    };
    SearchPanes.version = '0.0.2';
    SearchPanes.classes = {
        arrayCols: [],
        clear: 'dtsp-clear',
        clearAll: 'dtsp-clearAll',
        container: 'dtsp-searchPanes',
        hide: 'dtsp-hide',
        item: {
            count: 'dtsp-count',
            label: 'dtsp-label',
            selected: 'dtsp-selected'
        },
        pane: {
            active: 'dtsp-filtering',
            container: 'dtsp-pane',
            scroller: 'dtsp-scroller',
            title: 'dtsp-title'
        },
        panes: 'dtsp-panesContainer',
        title: 'dtsp-title',
        titleRow: 'dtsp-titleRow'
    };
    // Define SearchPanes default options
    SearchPanes.defaults = {
        clear: true,
        container: function (dt) {
            return dt.table().container();
        },
        columns: undefined,
        filterChanged: function () {
            return;
        },
        layout: 'columns-3'
    };
    return SearchPanes;
}());
export default SearchPanes;
