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
        this.classes = $.extend(true, {}, SearchPanes["class"]);
        // Add extra elements to DOM object including clear and hide buttons
        this.dom = {
            clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
            container: $('<div/>').addClass(this.classes.container),
            options: $('<div/>').addClass(this.classes.container),
            title: $('<div/>').addClass(this.classes.title)
        };
        // Get options from user
        this.c = $.extend(true, {}, SearchPanes.defaults, opts);
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
            _this.panes.push(new SearchPane(paneSettings, opts, idx));
        });
        // If there is any extra custom panes defined then create panes for them too
        var rowLength = table.columns().eq(0).toArray().length;
        if (this.c.panes !== undefined) {
            var paneLength = this.c.panes.length;
            for (var i = 0; i < paneLength; i++) {
                var id = rowLength + i;
                this.panes.push(new SearchPane(paneSettings, opts, id));
            }
        }
        // PreSelect any selections which have been defined using the preSelect option
        table
            .columns(this.c.columns)
            .eq(0)
            .each(function (idx) {
            if (_this.panes[idx].s.colOpts.preSelect !== undefined) {
                for (var i = 0; i < _this.panes[idx].s.dtPane.rows().data().toArray().length; i++) {
                    if (_this.panes[idx].s.colOpts.preSelect.indexOf(_this.panes[idx].s.dtPane.cell(i, 0).data()) !== -1) {
                        _this.panes[idx].s.dtPane.row(i).select();
                        _this.panes[idx]._updateTable(true);
                    }
                }
            }
        });
        // Attach panes, clear buttons, hide button and title bar to the document
        this._updateFilterCount();
        this._attach();
        DataTable.tables({ visible: true, api: true }).columns.adjust();
        // Update the title bar to show how many filters have been selected
        this.panes[0]._updateFilterCount();
        // When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
        table.on('draw.dt', function (e, settings, data) {
            var filterActive = true;
            if (table.rows({ search: 'applied' }).data().toArray().length === table.rows().data().toArray().length) {
                filterActive = false;
            }
            for (var _i = 0, _a = _this.panes; _i < _a.length; _i++) {
                var pane = _a[_i];
                if (pane.s.dtPane !== undefined) {
                    pane._updatePane(false, filterActive, true);
                }
            }
            _this._updateFilterCount();
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
    /**
     * Clear the selections of all of the panes
     */
    SearchPanes.prototype.clearSelections = function () {
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
        return this.dom.container;
    };
    /**
     * rebuilds all of the panes
     */
    SearchPanes.prototype.rebuild = function () {
        this.dom.container.empty();
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            pane.rebuildPane();
        }
        // Attach panes, clear buttons, hide button and title bar to the document
        this._updateFilterCount();
        this._attach();
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
    };
    /**
     * Attach the panes, buttons and title to the document
     */
    SearchPanes.prototype._attach = function () {
        $(this.dom.options).appendTo(this.dom.container);
        $(this.dom.title).appendTo(this.dom.container);
        for (var _i = 0, _a = this.panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            $(pane.dom.container).appendTo(this.dom.container);
        }
        // If the hide button is permitted attach it
        if (this.c.clear) {
            $(this.dom.clearAll).appendTo(this.dom.container);
        }
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
        clear: true,
        container: function (dt) {
            return dt.table().container();
        },
        columns: undefined
    };
    return SearchPanes;
}());
export default SearchPanes;
