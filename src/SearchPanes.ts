let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace DataTables {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface IStaticFunctions {
		select: any;
	}
}
import { IClasses, IDefaults, IDOM, IS } from './panesType';
import SearchPane from './SearchPane';

export default class SearchPanes {

	private static version = '2.0.0-dev';

	private static classes = {
		clear: 'dtsp-clear',
		clearAll: 'dtsp-clearAll',
		collapseAll: 'dtsp-collapseAll',
		container: 'dtsp-searchPanes',
		disabledButton: 'dtsp-disabledButton',
		emptyMessage: 'dtsp-emptyMessage',
		hide: 'dtsp-hidden',
		panes: 'dtsp-panesContainer',
		search: 'dtsp-search',
		showAll: 'dtsp-showAll',
		title: 'dtsp-title',
		titleRow: 'dtsp-titleRow'
	};

	// Define SearchPanes default options
	private static defaults = {
		clear: true,
		collapse: true,
		columns: [],
		container(dt) {
			return dt.table().container();
		},
		filterChanged: undefined,
		i18n: {
			clearMessage: 'Clear All',
			clearPane: '&times;',
			collapse: {
				0: 'SearchPanes',
				_: 'SearchPanes (%d)'
			},
			collapseMessage: 'Collapse All',
			count: '{total}',
			emptyMessage: '<em>No data</em>',
			emptyPanes: 'No SearchPanes',
			loadMessage: 'Loading Search Panes...',
			showMessage: 'Show All',
			title: 'Filters Active - %d'
		},
		layout: 'auto',
		order: [],
		panes: [],
		preSelect: []
	};

	public classes: IClasses;
	public dom: IDOM;
	public c: IDefaults;
	public s: IS;

	public constructor(paneSettings, opts, fromPreInit = false, paneClass = SearchPane) {
		// Check that the required version of DataTables is included
		if (!dataTable || !dataTable.versionCheck || !dataTable.versionCheck('1.10.0')) {
			throw new Error('SearchPane requires DataTables 1.10 or newer');
		}

		// Check that Select is included
		// eslint-disable-next-line no-extra-parens
		if (!(dataTable as any).select) {
			throw new Error('SearchPane requires Select');
		}

		let table = new dataTable.Api(paneSettings);
		this.classes = $.extend(true, {}, SearchPanes.classes);

		// Get options from user
		this.c = $.extend(true, {}, SearchPanes.defaults, opts);

		// Add extra elements to DOM object including clear
		this.dom = {
			clearAll: $('<button type="button"/>')
				.addClass(this.classes.clearAll)
				.html(table.i18n('searchPanes.clearMessage', this.c.i18n.clearMessage)),
			collapseAll: $('<button type="button"/>')
				.addClass(this.classes.collapseAll)
				.html(table.i18n('searchPanes.collapseMessage', this.c.i18n.collapseMessage)),
			container: $('<div/>').addClass(this.classes.panes).html(
				table.i18n('searchPanes.loadMessage', this.c.i18n.loadMessage)
			),
			emptyMessage: $('<div/>').addClass(this.classes.emptyMessage),
			panes: $('<div/>').addClass(this.classes.container),
			showAll: $('<button type="button"/>')
				.addClass(this.classes.showAll)
				.addClass(this.classes.disabledButton)
				.attr('disabled', 'true')
				.html(table.i18n('searchPanes.showMessage', this.c.i18n.showMessage)),
			title: $('<div/>').addClass(this.classes.title),
			titleRow: $('<div/>').addClass(this.classes.titleRow),
		};

		this.s = {
			colOpts: [],
			dt: table,
			filterCount: 0,
			minPaneWidth: 260.0,
			page: 0,
			paging: false,
			pagingST: false,
			paneClass,
			panes: [],
			selectionList: [],
			serverData: {},
			stateRead: false,
			updating: false
		};

		// Do not reinitialise if already initialised on table
		if (table.settings()[0]._searchPanes) {
			return;
		}

		this._getState();

		if (this.s.dt.page.info().serverSide) {
			// Listener to get the data into the server request before it is made
			this.s.dt.on('preXhr.dtsps', (e, settings, data) => {
				if (data.searchPanes === undefined) {
					data.searchPanes = {};
				}
				if (data.searchPanes_null === undefined) {
					data.searchPanes_null = {};
				}

				let src: string;
				for (let selection of this.s.selectionList) {
					src = this.s.dt.column(selection.column).dataSrc();

					if (data.searchPanes[src] === undefined) {
						data.searchPanes[src] = {};
					}
					if (data.searchPanes_null[src] === undefined) {
						data.searchPanes_null[src] = {};
					}

					for (let i = 0; i < selection.rows.length; i++) {
						data.searchPanes[src][i] = selection.rows[i];

						if (data.searchPanes[src][i] === null) {
							data.searchPanes_null[src][i] = true;
						}
					}
				}

				if (this.s.selectionList.length > 0) {
					data.searchPanesLast = src;
				}
			});
		}

		this._setXHR();

		table.settings()[0]._searchPanes = this;

		if (this.s.dt.settings()[0]._bInitComplete || fromPreInit) {
			this._paneDeclare(table, paneSettings, opts);
		}
		else {
			table.one('preInit.dtsps', () => {
				this._paneDeclare(table, paneSettings, opts);
			});
		}

		return this;
	}

