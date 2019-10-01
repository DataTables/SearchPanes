let DataTable = $.fn.dataTable;
export default class SearchPane {

	private static version = '0.0.2';

	private static classes = {
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
			title: 'dtsp-title',
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
		topRow: 'dtsp-topRow',
	};

	// Define SearchPanes default options
	private static defaults = {
		cascadePanes: false,
		clear: true,
		container(dt) {
			return dt.table().container();
		},
		dataLength: 30,
		emptyMessage: '<i>No Data</i>',
		threshold: 0.6,
		viewTotal: false,
	};

	public classes;
	public dom;
	public c;
	public s;
	public colExists;
	public selections;
	public customPaneSettings;
	public layout;
	public displayed;

	/**
	 * Creates the panes, sets up the search function
	 * @param paneSettings The settings for the searchPanes
	 * @param opts The options for the default features
	 * @param idx the index of the column for this pane
	 * @returns {object} the pane that has been created, including the table and the index of the pane
	 */
	constructor(paneSettings, opts, idx, layout, panes = {}) {
		// Check that the required version of DataTables is included
		if (! DataTable || ! DataTable.versionCheck || ! DataTable.versionCheck('1.10.0')) {
			throw new Error('SearchPane requires DataTables 1.10 or newer');
		}

		// Check that Select is included
		if (! (DataTable as any).select) {
			throw new Error('SearchPane requires Select');
		}

		let table = new DataTable.Api(paneSettings);

		if (table.ajax.url() !== undefined && table.ajax.url() !== null) {
			table.one('init', () => {
				this.rebuildPane();
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
			updating: false,
		};

		let rowLength = table.columns().eq(0).toArray().length;
		this.colExists = this.s.index < rowLength;

		// Add extra elements to DOM object including clear and hide buttons
		this.layout = layout;
		let layVal = parseInt(layout.split('-')[1], 10);

		this.dom = {
			buttonGroup: $('<div/>').addClass(this.classes.buttonGroup),
			clear: $('<button type="button">&#215;</button>')
					.addClass(this.classes.dull)
					.addClass(this.classes.paneButton)
					.addClass(this.classes.exit),
			container: $('<div/>').addClass(this.classes.container).addClass(this.classes.layout +
					(layVal < 7 ? layout : layout.split('-')[0] + '-6')),
			countButton:  $('<button type="button">#↕</button>').addClass(this.classes.paneButton),
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
			upper: $('<div/>').addClass(this.classes.subRows).addClass(this.classes.narrowSearch),
		};

		this.displayed = false;

		table = this.s.dt;
		this.selections = this.s.columns;
		this.s.colOpts = this.colExists ? this._getOptions() : this._getBonusOptions();
		let colOpts =  this.s.colOpts;
		let clear = $('<button type="button">X</button>').addClass(this.classes.paneButton);
		clear[0].innerHTML = table.i18n('searchPanes.clearPane', 'X');
		this.dom.container.addClass(colOpts.className);

		// Custom search function for table
		$.fn.dataTable.ext.search.push(
			(settings, searchData, dataIndex, origData) => {
				if (settings.nTable !== table.table(0).node()) {
					return true;
				}
				// If no data has been selected then show all
				if (this.selections.length === 0) {
					return true;
				}

				let filter: string | string[] = '';

				if (this.colExists) {
					// Get the current filtered data
					filter = searchData[this.s.index];
					if (colOpts.orthogonal.filter !== 'filter') {
						let cell = table.cell(dataIndex, this.s.index);
						filter = typeof(colOpts.orthogonal) === 'string'
							? cell.render(colOpts.orthogonal)
							: cell.render(colOpts.orthogonal.search);
						if ((filter as any) instanceof $.fn.dataTable.Api) {
							filter = (filter as any).toArray();
						}
					}
				}

				return this._Search(filter, dataIndex);
			}
		);

		this._buildPane();

		// If the clear button for this pane is clicked clear the selections
		if (this.c.clear) {
			clear[0].addEventListener('click', () => {
				let searches = this.dom.container.getElementsByClassName(this.classes.search);
				for (let search of searches) {
					$(search).val('');
					$(search).trigger('input');
				}
				this._clearPane();
			});
		}

		// Sometimes the top row of the panes containing the search box and ordering buttons appears
		//  weird if the width of the panes is lower than expected, this fixes the design.
		// Equally this may occur when the table is resized.
		table.on('draw', () => {
			this._adjustTopRow();
		});

		$(window).on('resize.dtr', DataTable.util.throttle(() => {
			this._adjustTopRow();
		}));

		// When column-reorder is present and the columns are moved, it is necessary to
		//  reassign all of the panes indexes to the new index of the column.
		table.on('column-reorder', (e, settings, details) => {
			this.s.index = details.mapping.indexOf(this.s.index);
		});

		return this;
	}

	/**
	 * Adjusts the width of the columns
	 */
	public adjust(): void {
		this.s.dtPane.columns.adjust();
	}

	/**
	 * Rebuilds the panes from the start having deleted the old ones
	 */
	public async rebuildPane(): Promise<this> {
		// When rebuilding strip all of the HTML Elements out of the container and start from scratch
		if (this.s.dtPane !== undefined) {
			this.s.dtPane.clear().destroy();
		}
		this.dom.container.empty();
		this.dom.container.removeClass(this.classes.hidden);
		if (this.s.dt.settings()[0]._bInitComplete) {
			await this._buildPane();
		}
		else {
			this.s.dt.one('init', async () => {
				await this._buildPane();
			});
		}
		return this;
	}

	/**
	 * Repopulates the options of the pane
	 */
	public repopulatePane(): this {
		// Store the value of updating at the start of this call so that it can be restored later.
		let updating = this.s.updating;
		this.s.updating = true;
		let filterCount = 0;
		let filterIdx: number;

		// If the viewTotal option is active then it must be determined whether there is a filter in place already
		if (this.c.viewTotal) {

			// Check each pane to find how many filters are in place in each
			let selectArray = this._getSelected(filterCount);

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
	}

	/**
	 * Adds a row to the panes table
	 * @param display the value to be displayed to the user
	 * @param filter the value to be filtered on when searchpanes is implemented
	 * @param shown the number of rows in the table that are currently visible matching this criteria
	 * @param total the total number of rows in the table that match this criteria
	 * @param sort the value to be sorted in the pane table
	 * @param type the value of which the type is to be derived from
	 */
	private _addRow(display, filter, shown, total, sort, type): any {
		return this.s.dtPane.row.add({
			display: display !== '' ? display : this.c.emptyMessage,
			filter,
			shown,
			sort: sort !== '' ? sort : this.c.emptyMessage,
			total,
			type
		});
	}

	/**
	 * Adjusts the layout of the top row when the screen is resized
	 */
	private _adjustTopRow(): void {
		let subContainers = this.dom.container.find('.' + this.classes.subRowsContainer);
		let subRows = this.dom.container.find('.dtsp-subRows');
		let topRow = this.dom.container.find('.' + this.classes.topRow);

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
	}

	/**
	 * Caclulate the count for each different value in a column.
	 * @param data The data to be binned
	 * @return {object} out Object of different cell values as keys and counts as values
	 */
	private _binData(data): {} {
		let out = {};
		data = this._flatten(data);

		// For every entry in the column
		for (let i = 0, ien = data.length; i < ien; i++) {

			let d = data[i].filter;
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
	}

	/**
	 * Method to construct the actual pane.
	 */
	private async _buildPane(): Promise<boolean> {
		// Aliases
		this.selections = this.s.columns;
		let table = this.s.dt;
		let column = table.column(this.colExists ? this.s.index : 0);
		let colOpts =  this.s.colOpts;

		// Other Variables
		let countMessage = table.i18n('searchPanes.count', '{total}');
		let filteredMessage = table.i18n('searchPanes.countFiltered', '{shown} ({total})');
		let arrayFilter: Array<{[keys: string]: any}> = [];
		let arrayTotals: Array<{}> = [];
		let bins = {};
		let binsTotal = {};

		// If it is not a custom pane in place
		if (this.colExists) {
			// Perform checks that do not require populate pane to run
			if (colOpts.show === false
				|| (colOpts.show !== undefined && colOpts.show !== true)
			) {
					this.dom.container.addClass(this.classes.hidden);
					return false;
			}
			else if (colOpts.show === true) {
				this.displayed = true;
			}

			arrayFilter = this._populatePane();
			bins = this._binData(this._flatten(arrayFilter));

			let binLength = Object.keys(bins).length;
			let uniqueRatio = this._uniqueRatio(binLength, table.rows()[0].length);

			// Don't show the pane if there isn't enough variance in the data, or there is only 1 entry for that pane
			if (this.displayed === false && ((colOpts.show === undefined && (colOpts.threshold === undefined ?
					uniqueRatio > this.c.threshold :
					uniqueRatio > colOpts.threshold))
				|| (colOpts.show !== true  && binLength <= 1))
			) {
				this.dom.container.addClass(this.classes.hidden);
				return;
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

		// Declare the datatable for the pane
		let errMode = $.fn.dataTable.ext.errMode;
		$.fn.dataTable.ext.errMode = 'none';
		this.s.dtPane = $(this.dom.dtP).DataTable($.extend(
			true,
			{
				columnDefs: [
					{
						data: 'display',
						render: (data, type, row) => {
							if (type === 'sort') {
								return row.sort;
							}
							else if (type === 'type') {
								return row.type;
							}
							return !this.c.dataLength ?
								data : data.length > this.c.dataLength ?
								data.substr(0, this.c.dataLength) + '...' :
								data;
						},
						targets: 0,
						// Accessing the private datatables property to set type based on the original table.
						// This is null if not defined by the user, meaning that automatic type detection would take place
						type: table.settings()[0].aoColumns[this.s.index] !== undefined ?
							table.settings()[0].aoColumns[this.s.index]._sManualType :
							null,
					},
					{
						className: 'dtsp-countColumn ' + this.classes.badgePill,
						data: 'count',
						render: (data, type, row) => {
							let message;
							this.s.filteringActive
								? message = filteredMessage.replace(/{total}/, row.total)
								: message = countMessage.replace(/{total}/, row.total) ;
							message = message.replace(/{shown}/, row.shown);

							while (message.indexOf('{total}') !== -1) {
								message = message.replace(/{total}/, row.total);
							}

							while (message.indexOf('{shown}') !== -1) {
								message = message.replace(/{shown}/, row.shown);
							}

							return '<div class="' + this.classes.pill + '">' + message + '</div>';
						},
						targets: 1,
					}
				],
				info: false,
				paging: false,
				scrollY: '200px',
				select: true,
				stateSave: table.settings()[0].oFeatures.bStateSave ? true : false,
			},
			this.c.dtOpts, colOpts !== undefined ? colOpts.dtOpts : {},
			this.customPaneSettings !== undefined && this.customPaneSettings.dtOpts !== undefined
				? this.customPaneSettings.dtOpts : {},
			(
				this.customPaneSettings !== undefined &&
				this.customPaneSettings.searchPanes !== undefined &&
				this.customPaneSettings.searchPanes.dtOpts !== undefined
			)
				? this.customPaneSettings.searchPanes.dtOpts : {}
		));

		$(this.dom.dtP).addClass(this.classes.table);

		// This is hacky but necessary for when datatables is generating the column titles automatically
		$(this.dom.searchBox).attr(
			'placeholder',
			colOpts.header !== undefined
			? colOpts.header
			: this.colExists
				? table.settings()[0].aoColumns[this.s.index].sTitle
				: this.customPaneSettings.header
		);

		// As the pane table is not in the document yet we must initialise select ourselves
		($.fn.dataTable as any).select.init(this.s.dtPane);
		$.fn.dataTable.ext.errMode = errMode;

		// If it is not a custom pane
		if (this.colExists) {
			// On initialisation, do we need to set a filtering value from a
			// saved state or init option?
			let search: any = column.search();
			search = search ? search.substr(1, search.length - 2).split('|') : [];
			let dataFilter = [];

			// Make sure that the values stored are unique
			this._findUnique(dataFilter, arrayFilter);

			// Count the number of empty cells
			let count: number = 0;
			arrayFilter.forEach(element => {
				if (element.filter === '') {
					count++;
				}
			});

			// Add all of the search options to the pane
			for (let i = 0, ien = dataFilter.length; i < ien; i++) {
				if (dataFilter[i]) {
					if (bins[dataFilter[i].filter] !== undefined || !this.c.cascadePanes) {
						let row = this._addRow(
							dataFilter[i].display,
							dataFilter[i].filter,
							bins[dataFilter[i].filter],
							bins[dataFilter[i].filter],
							dataFilter[i].sort,
							dataFilter[i].type
						);

						if (colOpts.preSelect !== undefined && colOpts.preSelect.indexOf(dataFilter[i].filter) !== -1) {
							row.select();
						}
					}
				}
				else {
					this._addRow(this.c.emptyMessage, count, count, this.c.emptyMessage, this.c.emptyMessage, this.c.emptyMessage);
				}
			}
		}

		// If there are custom options set or it is a custom pane then get them
		if (colOpts.options !== undefined ||
			(this.customPaneSettings !== undefined && this.customPaneSettings.searchPanes.options !== undefined)) {
				this._getComparisonRows();
		}

		(DataTable as any).select.init(this.s.dtPane);

		// Display the pane
		this.s.dtPane.draw();

		// Hide the count column if that is desired
		if (colOpts.hideCount || this.c.hideCount) {
			this.s.dtPane.column(1).visible(false);
		}

		// When an item is selected on the pane, add these to the array which holds selected items.
		// Custom search will perform.
		this.s.dtPane.on('select.dt', () => {
			clearTimeout(t0);
			$(this.dom.clear).removeClass(this.classes.dull);
			if (!this.s.updating) {
				this._makeSelection(true);
			}
		});

		let loadedFilter = table.state.loaded();

		// Reload the selection, searchbox entry and ordering from the previous state
		if (loadedFilter) {
			this._reloadSelect(loadedFilter);
			$(this.dom.searchBox).val(loadedFilter.search.search);
			this.s.dtPane.column(0).order(loadedFilter.order[0][0]);
			this.s.dtPane.column(1).order(loadedFilter.order[0][1]);
		}

		this.s.dtPane.on('user-select.dt', (e, _dt, type, cell, originalEvent) => {
			originalEvent.stopPropagation();
		});

		// When the button to order by the name of the options is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.nameButton[0].addEventListener('click', () => {
			let currentOrder = this.s.dtPane.order()[0][1];
			this.s.dtPane.order([0, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
		});

		// When the button to order by the number of entries in the column is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.countButton[0].addEventListener('click', () => {
			let currentOrder = this.s.dtPane.order()[0][1];
			this.s.dtPane.order([1, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
		});

		// When the clear button is clicked reset the pane
		this.dom.clear[0].addEventListener('click', () => {
			let searches = this.dom.container.find('.' + this.classes.search);

			for (let search of searches) {
				// set the value of the search box to be an empty string and then search on that, effectively reseting
				$(search).val('');
				$(search).trigger('input');
			}

			this._clearPane();
		});

		// When the search button is clicked then draw focus to the search box
		this.dom.searchButton[0].addEventListener('click', () => {
			$(this.dom.searchBox).focus();
		});

		// When a character is inputted into the searchbox search the pane for matching values.
		// Doing it this way means that no button has to be clicked to trigger a search, it is done asynchronously
		$(this.dom.searchBox).on('input', () => {
			this.s.dtPane.search($(this.dom.searchBox).val()).draw();
		});

		// When saving the state store all of the selected rows for preselection next time around
		this.s.dt.on('stateSaveParams.dt', (e, settings, data) => {
			let paneColumns = [];
			let searchTerm;
			if (this.s.dtPane !== undefined) {
				paneColumns = this.s.dtPane.rows({selected: true}).data().pluck('filter').toArray();
				searchTerm = this.dom.searchBox[0].innerHTML;
			}
			if (data.searchPanes === undefined) {
				data.searchPanes = [];
			}
			data.searchPanes.push({
				id: this.s.index,
				searchTerm,
				selected: paneColumns,
			});
		});

		// Declare timeout Variable
		let t0;

		// When an item is deselected on the pane, re add the currently selected items to the array
		// which holds selected items. Custom search will be performed.
		this.s.dtPane.on('deselect.dt', () => {
			t0 = setTimeout(() => {
				if (this._getSelected(0)[0] === 0) {
					$(this.dom.clear).addClass(this.classes.dull);
				}
				this._makeSelection(false);
			}, 50);
		});

		this.s.dtPane.state.save();

		return true;
	}

	/**
	 * Clear the selections in the pane
	 */
	private _clearPane(): this {
		// Deselect all rows which are selected and update the table and filter count.
		this.s.dtPane.rows({selected: true}).deselect();
		this._updateTable(false);
		this._updateFilterCount();
		return this;
	}

	/**
	 * Get the bins for the custom options
	 * @param val the data in a row
	 * @param comparisonObj The data for the custom Option
	 * @param bins The counts for each of the different options in the column
	 * @param binsTotal The total counts for each of the different options in the column
	 * @return {object} comparisonObj the same object as a parameter but with updated counts
	 */
	private _comparisonStatUpdate(val, comparisonObj, bins, binsTotal) {
		// If the value of the filter is a function then it will throw an error if we try to push on to it
		if (typeof comparisonObj.filter !== 'function') {
			comparisonObj.filter.push(val.filter);
		}

		// Update the totals
		bins !== undefined ? comparisonObj.shown += bins : comparisonObj.shown += 0;
		binsTotal !== undefined ? comparisonObj.total += binsTotal : comparisonObj.total += 0;
		return comparisonObj;
	}

	/**
	 * Update the array which holds the display and filter values for the table
	 */
	private _detailsPane(): Array<{[keys: string]: any}> {
		let table = this.s.dt;
		let arrayTotals = [];
		table.rows().every((rowIdx, tableLoop, rowLoop) => {
			this._populatePaneArray(rowIdx, arrayTotals);
		});
		return arrayTotals;
	}

	/**
	 * Appends all of the HTML elements to their relevant parent Elements
	 * @param searchBox HTML Element for the searchBox
	 * @param searchButton HTML Element for the searchButton
	 * @param clear HTML Element for the clearButton
	 * @param nameButton HTML Element for the nameButton
	 * @param countButton HTML element for the countButton
	 * @param dtP HTML element for the DataTable
	 */
	private _displayPane() {
		let container = this.dom.container;
		let colOpts =  this.s.colOpts;
		let layVal = parseInt(this.layout.split('-')[1], 10);

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
		if (
			(this.c.dtOpts !== undefined &&
			this.c.dtOpts.searching === false) ||
			(colOpts.dtOpts !== undefined &&
			colOpts.dtOpts.searching === false)
		) {
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

	}

	/**
	 * flattens?
	 * @param arr the array to be flattened
	 */
	private _flatten(arr) {
		return arr.reduce(function flatten(res, a) {
			Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
			return res;
		}, []);
	}

	/**
	 * Find the unique filter values in an array
	 * @param data empty array to populate with data which has not yet been found
	 * @param arrayFilter the array of all of the display and filter values for the table
	 */
	private _findUnique(data, arrayFilter) {
		let prev = [];

		for (let filterEl of arrayFilter) {
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
	}

	/**
	 * Gets the options for the row for the customPanes
	 * @returns {object} The options for the row extended to include the options from the user.
	 */
	private _getBonusOptions(): {[keys: string]: any} {
		let defaults = {
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
			preSelect: undefined,
		};
		return $.extend(
			true,
			{},
			defaults,
			this.c !== undefined ? this.c : {}
		);
	}

	/**
	 * Adds the custom options to the pane
	 * @param bins The counts of the different values which are currently visible in the column of the DataTable
	 * @param binsTotal The counts of the different values which are in the original column of the DataTable
	 * @returns {Array} Returns the array of rows which have been added to the pane
	 */
	private _getComparisonRows() {
		let colOpts = this.s.colOpts;
		// Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
		let options = colOpts.options !== undefined
			? colOpts.options
			: this.customPaneSettings.searchPanes !== undefined && this.customPaneSettings.searchPanes.options !== undefined
				? this.customPaneSettings.searchPanes.options
				: undefined;

		if (options === undefined) {
			return;
		}

		let tableVals = this.s.dt.rows({search: 'applied'}).data().toArray();
		let appRows = this.s.dt.rows({search: 'applied'});
		let tableValsTotal = this.s.dt.rows().data().toArray();
		let allRows = this.s.dt.rows();
		// Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
		this.s.dtPane.clear();
		let rows = [];

		for (let comp of options) {
			// Initialise the object which is to be placed in the row
			let insert = comp.label !== '' ? comp.label : this.c.emptyMessage;
			let comparisonObj = {
				display: insert,
				filter: typeof comp.value === 'function' ? comp.value : [],
				shown: 0,
				sort: insert,
				total: 0,
				type: insert,
			};

			// If a custom function is in place
			if (typeof comp.value === 'function') {
				let count = 0;
				let total = 0;

				// Count the number of times the function evaluates to true for the data currently being displayed
				for (let tVal = 0; tVal < tableVals.length; tVal++) {
					if (comp.value.call(this.s.dt, tableVals[tVal], appRows[0][tVal])) {
						count++;
					}
				}

				// Count the number of times the function evaluates to true for the original data in the Table
				for (let i = 0; i < tableValsTotal.length; i++) {
					if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
						total++;
					}
				}

				// Update the comparisonObj
				comparisonObj = this._comparisonStatUpdate(comp, comparisonObj, count, total);
			}

			// If cascadePanes is not active or if it is and the comparisonObj should be shown then add it to the pane
			if (!this.c.cascadePanes || (this.c.cascadePanes && comparisonObj.shown !== 0)) {
				rows.push(this._addRow(
					comparisonObj.display,
					comparisonObj.filter,
					comparisonObj.shown,
					comparisonObj.total,
					comparisonObj.sort,
					comparisonObj.type
				));
			}
		}

		return rows;
	}

	/**
	 * Gets the options for the row for the customPanes
	 * @returns {object} The options for the row extended to include the options from the user.
	 */
	private _getOptions() {
		let table = this.s.dt;
		let defaults = {
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
			preSelect: undefined,
		};
		return $.extend(
			true,
			{},
			defaults,
			table.settings()[0].aoColumns[this.s.index].searchPanes
		);
	}

	/**
	 * Adds to an array the number of selections which have been made in the certain pane.
	 * @param filterCount a running total of the number of filters in place
	 * @returns {integer} filterCount
	 */
	private _getSelected(filterCount): number[] {
		let selectArray = [];
		// If the pane doesn't exist there are no filters in place on it
		if (this.s.dtPane !== undefined) {
			let selected = this.s.dtPane.rows({selected: true}).data().toArray().length;
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
	}

	/**
	 * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
	 * @param select Denotes whether a selection has been made or not
	 */
	private _makeSelection(select) {
		this._updateTable(select);
		this._updateFilterCount();
		this.s.updating = true;
		this.s.dt.draw();
		this.s.updating = false;
	}

	/**
	 * Fill the array with the values that are currently being displayed in the table
	 * @returns {array} arrayFilter The array containing all of the elements currently being shown in the table
	 */
	private _populatePane(): Array<{[keys: string]: any}> {
		let table = this.s.dt;
		let arrayFilter = [];

		if (this.c.cascadePanes || this.c.viewTotal) {
			table.rows({search: 'applied'}).every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(rowIdx, arrayFilter);
			});
		}
		else {
			table.rows().every((rowIdx, tableLoop, rowLoop) => {
				this._populatePaneArray(rowIdx, arrayFilter);
			});
		}

		return arrayFilter;
	}

	/**
	 * populates an array with all of the data for the table
	 * @param rowIdx The current row index to be compared
	 */
	private _populatePaneArray(rowIdx, arrayFilter): void {
		let colOpts = this.s.colOpts;
		let table = this.s.dt;
		let classes = this.classes;
		let idx = this.s.index;
		let cell = table.cell(rowIdx, idx);
		let filter;
		let display;
		let sort;
		let type;

		// Retrieve the rendered data from the cell
		if (typeof colOpts.orthogonal === 'string') {
			let rendered = cell.render(colOpts.orthogonal);
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
				for (let i = 0; i < filter.length; i++) {
					arrayFilter.push({

						display: display[i],
						filter: filter[i],
						sort,
						type
					});
				}
			}
			else {

				throw new Error('display and filter not the same length');
			}
		}
		else {
			arrayFilter.push({
				display,
				filter,
				sort,
				type
			});
		}
	}

	/**
	 * Reloads all of the previous selects into the panes
	 * @param loadedFilter The loaded filters from a previous state
	 */
	private _reloadSelect(loadedFilter): void {
		// If the state was not saved don't selected any
		if (loadedFilter === undefined) {
				return;
		}

		let idx: number;

		// For each pane, check that the loadedFilter list exists and is not null,
		// find the id of each search item and set it to be selected.
		for (let i = 0; i < loadedFilter.searchPanes.length; i++) {
			if (loadedFilter.searchPanes[i].id === this.s.index) {
				idx = i;
				break;
			}
		}

		if (idx !== undefined) {
			let table = this.s.dtPane;
			let rows = table.rows({order: 'index'}).data().pluck('filter').toArray();
			this.dom.searchBox.innerHTML = loadedFilter.searchPanes[idx].searchTerm;

			for (let filter of loadedFilter.searchPanes[idx].selected) {
				let id = rows.indexOf(filter);

				if (id > -1) {
					table.row(id).select();
				}
			}

		}
	}

	/**
	 * This method decides whether a row should contribute to the pane or not
	 * @param filter the value that the row is to be filtered on
	 * @param dataIndex the row index
	 */
	private _Search(filter, dataIndex): boolean {
		let colOpts = this.s.colOpts;
		let table = this.s.dt;
		let allow = true;

		// For each item selected in the pane, check if it is available in the cell
		for (let colSelect of this.selections) {
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
	}

	/**
	 * Creates the contents of the searchCont div
	 *
	 * NOTE This is overridden when semantic ui styling in order to integrate the search button into the text box.
	 */
	private _searchContSetup(): void {
		$(this.dom.searchButton).appendTo(this.dom.searchLabelCont);

		if (
			!((this.c.dtOpts !== undefined &&
			this.c.dtOpts.searching === false) ||
			(this.s.colOpts.dtOpts !== undefined &&
			this.s.colOpts.dtOpts.searching === false))
		) {
			$(this.dom.searchLabelCont).appendTo(this.dom.searchCont);
		}
	}

	/**
	 * Adds outline to the pane when a selection has been made
	 */
	private _searchExtras() {
		let updating = this.s.updating;
		this.s.updating = true;
		let filters = this.s.dtPane.rows({selected: true}).data().pluck('filter').toArray();
		let nullIndex = filters.indexOf(this.c.emptyMessage);
		let container = $(this.s.dtPane.table().container());

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
	}

	/**
	 * Finds the ratio of the number of different options in the table to the number of rows
	 * @param bins the number of different options in the table
	 * @param rowCount the total number of rows in the table
	 * @returns {number} returns the ratio
	 */
	private _uniqueRatio(bins, rowCount) {
		if (rowCount > 0) {
			return bins / rowCount;
		}
		else {
			return 1;
		}
	}

	/**
	 * updates the options within the pane
	 * @param filterIdx the index of the postition of a sole selected option
	 * @param draw a flag to define whether this has been called due to a draw event or not
	 */
	private _updateCommon(filterIdx, draw = false) {
		// Update the panes if doing a deselect. if doing a select then
		// update all of the panes except for the one causing the change
		if (this.s.dtPane !== undefined && (!this.s.filteringActive || draw === true)) {
			let colOpts = this.s.colOpts;
			let selected = this.s.dtPane.rows({selected: true}).data().toArray();
			let scrollTop = $(this.s.dtPane.table().node()).parent()[0].scrollTop;
			let arrayFilter = [];
			let arrayTotals = [];
			let data = [];
			let bins = {};
			let binsTotal = {};

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
				for (let dataP of data) {
					if (dataP) {
						let row;
						// If both view Total and cascadePanes have been selected and the count of the row is not 0 then add it to pane
						// Do this also if the viewTotal option has been selected and cascadePanes has not
						if ((bins[dataP.filter] !== undefined && this.c.cascadePanes) || !this.c.cascadePanes) {
							row = this._addRow(
								dataP.display,
								dataP.filter,
								!this.c.viewTotal
								? bins[dataP.filter]
								: bins[dataP.filter] !== undefined
									? bins[dataP.filter]
									: '0',
								this.c.viewTotal
								? String(binsTotal[dataP.filter])
								: bins[dataP.filter],
								dataP.sort,
								dataP.type
							);
						}

						// Find out if the filter was selected in the previous search, if so select it and remove from array.
						let selectIndex = selected.findIndex(function(element) {
							return element.filter === dataP.filter;
						});
						if (selectIndex !== -1) {
							row.select();
							selected.splice(selectIndex, 1);
						}
					}
				}
			}
			if ((colOpts.searchPanes !== undefined && colOpts.searchPanes.options !== undefined) ||
				colOpts.options !== undefined ||
				(this.customPaneSettings !== undefined && this.customPaneSettings.searchPanes.options !== undefined)) {

				let rows = this._getComparisonRows();
				for (let row of rows) {
					let selectIndex = selected.findIndex(function(element) {
						if (element.display === row.data().display) {
							return true;
						}
					});
					if (selectIndex !== -1) {
						row.select();
						selected.splice(selectIndex, 1);
					}
				}
			}
			// Set filtering Active to be again if it was previously set to false,
			// so that succeeding panes have the correct formatting.
			if (filterIdx !== undefined && filterIdx === this.s.index) {
				this.s.filteringActive = true;
			}

			// Add search options which were previously selected but whos results are no
			// longer present in the resulting data set.
			for (let selectedEl of selected) {
				if ((draw && bins[selectedEl.filter] !== undefined) || !draw) {
					let row = this._addRow(selectedEl.display, selectedEl.filter, 0, 0, selectedEl.filter, selectedEl.filter);
					row.select();
				}
				else {
					let id;
					for (let selection of this.s.columns[this.s.index]) {
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

				for (let element of data) {
					this._addRow(
						element.filter,
						element.filter,
						binsTotal[element.filter],
						binsTotal[element.filter],
						element.sort,
						element.type
					);
				}
			}
			this.s.dtPane.draw();
			this.s.dtPane.table().node().parentNode.scrollTop = scrollTop;
		}
	}

	/**
	 * Updates the panes if one of the options to do so has been set to true
	 * @param select whether this has been triggered by a select event or not
	 */
	private _updateTable(select) {
		let selectedRows = this.s.dtPane.rows({selected: true}).data().toArray();
		this.selections = selectedRows;
		this._searchExtras();
		// If either of the options that effect how the panes are displayed are selected then update the Panes
		if (this.c.cascadePanes || this.c.viewTotal) {
			this._updatePane(select, true);
		}
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	private _updateFilterCount() {
		return this.s.dtPane !== undefined ?
			this.s.dtPane.rows({selected: true}).data().toArray().length :
			0;
	}

	/**
	 * Updates the values of all of the panes
	 * @param select whether a select has been made in a pane or not
	 * @param draw whether this has been triggered by a draw event or not
	 */
	private _updatePane(select, filteringActive, draw = false) {
		this.s.updating = true;
		this.s.filteringActive = false;
		let selectArray = [];
		let filterCount = 0;
		let filterIdx;
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
	}
}
