import { IClasses, IDefaults, IDOM, IS } from './paneType';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPane {

	private static version = '1.3.0';

	private static classes = {
		bordered: 'dtsp-bordered',
		buttonGroup: 'dtsp-buttonGroup',
		buttonSub: 'dtsp-buttonSub',
		caret: 'dtsp-caret',
		clear: 'dtsp-clear',
		clearAll: 'dtsp-clearAll',
		clearButton: 'clearButton',
		collapseAll: 'dtsp-collapseAll',
		collapseButton: 'dtsp-collapseButton',
		container: 'dtsp-searchPane',
		countButton: 'dtsp-countButton',
		disabledButton: 'dtsp-disabledButton',
		hidden: 'dtsp-hidden',
		hide: 'dtsp-hide',
		layout: 'dtsp-',
		name: 'dtsp-name',
		nameButton: 'dtsp-nameButton',
		nameCont: 'dtsp-nameCont',
		narrow: 'dtsp-narrow',
		paneButton: 'dtsp-paneButton',
		paneInputButton: 'dtsp-paneInputButton',
		pill: 'dtsp-pill',
		rotated: 'dtsp-rotated',
		search: 'dtsp-search',
		searchCont: 'dtsp-searchCont',
		searchIcon: 'dtsp-searchIcon',
		searchLabelCont: 'dtsp-searchButtonCont',
		selected: 'dtsp-selected',
		smallGap: 'dtsp-smallGap',
		subRow1: 'dtsp-subRow1',
		subRow2: 'dtsp-subRow2',
		subRowsContainer: 'dtsp-subRowsContainer',
		title: 'dtsp-title',
		topRow: 'dtsp-topRow'
	};

	// Define SearchPanes default options
	private static defaults = {
		clear: true,
		collapse: true,
		combiner: 'or',
		container(dt) {
			return dt.table().container();
		},
		controls: true,
		dtOpts: {},
		emptyMessage: null,
		hideCount: false,
		i18n: {
			clearPane: '&times;',
			count: '{total}',
			emptyMessage: '<em>No data</em>',
		},
		initCollapsed: false,
		layout: 'auto',
		name: undefined,
		orderable: true,
		orthogonal: {
			display: 'display',
			filter: 'filter',
			hideCount: false,
			search: 'filter',
			show: undefined,
			sort: 'sort',
			threshold: 0.6,
			type: 'type',
			viewCount: true
		},
		preSelect: [],
		threshold: 0.6,
		viewCount: true
	};

	public classes: IClasses;
	public dom: IDOM;
	public c: IDefaults;
	public s: IS;

	/**
	 * Creates the panes, sets up the search function
	 *
	 * @param paneSettings The settings for the searchPanes
	 * @param opts The options for the default features
	 * @param index the index of the column for this pane
	 * @param panesContainer The overall container for SearchPanes that this pane will be attached to
	 * @param panes The custom pane settings if this is a custom pane
	 * @returns {object} the pane that has been created, including the table and the index of the pane
	 */
	public constructor(paneSettings, opts, index, panesContainer, panes = null) {
		// Check that the required version of DataTables is included
		if (! dataTable || ! dataTable.versionCheck || ! dataTable.versionCheck('1.10.0')) {
			throw new Error('SearchPane requires DataTables 1.10 or newer');
		}

		// Check that Select is included
		// eslint-disable-next-line no-extra-parens
		if (! (dataTable as any).select) {
			throw new Error('SearchPane requires Select');
		}

		let table = new dataTable.Api(paneSettings);

		this.classes = $.extend(true, {}, SearchPane.classes);

		// Get options from user
		this.c = $.extend(true, {}, SearchPane.defaults, opts);

		if (opts && opts.hideCount && opts.viewCount === undefined) {
			this.c.viewCount = !this.c.hideCount;
		}

		let rowLength = table.columns().eq(0).toArray().length;

		this.s = {
			colExists: index < rowLength,
			colOpts: undefined,
			customPaneSettings: panes,
			displayed: false,
			dt: table,
			dtPane: undefined,
			firstSet: true,
			index,
			indexes: [],
			listSet: false,
			name: undefined,
			rowData: {
				arrayFilter: [],
				arrayOriginal: [],
				bins: {},
				binsOriginal: {},
				filterMap: new Map(),
				totalOptions: 0
			},
			scrollTop: 0,
			searchFunction: undefined,
			selections: [],
			serverSelect: [],
			serverSelecting: false,
			tableLength: null,
			updating: false
		};

		this.s.colOpts = this.s.colExists ? this._getOptions() : this._getBonusOptions();

		this.dom = {
			buttonGroup: $('<div/>').addClass(this.classes.buttonGroup),
			clear: $('<button type="button">&#215;</button>')
				.attr('disabled', 'true')
				.addClass(this.classes.disabledButton)
				.addClass(this.classes.paneButton)
				.addClass(this.classes.clearButton)
				.html(this.s.dt.i18n('searchPanes.clearPane', this.c.i18n.clearPane)),
			collapseButton: $('<button type="button"><span class="'+this.classes.caret+'">&#x5e;</span></button>')
				.addClass(this.classes.paneButton)
				.addClass(this.classes.collapseButton),
			container: $('<div/>')
				.addClass(this.classes.container)
				.addClass(this.s.colOpts.className)
				.addClass(
					this.classes.layout +
					(
						parseInt(this.c.layout.split('-')[1], 10) < 10 ?
							this.c.layout :
							this.c.layout.split('-')[0] + '-9'
					)
				)
				.addClass(
					this.s.customPaneSettings && this.s.customPaneSettings.className
						? this.s.customPaneSettings.className
						: ''
				),
			countButton: $('<button type="button"></button>')
				.addClass(this.classes.paneButton)
				.addClass(this.classes.countButton),
			dtP: $('<table><thead><tr><th>' +
				(this.s.colExists
					? $(this.s.dt.column(this.s.index).header()).text()
					: this.s.customPaneSettings.header || 'Custom Pane') + '</th><th/></tr></thead></table>'),
			lower: $('<div/>').addClass(this.classes.subRow2).addClass(this.classes.narrowButton),
			nameButton: $('<button type="button"></button>')
				.addClass(this.classes.paneButton)
				.addClass(this.classes.nameButton),
			panesContainer,
			searchBox: $('<input/>').addClass(this.classes.paneInputButton).addClass(this.classes.search),
			searchButton: $('<button type = "button"/>')
				.addClass(this.classes.searchIcon)
				.addClass(this.classes.paneButton),
			searchCont: $('<div/>').addClass(this.classes.searchCont),
			searchLabelCont: $('<div/>').addClass(this.classes.searchLabelCont),
			topRow: $('<div/>').addClass(this.classes.topRow),
			upper: $('<div/>').addClass(this.classes.subRow1).addClass(this.classes.narrowSearch)
		};

		// Set the value of name incase ordering is desired
		if (this.s.colOpts.name) {
			this.s.name = this.s.colOpts.name;
		}
		else if (this.s.customPaneSettings && this.s.customPaneSettings.name) {
			this.s.name = this.s.customPaneSettings.name;
		}
		else {
			this.s.name = this.s.colExists ?
				$(this.s.dt.column(this.s.index).header()).text() :
				this.s.customPaneSettings.header || 'Custom Pane';
		}

		let tableNode = this.s.dt.table(0).node();

		// Custom search function for table
		this.s.searchFunction = (settings, searchData, dataIndex) => {
			// If no data has been selected then show all
			if (this.s.selections.length === 0) {
				return true;
			}

			if (settings.nTable !== tableNode) {
				return true;
			}

			let filter: string | string[] = null;

			if (this.s.colExists) {
				// Get the current filtered data
				filter = searchData[this.s.index];

				if (this.s.colOpts.orthogonal.filter !== 'filter') {
					// get the filter value from the map
					filter = this.s.rowData.filterMap.get(dataIndex);

					if (filter as any instanceof $.fn.dataTable.Api) {
						// eslint-disable-next-line no-extra-parens
						filter = (filter as any).toArray();
					}
				}
			}

			return this._search(filter, dataIndex);
		};

		$.fn.dataTable.ext.search.push(this.s.searchFunction);

		// If the clear button for this pane is clicked clear the selections
		if (this.c.clear) {
			this.dom.clear.on('click.dtsp', () => {
				let searches = this.dom.container.find('.' + this.classes.search.replace(/\s+/g, '.'));

				searches.each(function() {
					$(this).val('').trigger('input');
				});

				this.clearPane();
			});
		}

		// Sometimes the top row of the panes containing the search box and ordering buttons appears
		//  weird if the width of the panes is lower than expected, this fixes the design.
		// Equally this may occur when the table is resized.
		this.s.dt.on('draw.dtsp', () => this.adjustTopRow());
		this.s.dt.on('buttons-action.dtsp', () => this.adjustTopRow());

		// When column-reorder is present and the columns are moved, it is necessary to
		//  reassign all of the panes indexes to the new index of the column.
		this.s.dt.on('column-reorder.dtsp', (e, settings, details) => {
			this.s.index = details.mapping[this.s.index];
		});

		return this;
	}

	/**
	 * Adds a row to the panes table
	 *
	 * @param display the value to be displayed to the user
	 * @param filter the value to be filtered on when searchpanes is implemented
	 * @param shown the number of rows in the table that are currently visible matching this criteria
	 * @param total the total number of rows in the table that match this criteria
	 * @param sort the value to be sorted in the pane table
	 * @param type the value of which the type is to be derived from
	 */
	public addRow(
		display,
		filter,
		sort,
		type,
		className?: string,
		total?,
		shown?
	): any {
		let index: number;
		if(!total) {
			total = this.s.rowData.bins[filter] ?
				this.s.rowData.bins[filter] :
				0;
		}
		if(total === undefined) {
			total = this._getEmpties();
		}
		if(!shown) {
			shown = this._getShown(filter);
		}

		for (let entry of this.s.indexes) {
			if (entry.filter === filter) {
				index = entry.index;
			}
		}

		if (index === undefined) {
			index = this.s.indexes.length;
			this.s.indexes.push({filter, index});
		}

		return this.s.dtPane.row.add({
			className,
			display: display !== '' ?
				display :
				this.emptyMessage(),
			filter,
			index,
			shown,
			sort,
			total,
			type
		});
	}

	/**
	 * Adjusts the layout of the top row when the screen is resized
	 */
	public adjustTopRow(): void {
		let subContainers = this.dom.container.find('.' + this.classes.subRowsContainer.replace(/\s+/g, '.'));
		let subRow1 = this.dom.container.find('.' + this.classes.subRow1.replace(/\s+/g, '.'));
		let subRow2 = this.dom.container.find('.' + this.classes.subRow2.replace(/\s+/g, '.'));
		let topRow = this.dom.container.find('.' + this.classes.topRow.replace(/\s+/g, '.'));

		// If the width is 0 then it is safe to assume that the pane has not yet been displayed.
		//  Even if it has, if the width is 0 it won't make a difference if it has the narrow class or not
		if (($(subContainers[0]).width() < 252 || $(topRow[0]).width() < 252) && $(subContainers[0]).width() !== 0) {
			$(subContainers[0]).addClass(this.classes.narrow);
			$(subRow1[0]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowSearch);
			$(subRow2[0]).addClass(this.classes.narrowSub).removeClass(this.classes.narrowButton);
		}
		else {
			$(subContainers[0]).removeClass(this.classes.narrow);
			$(subRow1[0]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowSearch);
			$(subRow2[0]).removeClass(this.classes.narrowSub).addClass(this.classes.narrowButton);
		}
	}

	/**
	 * In the case of a rebuild there is potential for new data to have been included or removed
	 * so all of the rowData must be reset as a precaution.
	 */
	public clearData(): void {
		this.s.rowData = {
			arrayFilter: [],
			arrayOriginal: [],
			bins: {},
			binsOriginal: {},
			filterMap: new Map(),
			totalOptions: 0
		};
	}

	/**
	 * Clear the selections in the pane
	 */
	public clearPane(): this {
		// Deselect all rows which are selected and update the table and filter count.
		this.s.dtPane.rows({selected: true}).deselect();
		this.updateTable();
		return this;
	}

	/**
	 * Collapses the pane so that only the header is displayed
	 */
	public collapse(): void {
		if (
			!this.s.displayed ||
			(
				// If collapsing is disabled globally, and not enabled specifically for this column
				!this.c.collapse && this.s.colOpts.collapse !== true ||
				// OR, collapsing could be enabled globally and this column specifically
				// is not to be collapsed.
				// We can't just take !this.s.colOpts.collapse here as if it is undefined
				// then the global should be used
				this.s.colOpts.collapse === false
			)
		) {
			return;
		}

		$(this.s.dtPane.table().container()).addClass(this.classes.hidden);
		this.dom.topRow.addClass(this.classes.bordered);
		this.dom.nameButton.addClass(this.classes.disabledButton);
		this.dom.countButton.addClass(this.classes.disabledButton);
		this.dom.searchButton.addClass(this.classes.disabledButton);
		this.dom.collapseButton.addClass(this.classes.rotated);

		this.dom.topRow.one('click.dtsp', () => this.show());
	}

	/**
	 * Strips all of the SearchPanes elements from the document and turns all of the listeners for the buttons off
	 */
	public destroy(): void {
		if (this.s.dtPane) {
			this.s.dtPane.off('.dtsp');
		}

		this.s.dt.off('.dtsp');
		this.dom.clear.off('.dtsp');
		this.dom.nameButton.off('.dtsp');
		this.dom.countButton.off('.dtsp');
		this.dom.searchButton.off('.dtsp');
		this.dom.collapseButton.off('.dtsp');
		$(this.s.dt.table().node()).off('.dtsp');

		this.dom.container.detach();

		let searchIdx = $.fn.dataTable.ext.search.indexOf(this.s.searchFunction);

		while (searchIdx !== -1) {
			$.fn.dataTable.ext.search.splice(searchIdx, 1);
			searchIdx = $.fn.dataTable.ext.search.indexOf(this.s.searchFunction);
		}

		// If the datatables have been defined for the panes then also destroy these
		if (this.s.dtPane) {
			this.s.dtPane.destroy();
		}

		this.s.listSet = false;
	}

	/**
	 * Getting the legacy message is a little complex due a legacy parameter
	 */
	public emptyMessage(): string {
		let def = this.c.i18n.emptyMessage;

		// Legacy parameter support
		if (this.c.emptyMessage) {
			def = this.c.emptyMessage;
		}

		// Override per column
		if (this.s.colOpts.emptyMessage !== false && this.s.colOpts.emptyMessage !== null) {
			def = this.s.colOpts.emptyMessage;
		}

		return this.s.dt.i18n('searchPanes.emptyMessage', def);
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	public getPaneCount(): number {
		return this.s.dtPane ?
			this.s.dtPane.rows({selected: true}).data().toArray().length :
			0;
	}

	/**
	 * Rebuilds the panes from the start having deleted the old ones
	 *
	 * @param? dataIn data to be used in buildPane
	 * @param? maintainSelection Whether the current selections are to be maintained over rebuild
	 */
	public rebuildPane(dataIn = null, maintainSelection = false): this {
		this.clearData();

		let selectedRows = [];
		this.s.serverSelect = [];
		let prevEl = null;

		// When rebuilding strip all of the HTML Elements out of the container and start from scratch
		if (this.s.dtPane) {
			if (maintainSelection) {
				if (!this.s.dt.page.info().serverSide) {
					selectedRows = this.s.dtPane.rows({selected: true}).data().toArray();
				}
				else {
					this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
				}
			}

			this.s.dtPane.clear().destroy();
			prevEl = this.dom.container.prev();
			this.destroy();
			this.s.dtPane = undefined;
			$.fn.dataTable.ext.search.push(this.s.searchFunction);
		}

		this.dom.container.removeClass(this.classes.hidden);
		this.s.displayed = false;
		this._buildPane(
			!this.s.dt.page.info().serverSide ?
				selectedRows :
				this.s.serverSelect,
			dataIn,
			prevEl
		);

		return this;
	}

	/**
	 * Resizes the pane based on the layout that is passed in
	 *
	 * @param layout the layout to be applied to this pane
	 */
	public resize(layout: string): void {
		this.c.layout = layout;
		this.dom.container
			.removeClass()
			.addClass(this.classes.show)
			.addClass(this.classes.container)
			.addClass(this.s.colOpts.className)
			.addClass(
				this.classes.layout +
				(
					parseInt(layout.split('-')[1], 10) < 10 ?
						layout :
						layout.split('-')[0] + '-9'
				)
			)
			.addClass(
				this.s.customPaneSettings !== null && this.s.customPaneSettings.className
					? this.s.customPaneSettings.className
					: ''
			);
		this.adjustTopRow();
	}

	/**
	 * Sets the listeners for the pane.
	 *
	 * Having it in it's own function makes it easier to only set them once
	 */
	public setListeners(): void {
		if (!this.s.dtPane) {
			return;
		}

		let t0: NodeJS.Timeout;

		// When an item is selected on the pane, add these to the array which holds selected items.
		// Custom search will perform.
		this.s.dtPane.off('select.dtsp').on('select.dtsp', () => {
			clearTimeout(t0);
			this._updateSelection(!this.s.updating);

			this.dom.clear.removeClass(this.classes.disabledButton).removeAttr('disabled');
		});

		// When an item is deselected on the pane, re add the currently selected items to the array
		// which holds selected items. Custom search will be performed.
		this.s.dtPane.off('deselect.dtsp').on('deselect.dtsp', () => {
			t0 = setTimeout(() => {
				this._updateSelection(true);

				if (this.s.dtPane.rows({selected: true}).data().toArray().length === 0) {
					this.dom.clear.addClass(this.classes.disabledButton).attr('disabled', 'true');
				}
			}, 50);
		});

		// If we attempty to turn off this event then it will ruin behaviour in other panes
		//  so need to make sure that it is only done once
		if (this.s.firstSet) {
			this.s.firstSet = false;
			// When saving the state store all of the selected rows for preselection next time around
			this.s.dt.on('stateSaveParams.dtsp', (e, settings, data) => {
				// If the data being passed in is empty then state clear must have occured
				// so clear the panes state as well
				if ($.isEmptyObject(data)) {
					this.s.dtPane.state.clear();
					return;
				}

				let bins;
				let order;
				let selected = [];
				let collapsed;
				let searchTerm: string | number | string[];
				let arrayFilter;

				// Get all of the data needed for the state save from the pane
				if (this.s.dtPane) {
					selected = this.s.dtPane
						.rows({selected: true})
						.data()
						.map(item => item.filter.toString())
						.toArray();
					searchTerm = this.dom.searchBox.val();
					order = this.s.dtPane.order();
					bins = this.s.rowData.binsOriginal;
					arrayFilter = this.s.rowData.arrayOriginal;
					collapsed = this.dom.collapseButton.hasClass(this.classes.rotated);
				}

				if (data.searchPanes === undefined) {
					data.searchPanes = {};
				}

				if (data.searchPanes.panes === undefined) {
					data.searchPanes.panes = [];
				}

				for (let i = 0; i < data.searchPanes.panes.length; i++) {
					if (data.searchPanes.panes[i].id === this.s.index) {
						data.searchPanes.panes.splice(i, 1);
						i--;
					}
				}

				// Add the panes data to the state object
				data.searchPanes.panes.push({
					arrayFilter,
					bins,
					collapsed,
					id: this.s.index,
					order,
					searchTerm,
					selected
				});
			});
		}

		this.s.dtPane.off('user-select.dtsp').on('user-select.dtsp', (e, _dt, type, cell, originalEvent) => {
			originalEvent.stopPropagation();
		});

		this.s.dtPane.off('draw.dtsp').on('draw.dtsp', () => this.adjustTopRow());

		// When the button to order by the name of the options is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.nameButton.off('click.dtsp').on('click.dtsp', () => {
			let currentOrder = this.s.dtPane.order()[0][1];
			this.s.dtPane.order([0, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
			// This state save is required so that the ordering of the panes is maintained
			this.s.dt.state.save();
		});

		// When the button to order by the number of entries in the column is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.countButton.off('click.dtsp').on('click.dtsp', () => {
			let currentOrder = this.s.dtPane.order()[0][1];
			this.s.dtPane.order([1, currentOrder === 'asc' ? 'desc' : 'asc']).draw();
			// This state save is required so that the ordering of the panes is maintained
			this.s.dt.state.save();
		});

		// When the button to order by the number of entries in the column is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.collapseButton.off('click.dtsp').on('click.dtsp', (e) => {
			e.stopPropagation();
			let container = $(this.s.dtPane.table().container());

			// Toggle the classes
			container.toggleClass(this.classes.hidden);
			this.dom.topRow.toggleClass(this.classes.bordered);
			this.dom.nameButton.toggleClass(this.classes.disabledButton);
			this.dom.countButton.toggleClass(this.classes.disabledButton);
			this.dom.searchButton.toggleClass(this.classes.disabledButton);
			this.dom.collapseButton.toggleClass(this.classes.rotated);

			if (container.hasClass(this.classes.hidden)) {
				this.dom.topRow.on('click.dtsp', () => this.dom.collapseButton.click());
			}
			else {
				this.dom.topRow.off('click.dtsp');
			}

			this.s.dt.state.save();

			return;
		});

		// When the clear button is clicked reset the pane
		this.dom.clear.off('click.dtsp').on('click.dtsp', () => {
			let searches = this.dom.container.find('.' + this.classes.search.replace(/ /g, '.'));

			searches.each(function() {
				// set the value of the search box to be an empty string and then search on that, effectively reseting
				$(this).val('').trigger('input');
			});

			this.clearPane();
		});

		// When the search button is clicked then draw focus to the search box
		this.dom.searchButton.off('click.dtsp').on('click.dtsp', () => this.dom.searchBox.focus());

		// When a character is inputted into the searchbox search the pane for matching values.
		// Doing it this way means that no button has to be clicked to trigger a search, it is done asynchronously
		this.dom.searchBox.off('click.dtsp').on('input.dtsp', () => {
			let searchval = this.dom.searchBox.val();
			this.s.dtPane.search(searchval).draw();
			if (
				typeof searchval === 'string' &&
				(
					searchval.length > 0 ||
					searchval.length === 0 && this.s.dtPane.rows({selected: true}).data().toArray().length > 0
				)
			) {
				this.dom.clear.removeClass(this.classes.disabledButton).removeAttr('disabled');
			}
			else {
				this.dom.clear.addClass(this.classes.disabledButton).attr('disabled', 'true');
			}

			// This state save is required so that the searching on the panes is maintained
			this.s.dt.state.save();
		});

		// WORKAROUND
		// If this line is removed, the select listeners aren't present on
		// the panes for some reason when a rebuild occurs
		this.s.dtPane.select.style('os');
	}

	/**
	 * Populates the SearchPane based off of the data that has been recieved from the server
	 *
	 * This method is overriden by SearchPaneST
	 *
	 * @param dataIn The data that has been sent from the server
	 */
	public _serverPopulate(dataIn) {
		if (dataIn.tableLength) {
			this.s.tableLength = dataIn.tableLength;
			this.s.rowData.totalOptions = this.s.tableLength;
		}
		else if (this.s.tableLength === null || this.s.dt.rows()[0].length > this.s.tableLength) {
			this.s.tableLength = this.s.dt.rows()[0].length;
			this.s.rowData.totalOptions = this.s.tableLength;
		}

		let colTitle = this.s.dt.column(this.s.index).dataSrc();

		// If there is SP data for this column add it to the data array and bin
		if (dataIn.searchPanes.options[colTitle]) {
			for (let dataPoint of dataIn.searchPanes.options[colTitle]) {
				this.s.rowData.arrayFilter.push({
					display: dataPoint.label,
					filter: dataPoint.value,
					sort: dataPoint.label,
					type: dataPoint.label
				});
				this.s.rowData.bins[dataPoint.value] = dataPoint.total;
			}
		}

		let binLength = Object.keys(this.s.rowData.bins).length;
		let uniqueRatio = this._uniqueRatio(binLength, this.s.tableLength);

		// Don't show the pane if there isnt enough variance in the data, or there is only 1 entry for that pane
		if (
			this.s.displayed === false &&
			(
				(
					this.s.colOpts.show === undefined && this.s.colOpts.threshold === null ?
						uniqueRatio > this.c.threshold :
						uniqueRatio > this.s.colOpts.threshold
				) ||
				this.s.colOpts.show !== true && binLength <= 1
			)
		) {
			this.dom.container.addClass(this.classes.hidden);
			this.s.displayed = false;
			return;
		}

		// Store the original data
		this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
		this.s.rowData.binsOriginal = this.s.rowData.bins;

		// Flag this pane as being displayed
		this.s.displayed = true;
	}

	/**
	 * Expands the pane from the collapsed state
	 */
	public show(): void {
		if (!this.s.displayed) {
			return;
		}

		this.dom.topRow.removeClass(this.classes.bordered);
		this.dom.nameButton.removeClass(this.classes.disabledButton);
		this.dom.countButton.removeClass(this.classes.disabledButton);
		this.dom.searchButton.removeClass(this.classes.disabledButton);
		this.dom.collapseButton.removeClass(this.classes.rotated);
		$(this.s.dtPane.table().container()).removeClass(this.classes.hidden);
	}

	/**
	 * Finds the ratio of the number of different options in the table to the number of rows
	 *
	 * @param bins the number of different options in the table
	 * @param rowCount the total number of rows in the table
	 * @returns {number} returns the ratio
	 */
	public _uniqueRatio(bins: number, rowCount: number): number {
		if (
			rowCount > 0 &&
			(
				this.s.rowData.totalOptions > 0 && !this.s.dt.page.info().serverSide ||
				this.s.dt.page.info().serverSide && this.s.tableLength > 0
			)
		) {
			return bins / this.s.rowData.totalOptions;
		}
		else {
			return 1;
		}
	}

	/**
	 * Updates the panes if one of the options to do so has been set to true
	 * rather than the filtered message when using viewTotal.
	 */
	public updateTable(): void {
		let selectedRows = this.s.dtPane.rows({selected: true}).data().toArray().map(el => el.filter);
		this.s.selections = selectedRows;
		this._searchExtras();
	}

	/**
	 * Gets the number of empty cells in the column
	 *
	 * This method is overridden by SearchPaneViewTotal and SearchPaneCascade
	 *
	 * @returns number The number of empty cells in the column
	 */
	protected _getEmpties() {
		let total = 0;
		this.s.rowData.arrayFilter.forEach(element => {
			if (element.filter === '') {
				total++;
			}
		});

		return total;
	}


	protected _getMessage(row) {
		return this.s.dt.i18n('searchPanes.count', this.c.i18n.count).replace(/{total}/g, row.total);
	}

	/**
	 * Overridden in SearchPaneViewTotal and SearchPaneCascade to get the number of times a specific value is shown
	 *
	 * Here it is blanked so that it takes no action
	 *
	 * @param filter The filter value
	 * @returns undefined
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _getShown(filter) {
		return undefined;
	}

	/**
	 * Get's the pane config appropriate to this class
	 *
	 * @returns The config needed to create a pane of this type
	 */
	protected _getPaneConfig() {
		// eslint-disable-next-line no-extra-parens
		let haveScroller = (dataTable as any).Scroller;

		return {
			columnDefs: [
				{
					className: 'dtsp-nameColumn',
					data: 'display',
					render: (data, type, row) => {
						if (type === 'sort') {
							return row.sort;
						}
						else if (type === 'type') {
							return row.type;
						}

						let message = this._getMessage(row);

						// We are displaying the count in the same columne as the name of the search option.
						// This is so that there is not need to call columns.adjust()
						//  which in turn speeds up the code
						let pill = '<span class="' + this.classes.pill + '">' + message + '</span>';

						if (!this.c.viewCount || !this.s.colOpts.viewCount) {
							pill = '';
						}

						if (type === 'filter') {
							return typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
								data.replace(/<[^>]*>/g, '') :
								data;
						}

						return '<div class="' + this.classes.nameCont + '"><span title="' +
							(
								typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
									data.replace(/<[^>]*>/g, '') :
									data
							) +
							'" class="' + this.classes.name + '">' +
							data + '</span>' +
							pill + '</div>';
					},
					targets: 0,
					// Accessing the private datatables property to set type based on the original table.
					// This is null if not defined by the user, meaning that automatic type detection
					//  would take place
					type: this.s.dt.settings()[0].aoColumns[this.s.index] ?
						this.s.dt.settings()[0].aoColumns[this.s.index]._sManualType :
						null
				},
				{
					className: 'dtsp-countColumn ' + this.classes.badgePill,
					data: 'total',
					searchable: false,
					targets: 1,
					visible: false
				}
			],
			deferRender: true,
			dom: 't',
			info: false,
			language: this.s.dt.settings()[0].oLanguage,
			paging: haveScroller ? true : false,
			scrollX: false,
			scrollY: '200px',
			scroller: haveScroller ? true : false,
			select: true,
			stateSave: this.s.dt.settings()[0].oFeatures.bStateSave ? true : false
		};
	}

	/**
	 * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
	 */
	protected _makeSelection(): void {
		this.updateTable();
		this.s.updating = true;
		this.s.dt.draw();
		this.s.updating = false;
	}

	/**
	 * Populates an array with all of the data for the table
	 *
	 * @param rowIdx The current row index to be compared
	 * @param arrayFilter The array that is to be populated with row Details
	 * @param settings The DataTable settings object
	 * @param bins The bins object that is to be populated with the row counts
	 */
	protected _populatePaneArray(
		rowIdx: number,
		arrayFilter,
		settings,
		bins: {[keys: string]: number} = this.s.rowData.bins
	): void {
		// Retrieve the rendered data from the cell using the fnGetCellData function
		// rather than the cell().render API method for optimisation
		if (typeof this.s.colOpts.orthogonal === 'string') {
			let rendered = settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal);
			this.s.rowData.filterMap.set(rowIdx, rendered);
			this._addOption(rendered, rendered, rendered, rendered, arrayFilter, bins);
			this.s.rowData.totalOptions++;
		}
		else {

			let filter = settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal.search);

			// Null and empty string are to be considered the same value
			if (filter === null) {
				filter = '';
			}

			if (typeof filter === 'string') {
				filter = filter.replace(/<[^>]*>/g, '');
			}

			this.s.rowData.filterMap.set(rowIdx, filter);

			if (!bins[filter]) {
				bins[filter] = 1;
				this._addOption(
					filter,
					settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal.display),
					settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal.sort),
					settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal.type),
					arrayFilter,
					bins
				);
				this.s.rowData.totalOptions++;
			}
			else {
				bins[filter] ++;
				this.s.rowData.totalOptions++;
				return;
			}
		}

	}

	/**
	 * Reloads all of the previous selects into the panes
	 *
	 * @param loadedFilter The loaded filters from a previous state
	 */
	protected _reloadSelect(loadedFilter): void {
		// If the state was not saved don't selected any
		if (loadedFilter === undefined) {
			return;
		}

		let idx: number;

		// For each pane, check that the loadedFilter list exists and is not null,
		// find the id of each search item and set it to be selected.
		for (let i = 0; i < loadedFilter.searchPanes.panes.length; i++) {
			if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
				idx = i;
				break;
			}
		}

		if (idx) {
			let table = this.s.dtPane;
			let rows = table.rows({order: 'index'}).data().map(
				item => item.filter !== null ?
					item.filter.toString() :
					null
			).toArray();

			for (let filter of loadedFilter.searchPanes.panes[idx].selected) {
				let id = -1;

				if (filter !== null) {
					id = rows.indexOf(filter.toString());
				}

				if (id > -1) {
					this.s.serverSelecting = true;
					table.row(id).select();
					this.s.serverSelecting = false;
				}
			}

		}
	}

	/**
	 * Notes the rows that have been selected within this pane and stores them internally
	 *
	 * @param notUpdating Whether the panes are updating themselves or not
	 */
	protected _updateSelection(notUpdating) {
		this.s.scrollTop = $(this.s.dtPane.table().node()).parent()[0].scrollTop;
		if (this.s.dt.page.info().serverSide && !this.s.updating) {
			if (!this.s.serverSelecting) {
				this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
				this.s.dt.draw(false);
			}
		}
		else if (notUpdating) {
			this._makeSelection();
		}
	}

	/**
	 * Takes in potentially undetected rows and adds them to the array if they are not yet featured
	 *
	 * @param filter the filter value of the potential row
	 * @param display the display value of the potential row
	 * @param sort the sort value of the potential row
	 * @param type the type value of the potential row
	 * @param arrayFilter the array to be populated
	 * @param bins the bins to be populated
	 */
	private _addOption(
		filter,
		display,
		sort,
		type,
		arrayFilter,
		bins: {[keys: string]: number}
	) {
		// If the filter is an array then take a note of this, and add the elements to the arrayFilter array
		if (Array.isArray(filter) || filter instanceof dataTable.Api) {
			// Convert to an array so that we can work with it
			if (filter instanceof dataTable.Api) {
				filter = filter.toArray();
				display = display.toArray();
			}

			if (filter.length === display.length) {
				for (let i = 0; i < filter.length; i++) {
					// If we haven't seen this row before add it
					if (!bins[filter[i]]) {
						bins[filter[i]] = 1;
						arrayFilter.push({
							display: display[i],
							filter: filter[i],
							sort: sort[i],
							type: type[i]
						});
					}
					// Otherwise just increment the count
					else {
						bins[filter[i]]++;
					}
					this.s.rowData.totalOptions++;
				}
				return;
			}
			else {
				throw new Error('display and filter not the same length');
			}
		}
		// If the values were affected by othogonal data and are not an array then check if it is already present
		else if (typeof this.s.colOpts.orthogonal === 'string') {
			if (!bins[filter]) {
				bins[filter] = 1;
				arrayFilter.push({
					display,
					filter,
					sort,
					type
				});
				this.s.rowData.totalOptions++;
			}
			else {
				bins[filter]++;
				this.s.rowData.totalOptions++;
				return;
			}
		}
		// Otherwise we must just be adding an option
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
	 * Method to construct the actual pane.
	 *
	 * @param selectedRows previously selected Rows to be reselected
	 * @param dataIn Data that should be used to populate this pane
	 * @param prevEl Reference to the previous element, used to ensure insert is in the correct location
	 * @returns boolean to indicate whether this pane was the last one to have a selection made
	 */
	private _buildPane(selectedRows = [], dataIn = null, prevEl = null): boolean {
		// Aliases
		this.s.selections = [];

		// Other Variables
		let loadedFilter = this.s.dt.state.loaded();

		// If the listeners have not been set yet then using the latest state may result in funny errors
		if (this.s.listSet) {
			loadedFilter = this.s.dt.state();
		}

		// If it is not a custom pane in place
		if (this.s.colExists) {
			let idx = -1;

			if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.panes) {
				for (let i = 0; i < loadedFilter.searchPanes.panes.length; i++) {
					if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
						idx = i;
						break;
					}
				}
			}

			// Perform checks that do not require populate pane to run
			if (
				(
					this.s.colOpts.show === false ||
					this.s.colOpts.show !== undefined && this.s.colOpts.show !== true
				) &&
				idx === -1
			) {
				this.dom.container.addClass(this.classes.hidden);
				this.s.displayed = false;
				return false;
			}
			else if (this.s.colOpts.show === true || idx !== -1) {
				this.s.displayed = true;
			}

			if (
				!this.s.dt.page.info().serverSide &&
				(
					!dataIn ||
					!dataIn.searchPanes ||
					!dataIn.searchPanes.options
				)
			) {
				// Only run populatePane if the data has not been collected yet
				if (this.s.rowData.arrayFilter.length === 0) {
					this.s.rowData.totalOptions = 0;
					this._populatePane();
					this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
					this.s.rowData.binsOriginal = this.s.rowData.bins;
				}

				let binLength = Object.keys(this.s.rowData.binsOriginal).length;
				let uniqueRatio = this._uniqueRatio(binLength, this.s.dt.rows()[0].length);

				// Don't show the pane if there isn't enough variance in the data, or there is only 1 entry
				//  for that pane
				if (
					this.s.displayed === false &&
					(
						(
							this.s.colOpts.show === undefined && this.s.colOpts.threshold === null ?
								uniqueRatio > this.c.threshold :
								uniqueRatio > this.s.colOpts.threshold
						) ||
						this.s.colOpts.show !== true && binLength <= 1
					)
				) {
					this.dom.container.addClass(this.classes.hidden);
					this.s.displayed = false;
					return;
				}

				this.dom.container.addClass(this.classes.show);
				this.s.displayed = true;
			}
			else if (dataIn && dataIn.searchPanes && dataIn.searchPanes.options) {
				this._serverPopulate(dataIn);
			}
		}
		else {
			this.s.displayed = true;
		}

		// If the variance is accceptable then display the search pane
		this._displayPane();

		if (!this.s.listSet) {
			// Here, when the state is loaded if the data object on the original table is empty,
			//  then a state.clear() must have occurred, so delete all of the panes tables state objects too.
			this.dom.dtP.on('stateLoadParams.dtsp', (e, settings, data) => {
				if ($.isEmptyObject(this.s.dt.state.loaded())) {
					$.each(data, (index) => {
						delete data[index];
					});
				}
			});
		}

		// Add the container to the document in its original location
		if (prevEl !== null && this.dom.panesContainer.has(prevEl).length > 0) {
			this.dom.container.insertAfter(prevEl);
		}
		else {
			this.dom.panesContainer.prepend(this.dom.container);
		}

		// Declare the datatable for the pane
		let errMode: string = $.fn.dataTable.ext.errMode;
		$.fn.dataTable.ext.errMode = 'none';
		// eslint-disable-next-line no-extra-parens

		this.s.dtPane = this.dom.dtP.DataTable($.extend(
			true,
			this._getPaneConfig(),
			this.c.dtOpts,
			this.s.colOpts ? this.s.colOpts.dtOpts : {},
			this.s.colOpts.options || !this.s.colExists ?
				{
					createdRow(row, data) {
						$(row).addClass(data.className);
					}
				}:
				undefined,
			this.s.customPaneSettings !== null && this.s.customPaneSettings.dtOpts ?
				this.s.customPaneSettings.dtOpts :
				{},
			$.fn.dataTable.versionCheck('2')
				? {
					layout: {
						bottomLeft: null,
						bottomRight: null,
						topLeft: null,
						topRight: null
					}
				}
				: {},
		));

		this.dom.dtP.addClass(this.classes.table);

		// Getting column titles is a little messy
		let headerText = 'Custom Pane';

		if (this.s.customPaneSettings && this.s.customPaneSettings.header) {
			headerText = this.s.customPaneSettings.header;
		}
		else if (this.s.colOpts.header) {
			headerText = this.s.colOpts.header;
		}
		else if (this.s.colExists) {
			headerText = $.fn.dataTable.versionCheck('2')
				? this.s.dt.column(this.s.index).title()
				: this.s.dt.settings()[0].aoColumns[this.s.index].sTitle;
		}

		headerText = this._escapeHTML(headerText);

		this.dom.searchBox.attr('placeholder', headerText);

		// As the pane table is not in the document yet we must initialise select ourselves
		// eslint-disable-next-line no-extra-parens
		($.fn.dataTable as any).select.init(this.s.dtPane);
		$.fn.dataTable.ext.errMode = errMode;

		// If it is not a custom pane
		if (this.s.colExists) {
			// Add all of the search options to the pane
			for (let i = 0, ien = this.s.rowData.arrayFilter.length; i < ien; i++) {
				if (this.s.dt.page.info().serverSide) {
					let row = this.addRow(
						this.s.rowData.arrayFilter[i].display,
						this.s.rowData.arrayFilter[i].filter,
						this.s.rowData.arrayFilter[i].sort,
						this.s.rowData.arrayFilter[i].type
					);

					for (let option of this.s.serverSelect) {
						if (option.filter === this.s.rowData.arrayFilter[i].filter) {
							this.s.serverSelecting = true;
							row.select();
							this.s.serverSelecting = false;
						}
					}

				}
				else if (!this.s.dt.page.info().serverSide && this.s.rowData.arrayFilter[i]) {
					this.addRow(
						this.s.rowData.arrayFilter[i].display,
						this.s.rowData.arrayFilter[i].filter,
						this.s.rowData.arrayFilter[i].sort,
						this.s.rowData.arrayFilter[i].type
					);
				}
				else if (!this.s.dt.page.info().serverSide) {
					// Just pass an empty string as the message will be calculated based on that in addRow()
					this.addRow('', '', '', '');
				}
			}
		}

		// eslint-disable-next-line no-extra-parens
		(dataTable as any).select.init(this.s.dtPane);

		// If there are custom options set or it is a custom pane then get them
		if (
			this.s.colOpts.options ||
			this.s.customPaneSettings && this.s.customPaneSettings.options
		) {
			this._getComparisonRows();
		}

		// Display the pane
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
		this.adjustTopRow();


		this.setListeners();
		this.s.listSet = true;

		for (let selection of selectedRows) {
			if (selection) {
				for (let row of this.s.dtPane.rows().indexes().toArray()) {
					if (
						this.s.dtPane.row(row).data() &&
						selection.filter === this.s.dtPane.row(row).data().filter
					) {
						// If this is happening when serverSide processing is happening then
						//  different behaviour is needed
						if (this.s.dt.page.info().serverSide) {
							this.s.serverSelecting = true;
							this.s.dtPane.row(row).select();
							this.s.serverSelecting = false;
						}
						else {
							this.s.dtPane.row(row).select();
						}
					}
				}
			}
		}

		//  If SSP and the table is ready, apply the search for the pane
		if (this.s.dt.page.info().serverSide) {
			this.s.dtPane.search(this.dom.searchBox.val()).draw();
		}

		if (
			(
				this.c.initCollapsed && this.s.colOpts.initCollapsed !== false ||
				this.s.colOpts.initCollapsed
			) &&
			(
				this.c.collapse && this.s.colOpts.collapse !== false ||
				this.s.colOpts.collapse
			)
		) {
			// If the pane has not initialised yet then we need to wait for it to do so before collapsing
			// Otherwise the container that the class is added to does not exist
			if(this.s.dtPane.settings()[0]._bInitComplete) {
				this.collapse();
			}
			else {
				this.s.dtPane.one('init', () => this.collapse());
			}
		}

		// Reload the selection, searchbox entry and ordering from the previous state
		// Need to check here if SSP that this is the first draw, otherwise it will infinite loop
		if (
			loadedFilter &&
			loadedFilter.searchPanes &&
			loadedFilter.searchPanes.panes &&
			(
				!dataIn ||
				dataIn.draw === 1
			)
		) {
			this._reloadSelect(loadedFilter);

			for (let pane of loadedFilter.searchPanes.panes) {
				if (pane.id === this.s.index) {
					// Save some time by only triggering an input if there is a value
					if (pane.searchTerm && pane.searchTerm.length > 0) {
						this.dom.searchBox.val(pane.searchTerm).trigger('input');
					}

					if (pane.order) {
						this.s.dtPane.order(pane.order).draw();
					}

					// Is the pane to be hidden or shown?
					if (pane.collapsed) {
						this.collapse();
					}
					else {
						this.show();
					}
				}
			}
		}

		return true;
	}

	/**
	 * Appends all of the HTML elements to their relevant parent Elements
	 */
	private _displayPane(): void {
		// Empty everything to start again
		this.dom.dtP.empty();
		this.dom.topRow.empty().addClass(this.classes.topRow);

		// If there are more than 3 columns defined then make there be a smaller gap between the panes
		if (parseInt(this.c.layout.split('-')[1], 10) > 3) {
			this.dom.container.addClass(this.classes.smallGap);
		}

		this.dom.topRow
			.addClass(this.classes.subRowsContainer)
			.append(this.dom.upper.append(this.dom.searchCont))
			.append(this.dom.lower.append(this.dom.buttonGroup));

		// If no selections have been made in the pane then disable the clear button
		if (
			this.c.dtOpts.searching === false ||
			this.s.colOpts.dtOpts && this.s.colOpts.dtOpts.searching === false ||
			(!this.c.controls || !this.s.colOpts.controls) ||
			this.s.customPaneSettings &&
			this.s.customPaneSettings.dtOpts &&
			this.s.customPaneSettings.dtOpts.searching !== undefined &&
			!this.s.customPaneSettings.dtOpts.searching
		) {
			this.dom.searchBox
				.removeClass(this.classes.paneInputButton)
				.addClass(this.classes.disabledButton)
				.attr('disabled', 'true');
		}

		this.dom.searchBox.appendTo(this.dom.searchCont);

		// Create the contents of the searchCont div. Worth noting that this function will change when using semantic ui
		this._searchContSetup();

		// If the clear button is allowed to show then display it
		if (this.c.clear && this.c.controls && this.s.colOpts.controls) {
			this.dom.clear.appendTo(this.dom.buttonGroup);
		}

		if (this.c.orderable && this.s.colOpts.orderable && this.c.controls && this.s.colOpts.controls) {
			this.dom.nameButton.appendTo(this.dom.buttonGroup);
		}

		// If the count column is hidden then don't display the ordering button for it
		if (
			this.c.viewCount &&
			this.s.colOpts.viewCount &&
			this.c.orderable &&
			this.s.colOpts.orderable &&
			this.c.controls &&
			this.s.colOpts.controls
		) {
			this.dom.countButton.appendTo(this.dom.buttonGroup);
		}

		if (
			(
				this.c.collapse && this.s.colOpts.collapse !== false ||
				this.s.colOpts.collapse
			) &&
			this.c.controls && this.s.colOpts.controls
		) {
			this.dom.collapseButton.appendTo(this.dom.buttonGroup);
		}

		this.dom.container.prepend(this.dom.topRow).append(this.dom.dtP).show();
	}

	/**
	 * Escape html characters within a string
	 *
	 * @param txt the string to be escaped
	 * @returns the escaped string
	 */
	private _escapeHTML(txt: string): string {
		return txt
			.toString()
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"');
	}

	/**
	 * Gets the options for the row for the customPanes
	 *
	 * @returns {object} The options for the row extended to include the options from the user.
	 */
	private _getBonusOptions(): {[keys: string]: any} {
		// We need to reset the thresholds as if they have a value in colOpts then that value will be used
		let defaultMutator = {
			threshold: null
		};
		return $.extend(
			true,
			{},
			SearchPane.defaults,
			defaultMutator,
			this.c ? this.c : {}
		);
	}

	/**
	 * Adds the custom options to the pane
	 *
	 * @returns {Array} Returns the array of rows which have been added to the pane
	 */
	private _getComparisonRows() {
		// Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
		let options = this.s.colOpts.options
			? this.s.colOpts.options
			: this.s.customPaneSettings && this.s.customPaneSettings.options
				? this.s.customPaneSettings.options
				: undefined;

		if (options === undefined) {
			return;
		}

		let allRows = this.s.dt.rows();
		let tableValsTotal = allRows.data().toArray();
		let rows = [];
		// Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
		this.s.dtPane.clear();

		for (let comp of options) {
			// Initialise the object which is to be placed in the row
			let insert = comp.label !== '' ?
				comp.label :
				this.emptyMessage();
			let comparisonObj = {
				className: comp.className,
				display: insert,
				filter: typeof comp.value === 'function' ? comp.value : [],
				sort: insert,
				total: 0,
				type: insert
			};

			// If a custom function is in place
			if (typeof comp.value === 'function') {
				// Count the number of times the function evaluates to true for the original data in the Table
				for (let i = 0; i < tableValsTotal.length; i++) {
					if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
						comparisonObj.total++;
					}
				}

				// Update the comparisonObj
				if (typeof comparisonObj.filter !== 'function') {
					comparisonObj.filter.push(comp.filter);
				}
			}

			rows.push(this.addRow(
				comparisonObj.display,
				comparisonObj.filter,
				comparisonObj.sort,
				comparisonObj.type,
				comparisonObj.className,
				comparisonObj.total
			));
		}

		return rows;
	}

	/**
	 * Gets the options for the row for the customPanes
	 *
	 * @returns {object} The options for the row extended to include the options from the user.
	 */
	private _getOptions(): {[keys: string]: any} {
		let table = this.s.dt;
		// We need to reset the thresholds as if they have a value in colOpts then that value will be used
		let defaultMutator = {
			collapse: null,
			emptyMessage: false,
			initCollapsed: null,
			threshold: null
		};
		let columnOptions = table.settings()[0].aoColumns[this.s.index].searchPanes;

		let colOpts = $.extend(
			true,
			{},
			SearchPane.defaults,
			defaultMutator,
			columnOptions
		);

		if (columnOptions && columnOptions.hideCount &&	columnOptions.viewCount === undefined) {
			colOpts.viewCount = !columnOptions.hideCount;
		}

		return colOpts;
	}

	/**
	 * Fill the array with the values that are currently being displayed in the table
	 */
	private _populatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.bins = {};
		let settings = this.s.dt.settings()[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows().indexes().toArray()) {
				this._populatePaneArray(index, this.s.rowData.arrayFilter, settings);
			}
		}
	}

	/**
	 * This method decides whether a row should contribute to the pane or not
	 *
	 * @param filter the value that the row is to be filtered on
	 * @param dataIndex the row index
	 */
	private _search(filter, dataIndex: number): boolean {
		let colOpts = this.s.colOpts;
		let table = this.s.dt;

		// For each item selected in the pane, check if it is available in the cell
		for (let colSelect of this.s.selections) {
			if (typeof colSelect === 'string' && typeof filter === 'string') {
				// The filter value will not have the &amp; in place but a &,
				// so we need to do a replace to make sure that they will match
				colSelect = this._escapeHTML(colSelect);
			}

			// if the filter is an array then is the column present in it
			if (Array.isArray(filter)) {
				if (filter.includes(colSelect)) {
					return true;
				}
			}
			// if the filter is a function then does it meet the criteria of that function or not
			else if (typeof colSelect === 'function') {
				if (colSelect.call(table, table.row(dataIndex).data(), dataIndex)) {
					if (colOpts.combiner === 'or') {
						return true;
					}
				}
				// If the combiner is an "and" then we need to check against all possible selections
				// so if it fails here then the and is not met and return false
				else if (colOpts.combiner === 'and') {
					return false;
				}
			}
			// otherwise if the two filter values are equal then return true
			else if (
				filter === colSelect ||
				// Loose type checking incase number type in column comparing to a string
				// eslint-disable-next-line eqeqeq
				!(typeof filter === 'string' && filter.length === 0) && filter == colSelect ||
				colSelect === null && typeof filter === 'string' && filter === ''
			) {
				return true;
			}
		}

		// If the combiner is an and then we need to check against all possible selections
		// so return true here if so because it would have returned false earlier if it had failed
		if (colOpts.combiner === 'and') {
			return true;
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
		if (this.c.controls && this.s.colOpts.controls) {
			this.dom.searchButton.appendTo(this.dom.searchLabelCont);
		}

		if (
			!(
				this.c.dtOpts.searching === false ||
				this.s.colOpts.dtOpts.searching === false ||
				this.s.customPaneSettings &&
				this.s.customPaneSettings.dtOpts &&
				this.s.customPaneSettings.dtOpts.searching !== undefined &&
				!this.s.customPaneSettings.dtOpts.searching
			)
		) {
			this.dom.searchLabelCont.appendTo(this.dom.searchCont);
		}
	}

	/**
	 * Adds outline to the pane when a selection has been made
	 */
	private _searchExtras(): void {
		let updating = this.s.updating;
		this.s.updating = true;
		let filters = this.s.dtPane.rows({selected: true}).data().pluck('filter').toArray();
		let nullIndex = filters.indexOf(this.emptyMessage());
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
}