	/**
	 * Clear the selections of all of the panes
	 */
	public clearSelections(): SearchPane[] {
		for (let pane of this.s.panes) {
			if (pane.s.dtPane) {
				pane.s.scrollTop = pane.s.dtPane.table().node().parentNode.scrollTop;
			}
		}
		// Load in all of the searchBoxes in the documents
		let searches = this.dom.container.find('.' + this.classes.search.replace(/\s+/g, '.'));

		// For each searchBox set the input text to be empty and then trigger
		// an input on them so that they no longer filter the panes
		searches.each(function() {
			$(this).val('').trigger('input');
		});

		// Clear the selectionList
		this.s.selectionList = [];

		let returnArray = [];

		for (let pane of this.s.panes) {
			if (pane.s.dtPane) {
				returnArray.push(pane.clearPane());
			}
		}

		return returnArray;
	}

	/**
	 * returns the container node for the searchPanes
	 */
	public getNode(): JQuery<HTMLElement> {
		return this.dom.container;
	}

	/**
	 * rebuilds all of the panes
	 */
	public rebuild(targetIdx: boolean | number = false, maintainSelection = false): SearchPane | SearchPane[] {
		this.dom.emptyMessage.detach();

		// As a rebuild from scratch is required, empty the searchpanes container.
		if (targetIdx === false) {
			this.dom.panes.empty();
		}

		// Rebuild each pane individually, if a specific pane has been selected then only rebuild that one
		let returnArray = [];

		for (let pane of this.s.panes) {
			if (targetIdx === false || pane.s.index === targetIdx) {
				pane.clearData();
				pane.rebuildPane(
					this.s.dt.page.info().serverSide ?
						this.s.serverData :
						undefined,
					maintainSelection
				);
				this.dom.panes.append(pane.dom.container);
				returnArray.push(pane);
			}
		}

		this._updateSelection();

		// Attach panes, clear buttons, and title bar to the document
		this._updateFilterCount();
		this._attachPaneContainer();
		this._initSelectionListeners(false);

		// If the selections are to be maintained, then it is safe to assume that paging is also to be maintained
		// Otherwise, the paging should be reset
		this.s.dt.draw(!maintainSelection);

		// Resize the panes incase there has been a change
		this.resizePanes();

		// If a single pane has been rebuilt then return only that pane
		return returnArray.length === 1 ? returnArray[0] : returnArray;
	}

