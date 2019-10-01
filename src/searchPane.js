var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var DataTable = $.fn.dataTable;
var SearchPane = /** @class */ (function () {
    /**
     * Creates the panes, sets up the search function
     * @param paneSettings The settings for the searchPanes
     * @param opts The options for the default features
     * @param idx the index of the column for this pane
     * @returns {object} the pane that has been created, including the table and the index of the pane
     */
    function SearchPane(paneSettings, opts, idx, layout, panes) {
        var _this = this;
        if (panes === void 0) { panes = {}; }
        // Check that the required version of DataTables is included
        if (!DataTable || !DataTable.versionCheck || !DataTable.versionCheck('1.10.0')) {
            throw new Error('SearchPane requires DataTables 1.10 or newer');
        }
        // Check that Select is included
        if (!DataTable.select) {
            throw new Error('SearchPane requires Select');
        }
        var table = new DataTable.Api(paneSettings);
        if (table.ajax.url() !== undefined && table.ajax.url() !== null) {
            table.one('init', function () {
                _this.rebuildPane();
            });
        }
        this.classes = $.extend(true, {}, SearchPane.classes);
        // Get options from user
        this.c = $.extend(true, {}, SearchPane.defaults, opts);
        if (Object.keys(panes).length > 0) {
            this.customPaneSettings = panes;
        }
        this.s = {
            colOpts: [],
            columns: [],
            dt: table,
            filteringActive: false,
            index: idx,
            redraw: false,
            updating: false
        };
        var rowLength = table.columns().eq(0).toArray().length;
        this.colExists = this.s.index < rowLength;
        // Add extra elements to DOM object including clear and hide buttons
        this.layout = layout;
        var layVal = parseInt(layout.split('-')[1], 10);
        this.dom = {
            buttonGroup: $('<div/>').addClass(this.classes.buttonGroup),
            clear: $('<button type="button">&#215;</button>')
                .addClass(this.classes.dull)
                .addClass(this.classes.paneButton)
                .addClass(this.classes.exit),
            container: $('<div/>').addClass(this.classes.container).addClass(this.classes.layout +
                (layVal < 7 ? layout : layout.split('-')[0] + '-6')),
            countButton: $('<button type="button">#↕</button>').addClass(this.classes.paneButton),
            dtP: $('<table><thead><tr><th>' +
                (this.colExists
                    ? $(table.column(this.colExists ? this.s.index : 0).header()).text()
                    : this.customPaneSettings.header) + '</th><th/></tr></thead></table>'),
            lower: $('<div/>').addClass(this.classes.subRows).addClass(this.classes.narrowButton),
            nameButton: $('<button type="button">&#128475;↕</button>').addClass(this.classes.paneButton),
            searchBox: $('<input/>').addClass(this.classes.paneInputButton).addClass(this.classes.search),
            searchButton: $('<button type = "button"><span class="' + this.classes.searchIcon + '">⚲</span></button>')
                .addClass(this.classes.paneButton)
                .addClass(this.classes.searchLabel),
            searchCont: $('<div/>').addClass(this.classes.searchCont),
            searchLabelCont: $('<div/>').addClass(this.classes.searchLabelCont),
            topRow: $('<div/>').addClass(this.classes.topRow),
            upper: $('<div/>').addClass(this.classes.subRows).addClass(this.classes.narrowSearch)
        };
        this.displayed = false;
        table = this.s.dt;
        this.selections = this.s.columns;
        this.s.colOpts = this.colExists ? this._getOptions() : this._getBonusOptions();
        var colOpts = this.s.colOpts;
        var clear = $('<button type="button">X</button>').addClass(this.classes.paneButton);
        clear[0].innerHTML = table.i18n('searchPanes.clearPane', 'X');
        this.dom.container.addClass(colOpts.className);
        // Custom search function for table
        $.fn.dataTable.ext.search.push(function (settings, searchData, dataIndex, origData) {
            if (settings.nTable !== table.table(0).node()) {
                return true;
            }
            // If no data has been selected then show all
            if (_this.selections.length === 0) {
                return true;
            }
            var filter = '';
            if (_this.colExists) {
                // Get the current filtered data
                filter = searchData[_this.s.index];
                if (colOpts.orthogonal.filter !== 'filter') {
                    var cell = table.cell(dataIndex, _this.s.index);
                    filter = typeof (colOpts.orthogonal) === 'string'
                        ? cell.render(colOpts.orthogonal)
                        : cell.render(colOpts.orthogonal.search);
                    if (filter instanceof $.fn.dataTable.Api) {
                        filter = filter.toArray();
                    }
                }
            }
            return _this._Search(filter, dataIndex);
        });
        this._buildPane();
        // If the clear button for this pane is clicked clear the selections
        if (this.c.clear) {
            clear[0].addEventListener('click', function () {
                var searches = _this.dom.container.getElementsByClassName(_this.classes.search);
                for (var _i = 0, searches_1 = searches; _i < searches_1.length; _i++) {
                    var search = searches_1[_i];
                    $(search).val('');
                    $(search).trigger('input');
                }
                _this._clearPane();
            });
        }
        // Sometimes the top row of the panes containing the search box and ordering buttons appears
        //  weird if the width of the panes is lower than expected, this fixes the design.
        // Equally this may occur when the table is resized.
        table.on('draw', function () {
            _this._adjustTopRow();
        });
        $(window).on('resize.dtr', DataTable.util.throttle(function () {
            _this._adjustTopRow();
        }));
        // When column-reorder is present and the columns are moved, it is necessary to
        //  reassign all of the panes indexes to the new index of the column.
        table.on('column-reorder', function (e, settings, details) {
            _this.s.index = details.mapping.indexOf(_this.s.index);
        });
        return this;
    }
    /**
     * Adjusts the width of the columns
     */
    SearchPane.prototype.adjust = function () {
        this.s.dtPane.columns.adjust();
    };
    /**
     * Rebuilds the panes from the start having deleted the old ones
     */
    SearchPane.prototype.rebuildPane = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // When rebuilding strip all of the HTML Elements out of the container and start from scratch
                        if (this.s.dtPane !== undefined) {
                            this.s.dtPane.clear().destroy();
                        }
                        this.dom.container.empty();
                        this.dom.container.removeClass(this.classes.hidden);
                        if (!this.s.dt.settings()[0].bInitialised) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._buildPane()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.s.dt.one('init', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._buildPane()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        _a.label = 3;
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Repopulates the options of the pane
     */
    SearchPane.prototype.repopulatePane = function () {
        // Store the value of updating at the start of this call so that it can be restored later.
        var updating = this.s.updating;
        this.s.updating = true;
        var filterCount = 0;
        var filterIdx;
        // If the viewTotal option is active then it must be determined whether there is a filter in place already
        if (this.c.viewTotal) {
            // Check each pane to find how many filters are in place in each
            var selectArray = this._getSelected(filterCount);
            // If there is only one in place then find the index of the corresponding pane
            if (filterCount === 1) {
                filterIdx = selectArray.indexOf(1);
            }
        }
        // Update the options within the pane
        this._updateCommon(filterIdx);
        // Reset the value of updating to the stored value at the start of the function
        this.s.updating = updating;
        return this;
    };
    /**
     * Adds a row to the panes table
     * @param display the value to be displayed to the user
     * @param filter the value to be filtered on when searchpanes is implemented
     * @param shown the number of rows in the table that are currently visible matching this criteria
     * @param total the total number of rows in the table that match this criteria
     * @param sort the value to be sorted in the pane table
     * @param type the value of which the type is to be derived from
     */
    SearchPane.prototype._addRow = function (display, filter, shown, total, sort, type) {
        return this.s.dtPane.row.add({
            display: display !== '' ? display : this.c.emptyMessage,
            filter: filter,
            shown: shown,
            sort: sort !== '' ? sort : this.c.emptyMessage,
            total: total,
            type: type
        });
    };
    /**
     * Adjusts the layout of the top row when the screen is resized
     */
    SearchPane.prototype._adjustTopRow = function () {
        var subContainers = this.dom.container.find('.' + this.classes.subRowsContainer);
        var subRows = this.dom.container.find('.dtsp-subRows');
        var topRow = this.dom.container.find('.' + this.classes.topRow);
        if ($(subContainers[0]).width() < 252 || $(topRow[0]).width() < 252) {
            $(subContainers[0]).addClass(this.classes.narrow);
            $(subRows[0]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowSearch);
            $(subRows[1]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowButton);
        }
        else {
            $(subContainers[0]).removeClass(this.classes.narrow);
            $(subRows[0]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowSearch);
            $(subRows[1]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowButton);
        }
    };
    /**
     * Caclulate the count for each different value in a column.
     * @param data The data to be binned
     * @return {object} out Object of different cell values as keys and counts as values
     */
    SearchPane.prototype._binData = function (data) {
        var out = {};
        data = this._flatten(data);
        // For every entry in the column
        for (var i = 0, ien = data.length; i < ien; i++) {
            var d = data[i].filter;
            if (d === null || d === undefined) {
                continue;
            }
            // If the entry is not currently mentioned in the output object then add it and set is value to 1
            if (!out[d]) {
                out[d] = 1;
            }
            // Otherwise increment it as another occurence has been identified
            else {
                out[d]++;
            }
        }
        return out;
    };
    /**
     * Method to construct the actual pane.
     */
    SearchPane.prototype._buildPane = function () {
        return __awaiter(this, void 0, void 0, function () {
            var table, column, colOpts, countMessage, filteredMessage, arrayFilter, arrayTotals, bins, binsTotal, binLength, uniqueRatio, errMode, search, dataFilter, count_1, i, ien, row, loadedFilter, t0;
            var _this = this;
            return __generator(this, function (_a) {
                // Aliases
                this.selections = this.s.columns;
                table = this.s.dt;
                column = table.column(this.colExists ? this.s.index : 0);
                colOpts = this.s.colOpts;
                countMessage = table.i18n('searchPanes.count', '{total}');
                filteredMessage = table.i18n('searchPanes.countFiltered', '{shown} ({total})');
                arrayFilter = [];
                arrayTotals = [];
                bins = {};
                binsTotal = {};
                // If it is not a custom pane in place
                if (this.colExists) {
                    // Perform checks that do not require populate pane to run
                    if (colOpts.show === false
                        || (colOpts.show !== undefined && colOpts.show !== true)) {
                        this.dom.container.addClass(this.classes.hidden);
                        return [2 /*return*/, false];
                    }
                    else if (colOpts.show === true) {
                        this.displayed = true;
                    }
                    arrayFilter = this._populatePane();
                    bins = this._binData(this._flatten(arrayFilter));
                    binLength = Object.keys(bins).length;
                    uniqueRatio = this._uniqueRatio(binLength, table.rows()[0].length);
                    // Don't show the pane if there isn't enough variance in the data, or there is only 1 entry for that pane
                    if (this.displayed === false && ((colOpts.show === undefined && (colOpts.threshold === undefined ?
                        uniqueRatio > this.c.threshold :
                        uniqueRatio > colOpts.threshold))
                        || (colOpts.show !== true && binLength <= 1))) {
                        this.dom.container.addClass(this.classes.hidden);
                        return [2 /*return*/];
                    }
                    // If the option viewTotal is true then find
                    // the total count for the whole table to display alongside the displayed count
                    if (this.c.viewTotal) {
                        arrayTotals = this._detailsPane();
                        binsTotal = this._binData(this._flatten(arrayTotals));
                    }
                    else {
                        binsTotal = bins;
                    }
                    this.dom.container.addClass(this.classes.show);
                    this.displayed = true;
                }
                else {
                    this.displayed = true;
                }
                // If the variance is accceptable then display the search pane
                this._displayPane();
                errMode = $.fn.dataTable.ext.errMode;
                $.fn.dataTable.ext.errMode = 'none';
                this.s.dtPane = $(this.dom.dtP).DataTable($.extend(true, {
                    columnDefs: [
                        {
                            data: 'display',
                            render: function (data, type, row) {
                                if (type === 'sort') {
                                    return row.sort;
                                }
                                else if (type === 'type') {
                                    return row.type;
                                }
                                return !_this.c.dataLength ?
                                    data : data.length > _this.c.dataLength ?
                                    data.substr(0, _this.c.dataLength) + '...' :
                                    data;
                            },
                            targets: 0,
                            // Accessing the private datatables property to set type based on the original table.
                            // This is null if not defined by the user, meaning that automatic type detection would take place
                            type: table.settings()[0].aoColumns[this.s.index] !== undefined ?
                                table.settings()[0].aoColumns[this.s.index]._sManualType :
                                null
                        },
                        {
                            className: 'dtsp-countColumn ' + this.classes.badgePill,
                            data: 'count',
                            render: function (data, type, row) {
                                var message;
                                _this.s.filteringActive
                                    ? message = filteredMessage.replace(/{total}/, row.total)
                                    : message = countMessage.replace(/{total}/, row.total);
                                message = message.replace(/{shown}/, row.shown);
                                while (message.indexOf('{total}') !== -1) {
                                    message = message.replace(/{total}/, row.total);
                                }
                                while (message.indexOf('{shown}') !== -1) {
                                    message = message.replace(/{shown}/, row.shown);
                                }
                                return '<div class="' + _this.classes.pill + '">' + message + '</div>';
                            },
                            targets: 1
                        }
                    ],
                    info: false,
                    paging: false,
                    scrollY: '200px',
                    select: true,
                    stateSave: table.settings()[0].oFeatures.bStateSave ? true : false
                }, this.c.dtOpts, colOpts !== undefined ? colOpts.dtOpts : {}, this.customPaneSettings !== undefined && this.customPaneSettings.dtOpts !== undefined
                    ? this.customPaneSettings.dtOpts : {}, (this.customPaneSettings !== undefined &&
                    this.customPaneSettings.searchPanes !== undefined &&
                    this.customPaneSettings.searchPanes.dtOpts !== undefined)
                    ? this.customPaneSettings.searchPanes.dtOpts : {}));
                $(this.dom.dtP).addClass(this.classes.table);
                // This is hacky but necessary for when datatables is generating the column titles automatically
                $(this.dom.searchBox).attr('placeholder', colOpts.header !== undefined
                    ? colOpts.header
                    : this.colExists
                        ? table.settings()[0].aoColumns[this.s.index].sTitle
                        : this.customPaneSettings.header);
                // As the pane table is not in the document yet we must initialise select ourselves
                $.fn.dataTable.select.init(this.s.dtPane);
                $.fn.dataTable.ext.errMode = errMode;
                // If it is not a custom pane
                if (this.colExists) {
                    search = column.search();
                    search = search ? search.substr(1, search.length - 2).split('|') : [];
                    dataFilter = [];
                    // Make sure that the values stored are unique
                    this._findUnique(dataFilter, arrayFilter);
                    count_1 = 0;
                    arrayFilter.forEach(function (element) {
                        if (element.filter === '') {
                            count_1++;
                        }
                    });
                    // Add all of the search options to the pane
                    for (i = 0, ien = dataFilter.length; i < ien; i++) {
                        if (dataFilter[i]) {
                            if (bins[dataFilter[i].filter] !== undefined || !this.c.cascadePanes) {
                                row = this._addRow(dataFilter[i].display, dataFilter[i].filter, bins[dataFilter[i].filter], bins[dataFilter[i].filter], dataFilter[i].sort, dataFilter[i].type);
                                if (colOpts.preSelect !== undefined && colOpts.preSelect.indexOf(dataFilter[i].filter) !== -1) {
                                    row.select();
                                }
                            }
                        }
                        else {
                            this._addRow(this.c.emptyMessage, count_1, count_1, this.c.emptyMessage, this.c.emptyMessage, this.c.emptyMessage);
                        }
                    }
                }
                // If there are custom options set or it is a custom pane then get them
                if (colOpts.options !== undefined ||
                    (this.customPaneSettings !== undefined && this.customPaneSettings.searchPanes.options !== undefined)) {
                    this._getComparisonRows();
                }
                DataTable.select.init(this.s.dtPane);
                // Display the pane
                this.s.dtPane.draw();
                // Hide the count column if that is desired
                if (colOpts.hideCount || this.c.hideCount) {
                    this.s.dtPane.column(1).visible(false);
                }
                // When an item is selected on the pane, add these to the array which holds selected items.
                // Custom search will perform.
                this.s.dtPane.on('select.dt', function () {
                    clearTimeout(t0);
                    $(_this.dom.clear).removeClass(_this.classes.dull);
                    if (!_this.s.updating) {
                        _this._makeSelection(true);
                    }
                });
                loadedFilter = table.state.loaded();
                // Reload the selection, searchbox entry and ordering from the previous state
                if (loadedFilter) {
                    this._reloadSelect(loadedFilter);
                    $(this.dom.searchBox).val(loadedFilter.search.search);
                    this.s.dtPane.column(0).order(loadedFilter.order[0][0]);
                    this.s.dtPane.column(1).order(loadedFilter.order[0][1]);
                }
                this.s.dtPane.on('user-select.dt', function (e, _dt, type, cell, originalEvent) {
                    originalEvent.stopPropagation();
                });
                // When the button to order by the name of the options is clicked then
                //  change the ordering to whatever it isn't currently
                this.dom.nameButton[0].addEventListener('click', function () {
                    var currentOrder = _this.s.dtPane.order()[0][1];
                    _this.s.dtPane.order([0, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
                });
                // When the button to order by the number of entries in the column is clicked then
                //  change the ordering to whatever it isn't currently
                this.dom.countButton[0].addEventListener('click', function () {
                    var currentOrder = _this.s.dtPane.order()[0][1];
                    _this.s.dtPane.order([1, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
                });
                // When the clear button is clicked reset the pane
                this.dom.clear[0].addEventListener('click', function () {
                    var searches = _this.dom.container.find('.' + _this.classes.search);
                    for (var _i = 0, searches_2 = searches; _i < searches_2.length; _i++) {
                        var search = searches_2[_i];
                        // set the value of the search box to be an empty string and then search on that, effectively reseting
                        $(search).val('');
                        $(search).trigger('input');
                    }
                    _this._clearPane();
                });
                // When the search button is clicked then draw focus to the search box
                this.dom.searchButton[0].addEventListener('click', function () {
                    $(_this.dom.searchBox).focus();
                });
                // When a character is inputted into the searchbox search the pane for matching values.
                // Doing it this way means that no button has to be clicked to trigger a search, it is done asynchronously
                $(this.dom.searchBox).on('input', function () {
                    _this.s.dtPane.search($(_this.dom.searchBox).val()).draw();
                });
                // When saving the state store all of the selected rows for preselection next time around
                this.s.dt.on('stateSaveParams.dt', function (e, settings, data) {
                    var paneColumns = [];
                    var searchTerm;
                    if (_this.s.dtPane !== undefined) {
                        paneColumns = _this.s.dtPane.rows({ selected: true }).data().pluck('filter').toArray();
                        searchTerm = _this.dom.searchBox[0].innerHTML;
                    }
                    if (data.searchPanes === undefined) {
                        data.searchPanes = [];
                    }
                    data.searchPanes.push({
                        id: _this.s.index,
                        searchTerm: searchTerm,
                        selected: paneColumns
                    });
                });
                // When an item is deselected on the pane, re add the currently selected items to the array
                // which holds selected items. Custom search will be performed.
                this.s.dtPane.on('deselect.dt', function () {
                    t0 = setTimeout(function () {
                        if (_this._getSelected(0)[0] === 0) {
                            $(_this.dom.clear).addClass(_this.classes.dull);
                        }
                        _this._makeSelection(false);
                    }, 50);
                });
                this.s.dtPane.state.save();
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Clear the selections in the pane
     */
    SearchPane.prototype._clearPane = function () {
        // Deselect all rows which are selected and update the table and filter count.
        this.s.dtPane.rows({ selected: true }).deselect();
        this._updateTable(false);
        this._updateFilterCount();
        return this;
    };
    /**
     * Get the bins for the custom options
     * @param val the data in a row
     * @param comparisonObj The data for the custom Option
     * @param bins The counts for each of the different options in the column
     * @param binsTotal The total counts for each of the different options in the column
     * @return {object} comparisonObj the same object as a parameter but with updated counts
     */
    SearchPane.prototype._comparisonStatUpdate = function (val, comparisonObj, bins, binsTotal) {
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
     */
    SearchPane.prototype._detailsPane = function () {
        var _this = this;
        var table = this.s.dt;
        var arrayTotals = [];
        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
            _this._populatePaneArray(rowIdx, arrayTotals);
        });
        return arrayTotals;
    };
    /**
     * Appends all of the HTML elements to their relevant parent Elements
     * @param searchBox HTML Element for the searchBox
     * @param searchButton HTML Element for the searchButton
     * @param clear HTML Element for the clearButton
     * @param nameButton HTML Element for the nameButton
     * @param countButton HTML element for the countButton
     * @param dtP HTML element for the DataTable
     */
    SearchPane.prototype._displayPane = function () {
        var container = this.dom.container;
        var colOpts = this.s.colOpts;
        var layVal = parseInt(this.layout.split('-')[1], 10);
        //  Empty everything to start again
        $(this.dom.topRow).empty();
        $(this.dom.dtP).empty();
        $(this.dom.topRow).addClass(this.classes.topRow);
        // If there are more than 3 columns defined then make there be a smaller gap between the panes
        if (layVal > 3) {
            $(this.dom.container).addClass(this.classes.smallGap);
        }
        $(this.dom.topRow).addClass(this.classes.subRowsContainer);
        $(this.dom.upper).appendTo(this.dom.topRow);
        $(this.dom.lower).appendTo(this.dom.topRow);
        $(this.dom.searchCont).appendTo(this.dom.upper);
        $(this.dom.buttonGroup).appendTo(this.dom.lower);
        // If no selections have been made in the pane then disable the clear button
        if ((this.c.dtOpts !== undefined &&
            this.c.dtOpts.searching === false) ||
            (colOpts.dtOpts !== undefined &&
                colOpts.dtOpts.searching === false)) {
            $(this.dom.searchBox).attr('disabled', 'disabled')
                .removeClass(this.classes.paneInputButton)
                .addClass(this.classes.disabledButton);
        }
        $(this.dom.searchBox).appendTo(this.dom.searchCont);
        // Create the contents of the searchCont div. Worth noting that this function will change when using semantic ui
        this._searchContSetup();
        // If the clear button is allowed to show then display it
        if (this.c.clear) {
            $(this.dom.clear).appendTo(this.dom.buttonGroup);
        }
        $(this.dom.nameButton).appendTo(this.dom.buttonGroup);
        // If the count column is hidden then don't display the ordering button for it
        if (!this.c.hideCount && !colOpts.hideCount) {
            $(this.dom.countButton).appendTo(this.dom.buttonGroup);
        }
        $(this.dom.topRow).prependTo(this.dom.container);
        $(container).append(this.dom.dtP);
    };
    /**
     * flattens?
     * @param arr the array to be flattened
     */
    SearchPane.prototype._flatten = function (arr) {
        return arr.reduce(function flatten(res, a) {
            Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
            return res;
        }, []);
    };
    /**
     * Find the unique filter values in an array
     * @param data empty array to populate with data which has not yet been found
     * @param arrayFilter the array of all of the display and filter values for the table
     */
    SearchPane.prototype._findUnique = function (data, arrayFilter) {
        var prev = [];
        for (var _i = 0, arrayFilter_1 = arrayFilter; _i < arrayFilter_1.length; _i++) {
            var filterEl = arrayFilter_1[_i];
            // If the data has not already been processed then add it to the unique array and the previously processed array.
            if (prev.indexOf(filterEl.filter) === -1) {
                data.push({
                    display: filterEl.display,
                    filter: filterEl.filter,
                    sort: filterEl.sort,
                    type: filterEl.type
                });
                prev.push(filterEl.filter);
            }
        }
    };
    /**
     * Gets the options for the row for the customPanes
     * @returns {object} The options for the row extended to include the options from the user.
     */
    SearchPane.prototype._getBonusOptions = function () {
        var defaults = {
            combiner: 'or',
            grouping: undefined,
            orthogonal: {
                comparison: undefined,
                display: 'display',
                hideCount: false,
                search: 'filter',
                show: undefined,
                sort: 'sort',
                threshold: undefined,
                type: 'type'
            },
            preSelect: undefined
        };
        return $.extend(true, {}, defaults, this.c !== undefined ? this.c : {});
    };
    /**
     * Adds the custom options to the pane
     * @param bins The counts of the different values which are currently visible in the column of the DataTable
     * @param binsTotal The counts of the different values which are in the original column of the DataTable
     * @returns {Array} Returns the array of rows which have been added to the pane
     */
    SearchPane.prototype._getComparisonRows = function () {
        var colOpts = this.s.colOpts;
        // Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
        var options = colOpts.options !== undefined
            ? colOpts.options
            : this.customPaneSettings.searchPanes !== undefined && this.customPaneSettings.searchPanes.options !== undefined
                ? this.customPaneSettings.searchPanes.options
                : undefined;
        if (options === undefined) {
            return;
        }
        var tableVals = this.s.dt.rows({ search: 'applied' }).data().toArray();
        var appRows = this.s.dt.rows({ search: 'applied' });
        var tableValsTotal = this.s.dt.rows().data().toArray();
        var allRows = this.s.dt.rows();
        // Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
        this.s.dtPane.clear();
        var rows = [];
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var comp = options_1[_i];
            // Initialise the object which is to be placed in the row
            var insert = comp.label !== '' ? comp.label : this.c.emptyMessage;
            var comparisonObj = {
                display: insert,
                filter: typeof comp.value === 'function' ? comp.value : [],
                shown: 0,
                sort: insert,
                total: 0,
                type: insert
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
            // If cascadePanes is not active or if it is and the comparisonObj should be shown then add it to the pane
            if (!this.c.cascadePanes || (this.c.cascadePanes && comparisonObj.shown !== 0)) {
                rows.push(this._addRow(comparisonObj.display, comparisonObj.filter, comparisonObj.shown, comparisonObj.total, comparisonObj.sort, comparisonObj.type));
            }
        }
        return rows;
    };
    /**
     * Gets the options for the row for the customPanes
     * @returns {object} The options for the row extended to include the options from the user.
     */
    SearchPane.prototype._getOptions = function () {
        var table = this.s.dt;
        var defaults = {
            combiner: 'or',
            grouping: undefined,
            orthogonal: {
                comparison: undefined,
                display: 'display',
                hideCount: false,
                search: 'filter',
                show: undefined,
                sort: 'sort',
                threshold: undefined,
                type: 'type'
            },
            preSelect: undefined
        };
        return $.extend(true, {}, defaults, table.settings()[0].aoColumns[this.s.index].searchPanes);
    };
    /**
     * Adds to an array the number of selections which have been made in the certain pane.
     * @param filterCount a running total of the number of filters in place
     * @returns {integer} filterCount
     */
    SearchPane.prototype._getSelected = function (filterCount) {
        var selectArray = [];
        // If the pane doesn't exist there are no filters in place on it
        if (this.s.dtPane !== undefined) {
            var selected = this.s.dtPane.rows({ selected: true }).data().toArray().length;
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
        return selectArray;
    };
    /**
     * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
     * @param select Denotes whether a selection has been made or not
     */
    SearchPane.prototype._makeSelection = function (select) {
        this._updateTable(select);
        this._updateFilterCount();
        this.s.updating = true;
        this.s.dt.draw();
        this.s.updating = false;
    };
    /**
     * Fill the array with the values that are currently being displayed in the table
     * @returns {array} arrayFilter The array containing all of the elements currently being shown in the table
     */
    SearchPane.prototype._populatePane = function () {
        var _this = this;
        var table = this.s.dt;
        var arrayFilter = [];
        if (this.c.cascadePanes || this.c.viewTotal) {
            table.rows({ search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(rowIdx, arrayFilter);
            });
        }
        else {
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                _this._populatePaneArray(rowIdx, arrayFilter);
            });
        }
        return arrayFilter;
    };
    /**
     * populates an array with all of the data for the table
     * @param rowIdx The current row index to be compared
     */
    SearchPane.prototype._populatePaneArray = function (rowIdx, arrayFilter) {
        var colOpts = this.s.colOpts;
        var table = this.s.dt;
        var classes = this.classes;
        var idx = this.s.index;
        var cell = table.cell(rowIdx, idx);
        var filter;
        var display;
        var sort;
        var type;
        // Retrieve the rendered data from the cell
        if (typeof colOpts.orthogonal === 'string') {
            var rendered = cell.render(colOpts.orthogonal);
            filter = rendered;
            display = rendered;
            sort = rendered;
            type = rendered;
        }
        else {
            filter = cell.render(colOpts.orthogonal.search);
            display = cell.render(colOpts.orthogonal.display);
            sort = cell.render(colOpts.orthogonal.sort);
            type = cell.render(colOpts.orthogonal.type);
        }
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
                    arrayFilter.push({
                        display: display[i],
                        filter: filter[i],
                        sort: sort,
                        type: type
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
                filter: filter,
                sort: sort,
                type: type
            });
        }
    };
    /**
     * Reloads all of the previous selects into the panes
     * @param loadedFilter The loaded filters from a previous state
     */
    SearchPane.prototype._reloadSelect = function (loadedFilter) {
        // If the state was not saved don't selected any
        if (loadedFilter === undefined) {
            return;
        }
        var idx;
        // For each pane, check that the loadedFilter list exists and is not null,
        // find the id of each search item and set it to be selected.
        for (var i = 0; i < loadedFilter.searchPanes.length; i++) {
            if (loadedFilter.searchPanes[i].id === this.s.index) {
                idx = i;
                break;
            }
        }
        if (idx !== undefined) {
            var table = this.s.dtPane;
            var rows = table.rows({ order: 'index' }).data().pluck('filter').toArray();
            this.dom.searchBox.innerHTML = loadedFilter.searchPanes[idx].searchTerm;
            for (var _i = 0, _a = loadedFilter.searchPanes[idx].selected; _i < _a.length; _i++) {
                var filter = _a[_i];
                var id = rows.indexOf(filter);
                if (id > -1) {
                    table.row(id).select();
                }
            }
        }
    };
    /**
     * This method decides whether a row should contribute to the pane or not
     * @param filter the value that the row is to be filtered on
     * @param dataIndex the row index
     */
    SearchPane.prototype._Search = function (filter, dataIndex) {
        var colOpts = this.s.colOpts;
        var table = this.s.dt;
        var allow = true;
        // For each item selected in the pane, check if it is available in the cell
        for (var _i = 0, _a = this.selections; _i < _a.length; _i++) {
            var colSelect = _a[_i];
            // if the filter is an array then is the column present in it
            if (Array.isArray(filter)) {
                if (filter.indexOf(colSelect.filter) !== -1) {
                    return true;
                }
            }
            // if the filter is a function then does it meet the criteria of that function or not
            else if (typeof colSelect.filter === 'function') {
                if (colSelect.filter.call(table, table.row(dataIndex).data(), dataIndex)) {
                    if (!this.s.redraw) {
                        this.repopulatePane();
                    }
                    if (colOpts.combiner === 'or') {
                        return true;
                    }
                }
                else {
                    allow = false;
                }
            }
            // otherwise if the two filter values are equal then return true
            else if (filter === colSelect.filter) {
                return true;
            }
        }
        // If the combiner is an and then we need to check against all possible selections
        //  so return allow here if it has passed
        if (colOpts.combiner === 'and') {
            return allow;
        }
        // Otherwise it hasn't matched with anything by this point so it must be false
        else {
            return false;
        }
    };
    /**
     * Creates the contents of the searchCont div
     *
     * NOTE This is overridden when semantic ui styling in order to integrate the search button into the text box.
     */
    SearchPane.prototype._searchContSetup = function () {
        $(this.dom.searchButton).appendTo(this.dom.searchLabelCont);
        if (!((this.c.dtOpts !== undefined &&
            this.c.dtOpts.searching === false) ||
            (this.s.colOpts.dtOpts !== undefined &&
                this.s.colOpts.dtOpts.searching === false))) {
            $(this.dom.searchLabelCont).appendTo(this.dom.searchCont);
        }
    };
    /**
     * Adds outline to the pane when a selection has been made
     */
    SearchPane.prototype._searchExtras = function () {
        var updating = this.s.updating;
        this.s.updating = true;
        var filters = this.s.dtPane.rows({ selected: true }).data().pluck('filter').toArray();
        var nullIndex = filters.indexOf(this.c.emptyMessage);
        var container = $(this.s.dtPane.table().container());
        // If null index is found then search for empty cells as a filter.
        if (nullIndex > -1) {
            filters[nullIndex] = '';
        }
        // If a filter has been applied then outline the respective pane, remove it when it no longer is.
        if (filters.length > 0) {
            container.addClass(this.classes.selected);
        }
        else if (filters.length === 0) {
            container.removeClass(this.classes.selected);
        }
        this.s.updating = updating;
    };
    /**
     * Finds the ratio of the number of different options in the table to the number of rows
     * @param bins the number of different options in the table
     * @param rowCount the total number of rows in the table
     * @returns {number} returns the ratio
     */
    SearchPane.prototype._uniqueRatio = function (bins, rowCount) {
        if (rowCount > 0) {
            return bins / rowCount;
        }
        else {
            return 1;
        }
    };
    /**
     * updates the options within the pane
     * @param filterIdx the index of the postition of a sole selected option
     * @param draw a flag to define whether this has been called due to a draw event or not
     */
    SearchPane.prototype._updateCommon = function (filterIdx, draw) {
        if (draw === void 0) { draw = false; }
        // Update the panes if doing a deselect. if doing a select then
        // update all of the panes except for the one causing the change
        if (this.s.dtPane !== undefined && (!this.s.filteringActive || draw === true)) {
            var colOpts = this.s.colOpts;
            var selected = this.s.dtPane.rows({ selected: true }).data().toArray();
            var scrollTop = $(this.s.dtPane.table().node()).parent()[0].scrollTop;
            var arrayFilter = [];
            var arrayTotals = [];
            var data = [];
            var bins = {};
            var binsTotal = {};
            // Clear the pane in preparation for adding the updated search options
            this.s.dtPane.clear();
            // If it is not a custom pane
            if (this.colExists) {
                arrayFilter = this._populatePane();
                bins = this._binData(this._flatten(arrayFilter));
                this._findUnique(data, arrayFilter);
                // If the viewTotal option is selected then find the totals for the table
                if (this.c.viewTotal) {
                    data = [];
                    arrayTotals = this._detailsPane();
                    binsTotal = this._binData(this._flatten(arrayTotals));
                    this._findUnique(data, arrayTotals);
                }
                else {
                    binsTotal = bins;
                }
                // If a filter has been removed so that only one remains then the remaining filter should have
                // the non filtered formatting, therefore set filteringActive to be false.
                if (filterIdx !== undefined && filterIdx === this.s.index) {
                    this.s.filteringActive = false;
                }
                var _loop_1 = function (dataP) {
                    if (dataP) {
                        var row = void 0;
                        // If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
                        // Do this also if the viewTotal option has been selected and cascadePanes has not
                        if ((bins[dataP.filter] !== undefined && this_1.c.cascadePanes) || !this_1.c.cascadePanes) {
                            row = this_1._addRow(dataP.display, dataP.filter, !this_1.c.viewTotal
                                ? bins[dataP.filter]
                                : bins[dataP.filter] !== undefined
                                    ? bins[dataP.filter]
                                    : '0', this_1.c.viewTotal
                                ? String(binsTotal[dataP.filter])
                                : bins[dataP.filter], dataP.sort, dataP.type);
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
                colOpts.options !== undefined ||
                (this.customPaneSettings !== undefined && this.customPaneSettings.searchPanes.options !== undefined)) {
                var rows = this._getComparisonRows();
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
            if (filterIdx !== undefined && filterIdx === this.s.index) {
                this.s.filteringActive = true;
            }
            // Add search options which were previously selected but whos results are no
            // longer present in the resulting data set.
            for (var _b = 0, selected_1 = selected; _b < selected_1.length; _b++) {
                var selectedEl = selected_1[_b];
                if ((draw && bins[selectedEl.filter] !== undefined) || !draw) {
                    var row = this._addRow(selectedEl.display, selectedEl.filter, 0, 0, selectedEl.filter, selectedEl.filter);
                    row.select();
                }
                else {
                    var id = void 0;
                    for (var _c = 0, _d = this.s.columns[this.s.index]; _c < _d.length; _c++) {
                        var selection = _d[_c];
                        if (selection.filter === selectedEl.filter) {
                            id = this.s.columns[this.s.index].indexOf(selection);
                            break;
                        }
                    }
                    if (id !== undefined) {
                        this.s.columns[this.s.index].splice(id, 1);
                    }
                }
            }
            if (this.s.dtPane.rows().data().toArray().length === 0) {
                arrayTotals = this._detailsPane();
                binsTotal = this._binData(this._flatten(arrayTotals));
                this._findUnique(data, arrayTotals);
                for (var _e = 0, data_2 = data; _e < data_2.length; _e++) {
                    var element = data_2[_e];
                    this._addRow(element.filter, element.filter, binsTotal[element.filter], binsTotal[element.filter], element.sort, element.type);
                }
            }
            this.s.dtPane.draw();
            this.s.dtPane.table().node().parentNode.scrollTop = scrollTop;
        }
    };
    /**
     * Updates the panes if one of the options to do so has been set to true
     * @param select whether this has been triggered by a select event or not
     */
    SearchPane.prototype._updateTable = function (select) {
        var selectedRows = this.s.dtPane.rows({ selected: true }).data().toArray();
        this.selections = selectedRows;
        this._searchExtras();
        // If either of the options that effect how the panes are displayed are selected then update the Panes
        if (this.c.cascadePanes || this.c.viewTotal) {
            this._updatePane(select, true);
        }
    };
    /**
     * Updates the number of filters that have been applied in the title
     */
    SearchPane.prototype._updateFilterCount = function () {
        return this.s.dtPane !== undefined ?
            this.s.dtPane.rows({ selected: true }).data().toArray().length :
            0;
    };
    /**
     * Updates the values of all of the panes
     * @param select whether a select has been made in a pane or not
     * @param draw whether this has been triggered by a draw event or not
     */
    SearchPane.prototype._updatePane = function (select, filteringActive, draw) {
        if (draw === void 0) { draw = false; }
        this.s.updating = true;
        this.s.filteringActive = false;
        var selectArray = [];
        var filterCount = 0;
        var filterIdx;
        // If the viewTotal option is active then it must be determined whether there is a filter in place already
        if (this.c.viewTotal) {
            // There is if select is true
            if (select || filteringActive) {
                this.s.filteringActive = true;
            }
            // If there is only one in place then find the index of the corresponding pane
            if (filterCount === 1) {
                filterIdx = selectArray.indexOf(1);
            }
        }
        this._updateCommon(filterIdx, draw);
        this.s.updating = false;
    };
    SearchPane.version = '0.0.2';
    SearchPane.classes = {
        arrayCols: [],
        badgePill: '',
        buttonGroup: 'dtsp-buttonGroup',
        buttonSub: 'dtsp-buttonSub',
        clear: 'dtsp-clear',
        clearAll: 'dtsp-clearAll',
        container: 'dtsp-searchPane',
        disabledButton: 'dtsp-disabledButton',
        dull: 'dtsp-dull',
        hidden: 'dtsp-hidden',
        hide: 'dtsp-hide',
        item: {
            count: 'dtsp-count',
            label: 'dtsp-label',
            selected: 'dtsp-selected'
        },
        layout: 'dtsp-',
        narrow: 'dtsp-narrow',
        pane: {
            active: 'dtsp-filtering',
            container: 'dtsp-pane',
            scroller: 'dtsp-scroller',
            title: 'dtsp-title'
        },
        paneButton: 'dtsp-paneButton',
        paneInputButton: 'dtsp-paneInputButton',
        pill: 'dtsp-pill',
        search: 'dtsp-search',
        searchCont: 'dtsp-searchCont',
        searchIcon: 'dtsp-searchIcon',
        searchLabelCont: 'dtsp-searchButtonCont',
        selected: 'dtsp-selected',
        smallGap: 'dtsp-smallGap',
        subRows: 'dtsp-subRows',
        subRowsContainer: 'dtsp-subRowsContainer',
        title: 'dtsp-title',
        topRow: 'dtsp-topRow'
    };
    // Define SearchPanes default options
    SearchPane.defaults = {
        cascadePanes: false,
        clear: true,
        container: function (dt) {
            return dt.table().container();
        },
        dataLength: 30,
        emptyMessage: '<i>No Data</i>',
        threshold: 0.6,
        viewTotal: false
    };
    return SearchPane;
}());
export default SearchPane;