	/**
	 * Resizes all of the panes
	 */
	public resizePanes(): SearchPanes {
		if (this.c.layout === 'auto') {
			let contWidth = $(this.s.dt.searchPanes.container()).width();
			let target = Math.floor(contWidth / this.s.minPaneWidth); // The neatest number of panes per row
			let highest = 1;
			let highestmod = 0;

			// Get the indexes of all of the displayed panes
			let dispIndex = [];

			for (let pane of this.s.panes) {
				if (pane.s.displayed) {
					dispIndex.push(pane.s.index);
				}
			}

			let displayCount = dispIndex.length;

			// If the neatest number is the number we have then use this.
			if (target === displayCount) {
				highest = target;
			}
			else {
				// Go from the target down and find the value with the most panes left over, this will be the best fit
				for (let ppr = target; ppr > 1; ppr--) {
					let rem = displayCount % ppr;

					if (rem === 0) {
						highest = ppr;
						highestmod = 0;
						break;
					}
					// If there are more left over at this amount of panes per row (ppr)
					// then it fits better so new values
					else if (rem > highestmod) {
						highest = ppr;
						highestmod = rem;
					}
				}
			}

			// If there is a perfect fit then none are to be wider
			let widerIndexes = highestmod !== 0 ? dispIndex.slice(dispIndex.length - highestmod, dispIndex.length) : [];

			this.s.panes.forEach(pane => {
				// Resize the pane with the new layout
				if (pane.s.displayed) {
					pane.resize('columns-' + (!widerIndexes.includes(pane.s.index) ? highest : highestmod));
				}
			});
		}
		else {
			for (let pane of this.s.panes) {
				pane.adjustTopRow();
			}
		}

		return this;
	}

	/**
	 * Holder method that is userd in SearchPanesST to set listeners that have an effect on other panes
	 * 
	 * @param isPreselect boolean to indicate if the preselect array is to override the current selection list.
	 */
	protected _initSelectionListeners(isPreselect: boolean): void {
		return;
	}

	/**
	 * Blank method that is overridden in SearchPanesST to retrieve the totals from the server data
	 */
	protected _serverTotals(): void {
		return;
	}

	/**
	 * Set's the xhr listener so that SP can extact appropriate data from the response
	 */
	protected _setXHR(): void {
		// We are using the xhr event to rebuild the panes if required due to viewTotal being enabled
		// If viewTotal is not enabled then we simply update the data from the server
		this.s.dt.on('xhr.dtsps', (e, settings, json) => {
			if (json && json.searchPanes && json.searchPanes.options) {
				this.s.serverData = json;
				this.s.serverData.tableLength = json.recordsTotal;
				this._serverTotals();
			}
		});
	}

	/**
	 * Set's the function that is to be performed when a state is loaded
	 *
	 * Overridden by the method in SearchPanesST
	 */
	protected _stateLoadListener(): void {
		this.s.dt.on('stateLoadParams.dtsps', (e, settings, data) => {
			if (data.searchPanes === undefined) {
				return;
			}
			this.clearSelections();
			// Set the selection list for the panes so that the correct
			// rows can be reselected and in the right order
			this.s.selectionList =
				data.searchPanes.selectionList ?
					data.searchPanes.selectionList :
					[];

			// Find the panes that match from the state and the actual instance
			if (data.searchPanes.panes) {
				for (let loadedPane of data.searchPanes.panes) {
					for (let pane of this.s.panes) {
						if (loadedPane.id === pane.s.index && pane.s.dtPane) {
							// Set the value of the searchbox
							pane.dom.searchBox.val(loadedPane.searchTerm);
							// Set the value of the order
							pane.s.dtPane.order(loadedPane.order);
						}
					}
				}
			}

			this._makeSelections(this.s.selectionList);
		});
	}

	/**
	 * Updates the selectionList when cascade is not in place
	 *
	 * Overridden in SearchPanesST
	 */
	protected _updateSelection(): void {
		this.s.selectionList = [];

		for (let pane of this.s.panes) {
			if (pane.s.dtPane) {
				let rows = pane.s.dtPane.rows({ selected: true }).data().toArray().map(el => el.filter);
				if(rows.length) {
					this.s.selectionList.push({
						column: pane.s.index,
						rows
					});
				}
			}
		}
	}

	/**
	 * Attach the panes, buttons and title to the document
	 */
	private _attach(): void {
		this.dom.titleRow
			.removeClass(this.classes.hide)
			.detach()
			.append(this.dom.title);

		// If the clear button is permitted attach it
		if (this.c.clear) {
			this.dom.clearAll
				.appendTo(this.dom.titleRow)
				.on('click.dtsps', () => this.clearSelections());
		}

		if (this.c.collapse) {
			this.dom.showAll.appendTo(this.dom.titleRow);
			this.dom.collapseAll.appendTo(this.dom.titleRow);
			this._setCollapseListener();
		}

		// Attach the container for each individual pane to the overall container
		for (let pane of this.s.panes) {
			this.dom.panes.append(pane.dom.container);
		}

		// Attach everything to the document
		this.dom.container
			.text('')
			.removeClass(this.classes.hide)
			.append(this.dom.titleRow)
			.append(this.dom.panes);

		// WORKAROUND
		this.s.panes.forEach(pane => pane.setListeners());

		if ($('div.' + this.classes.container).length === 0) {
			this.dom.container.prependTo(this.s.dt);
		}
	}

	/**
	 * If there are no panes to display then this method is called to either
	 * display a message in their place or hide them completely.
	 */
	private _attachMessage(): void {
		// Create a message to display on the screen
		let message: string;

		try {
			message = this.s.dt.i18n('searchPanes.emptyPanes', this.c.i18n.emptyPanes);
		}
		catch (error) {
			message = null;
		}

		// If the message is an empty string then searchPanes.emptyPanes is undefined,
		// therefore the pane container should be removed from the display
		if (message === null) {
			this.dom.container.addClass(this.classes.hide);
			this.dom.titleRow.removeClass(this.classes.hide);
			return;
		}

		// Otherwise display the message
		this.dom.container.removeClass(this.classes.hide);
		this.dom.titleRow.addClass(this.classes.hide);
		this.dom.emptyMessage.html(message).appendTo(this.dom.container);
	}

	/**
	 * Attaches the panes to the document and displays a message or hides if there are none
	 */
	protected _attachPaneContainer(): void {
		// If a pane is to be displayed then attach the normal pane output
		for (let pane of this.s.panes) {
			if (pane.s.displayed === true) {
				this._attach();
				return;
			}
		}

		// Otherwise attach the custom message or remove the container from the display
		this._attachMessage();
	}

	/**
	 * Checks which panes are collapsed and then performs relevant actions to the collapse/show all buttons
	 */
	private _checkCollapse(): void {
		let disableClose = true;
		let disableShow = true;

		for (let pane of this.s.panes) {
			if (pane.s.displayed) {
				// If the pane is not collapsed
				if (!pane.dom.collapseButton.hasClass(pane.classes.rotated)) {
					// Enable the collapse all button
					this.dom.collapseAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
					disableClose = false;
				}
				else {
					// Otherwise enable the show all button
					this.dom.showAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
					disableShow = false;
				}
			}
		}

		// If this flag is still true, no panes are open so the close button should be disabled
		if (disableClose) {
			this.dom.collapseAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
		}

		// If this flag is still true, no panes are closed so the show button should be disabled
		if (disableShow) {
			this.dom.showAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
		}
	}

	/**
	 * Attaches the message to the document but does not add any panes
	 */
	private _checkMessage(): void {
		// If a pane is to be displayed then attach the normal pane output
		for (let pane of this.s.panes) {
			if (pane.s.displayed === true) {
				// Ensure that the empty message is removed if a pane is displayed
				this.dom.emptyMessage.detach();
				this.dom.titleRow.removeClass(this.classes.hide);
				return;
			}
		}

		// Otherwise attach the custom message or remove the container from the display
		this._attachMessage();
	}

	/**
	 * Collapses all of the panes
	 */
	private _collapseAll(): void {
		for (let pane of this.s.panes) {
			pane.collapse();
		}
	}

	/**
	 * Finds a pane based upon the name of that pane
	 *
	 * @param name string representing the name of the pane
	 * @returns SearchPane The pane which has that name
	 */
	private _findPane(name: string): SearchPane {
		for (let pane of this.s.panes) {
			if (name === pane.s.name) {
				return pane;
			}
		}
	}

	/**
	 * Gets the selection list from the previous state and stores it in the selectionList Property
	 */
	private _getState(): void {
		let loadedFilter = this.s.dt.state.loaded();

		if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList) {
			this.s.selectionList = loadedFilter.searchPanes.selectionList;
		}
	}

	private _makeSelections(selectList) {
		for (let selection of selectList) {
			let pane: SearchPane;

			for (let p of this.s.panes) {
				if (p.s.index === selection.column) {
					pane = p;
					break;
				}
			}
			if (pane && pane.s.dtPane) {
				for (let j = 0; j < pane.s.dtPane.rows().data().toArray().length; j++) {
					if (
						selection.rows.includes(
							typeof pane.s.dtPane.row(j).data().filter === 'function' ?
								pane.s.dtPane.cell(j, 0).data():
								pane.s.dtPane.row(j).data().filter
						)
					) {
						pane.s.dtPane.row(j).select();
					}
				}
				pane.updateTable();
			}
		}
	}

	/**
	 * Declares the instances of individual searchpanes dependant on the number of columns.
	 * It is necessary to run this once preInit has completed otherwise no panes will be
	 * created as the column count will be 0.
	 *
	 * @param table the DataTable api for the parent table
	 * @param paneSettings the settings passed into the constructor
	 * @param opts the options passed into the constructor
	 */
	private _paneDeclare(table, paneSettings, opts: IDefaults): void {
		// Create Panes
		table
			.columns(this.c.columns.length > 0 ? this.c.columns : undefined)
			.eq(0)
			.each(idx => {
				this.s.panes.push(new this.s.paneClass(paneSettings, opts, idx, this.dom.panes));
			});

		// If there is any extra custom panes defined then create panes for them too
		let colCount = table.columns().eq(0).toArray().length;

		for (let i = 0; i < this.c.panes.length; i++) {
			let id = colCount + i;
			this.s.panes.push(new this.s.paneClass(paneSettings, opts, id, this.dom.panes, this.c.panes[i]));
		}

		// If a custom ordering is being used
		if (this.c.order.length > 0) {
			// Make a new Array of panes based upon the order
			this.s.panes = this.c.order.map(name => this._findPane(name));
		}

		// If this internal property is true then the DataTable has been initialised already
		if (this.s.dt.settings()[0]._bInitComplete) {
			this._startup(table);
		}
		else {
			// Otherwise add the paneStartup function to the list of functions
			// that are to be run when the table is initialised. This will garauntee that the
			// panes are initialised before the init event and init Complete callback is fired
			this.s.dt.settings()[0].aoInitComplete.push({
				fn: () => this._startup(table)
			});
		}
	}

	/**
	 * Sets the listeners for the collapse and show all buttons
	 * Also sets and performs checks on current panes to see if they are collapsed
	 */
	private _setCollapseListener(): void {
		this.dom.collapseAll.on('click.dtsps', () => {
			this._collapseAll();
			this.dom.collapseAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
			this.dom.showAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
			this.s.dt.state.save();
		});
		this.dom.showAll.on('click.dtsps', () => {
			this._showAll();
			this.dom.showAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
			this.dom.collapseAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
			this.s.dt.state.save();
		});

		for (let pane of this.s.panes) {
			// We want to make the same check whenever there is a collapse/expand
			pane.dom.collapseButton.on('click.dtsps', () => this._checkCollapse());
		}

		this._checkCollapse();
	}

	/**
	 * Shows all of the panes
	 */
	private _showAll(): void {
		for (let pane of this.s.panes) {
			pane.show();
		}
	}

	/**
	 * Initialises the tables previous/preset selections and initialises callbacks for events
	 *
	 * @param table the parent table for which the searchPanes are being created
	 */
	private _startup(table): void {
		// Attach clear button and title bar to the document
		this._attach();
		this.dom.panes.empty();

		for (let pane of this.s.panes) {
			pane.rebuildPane(Object.keys(this.s.serverData).length > 0 ? this.s.serverData : undefined);
			this.dom.panes.append(pane.dom.container);
		}

		// If the layout is set to auto then the panes need to be resized to their best fit
		if (this.c.layout === 'auto') {
			this.resizePanes();
		}

		let loadedFilter = this.s.dt.state.loaded();

		// Reset the paging if that has been saved in the state
		if (!this.s.stateRead && loadedFilter) {
			this.s.dt
				.page(loadedFilter.start / this.s.dt.page.len())
				.draw('page');
		}

		this.s.stateRead = true;
		this._checkMessage();

		// When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
		table.on('preDraw.dtsps', () => {
			// Check that the panes are not updating to avoid infinite loops
			// Also check that this draw is not due to paging
			if (!this.s.updating && !this.s.paging) {
				this._updateFilterCount();
				this._updateSelection();
			}

			// Paging flag reset - we only need to dodge the draw once
			this.s.paging = false;
		});

		$(window).on('resize.dtsps', dataTable.util.throttle(() => this.resizePanes()));

		// Whenever a state save occurs store the selection list in the state object
		this.s.dt.on('stateSaveParams.dtsps', (e, settings, data) => {
			if (data.searchPanes === undefined) {
				data.searchPanes = {};
			}
			data.searchPanes.selectionList = this.s.selectionList;
		});

		this._stateLoadListener();

		// Listener for paging on main table
		table.off('page.dtsps').on('page.dtsps', () => {
			this.s.paging = true;
			// This is an indicator to any selection tracking classes that paging has occured
			// It has to happen here so that we don't stack event listeners unnecessarily
			// The value is only ever set back to false in the SearchPanesST class
			// Equally it is never read in this class
			this.s.pagingST = true;
			this.s.page = this.s.dt.page();
		});

		if (this.s.dt.page.info().serverSide) {
			table.off('preXhr.dtsps').on('preXhr.dtsps', (e, settings, data) => {
				if (!data.searchPanes) {
					data.searchPanes = {};
				}
				if (!data.searchPanes_null) {
					data.searchPanes_null = {};
				}

				// Count how many filters are being applied
				let filterCount = 0;

				for (let pane of this.s.panes) {
					let src = this.s.dt.column(pane.s.index).dataSrc();

					if (!data.searchPanes[src]) {
						data.searchPanes[src] = {};
					}
					if (!data.searchPanes_null[src]) {
						data.searchPanes_null[src] = {};
					}

					if (pane.s.dtPane) {
						let rowData = pane.s.dtPane.rows({ selected: true }).data().toArray();

						for (let i = 0; i < rowData.length; i++) {
							data.searchPanes[src][i] = rowData[i].filter;

							if (!data.searchPanes[src][i]) {
								data.searchPanes_null[src][i] = true;
							}

							filterCount++;
						}
					}
				}

				// If there is a filter to be applied, then we need to read from the start of the result set
				// and set the paging to 0. This matches the behaviour of client side processing
				if (filterCount > 0) {
					// If the number of filters has changed we need to read from the start of the
					// result set and reset the paging
					if (filterCount !== this.s.filterCount) {
						data.start = 0;
						this.s.page = 0;
					}
					// Otherwise it is a paging request and we need to read from whatever the paging has been set to
					else {
						data.start = this.s.page * this.s.dt.page.len();
					}

					this.s.dt.page(this.s.page);
					this.s.filterCount = filterCount;
				}

				if (this.s.selectionList.length > 0) {
					data.searchPanesLast = this.s.dt
						.column(this.s.selectionList[this.s.selectionList.length - 1].column)
						.dataSrc();
				}
			});
		}
		else {
			table.on('preXhr.dtsps', () => this.s.panes.forEach(pane => pane.clearData()));
		}

		// If the data is reloaded from the server then it is possible that it has changed completely,
		// so we need to rebuild the panes
		this.s.dt.on('xhr.dtsps', (e, settings) => {
			if (settings.nTable !== this.s.dt.table().node()) {
				return;
			}

			if (!this.s.dt.page.info().serverSide) {
				let processing = false;
				this.s.dt.one('preDraw.dtsps', () => {
					if (processing) {
						return;
					}

					let page = this.s.dt.page();
					processing = true;
					this.s.updating = true;
					this.dom.panes.empty();

					for (let pane of this.s.panes) {
						pane.clearData(); // Clears all of the bins and will mean that the data has to be re-read
						// Pass a boolean to say whether this is the last choice made for maintaining selections
						// when rebuilding
						pane.rebuildPane(
							undefined,
							true
						);
						this.dom.panes.append(pane.dom.container);
					}

					if (!this.s.dt.page.info().serverSide) {
						this.s.dt.draw();
					}

					this.s.updating = false;
					this._updateSelection();
					this._checkMessage();

					this.s.dt.one('draw.dtsps', () => {
						this.s.updating = true;
						this.s.dt.page(page).draw(false);
						this.s.updating = false;
					});
				});
			}
		});

		// PreSelect any selections which have been defined using the preSelect option
		let selectList = this.c.preSelect;

		if (loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList) {
			selectList = loadedFilter.searchPanes.selectionList;
		}

		this._makeSelections(selectList);

		// Update the title bar to show how many filters have been selected
		this._updateFilterCount();

		// If the table is destroyed and restarted then clear the selections so that they do not persist.
		table.on('destroy.dtsps', () => {
			for (let pane of this.s.panes) {
				pane.destroy();
			}

			table.off('.dtsps');
			this.dom.showAll.off('.dtsps');
			this.dom.clearAll.off('.dtsps');
			this.dom.collapseAll.off('.dtsps');
			$(table.table().node()).off('.dtsps');
			this.dom.container.detach();
			this.clearSelections();
		});

		if (this.c.collapse) {
			this._setCollapseListener();
		}

		// When the clear All button has been pressed clear all of the selections in the panes
		if (this.c.clear) {
			this.dom.clearAll.on('click.dtsps', () => this.clearSelections());
		}

		table.settings()[0]._searchPanes = this;

		// This state save is required so that state is maintained over multiple refreshes if no actions are made
		this.s.dt.state.save();
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	protected _updateFilterCount(): void {
		let filterCount = 0;

		// Add the number of all of the filters throughout the panes
		for (let pane of this.s.panes) {
			if (pane.s.dtPane) {
				filterCount += pane.getPaneCount();
			}
		}

		// Run the message through the internationalisation method to improve readability
		this.dom.title.html(this.s.dt.i18n('searchPanes.title', this.c.i18n.title, filterCount));

		if (this.c.filterChanged && typeof this.c.filterChanged === 'function') {
			this.c.filterChanged.call(this.s.dt, filterCount);
		}

		if (filterCount === 0) {
			this.dom.clearAll.addClass(this.classes.disabledButton).attr('disabled', 'true');
		}
		else {
			this.dom.clearAll.removeClass(this.classes.disabledButton).removeAttr('disabled');
		}
	}
}
