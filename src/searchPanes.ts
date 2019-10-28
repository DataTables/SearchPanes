
let DataTable = $.fn.dataTable;
namespace DataTables {
	interface IStaticFunctions {
		select: any;
	}
}
import SearchPane from './searchPane';
export default class SearchPanes {

	private static version = '0.0.2';

	private static classes = {
		arrayCols: [],
		clear: 'dtsp-clear',
		clearAll: 'dtsp-clearAll',
		container: 'dtsp-searchPanes',
		hide: 'dtsp-hidden',
		item: {
			count: 'dtsp-count',
			label: 'dtsp-label',
			selected: 'dtsp-selected'
		},
		pane: {
			active: 'dtsp-filtering',
			container: 'dtsp-pane',
			scroller: 'dtsp-scroller',
			title: 'dtsp-title',
		},
		panes: 'dtsp-panesContainer',
		search: 'dtsp-search',
		title: 'dtsp-title',
		titleRow: 'dtsp-titleRow'
	};

	// Define SearchPanes default options
	private static defaults = {
		clear: true,
		container(dt) {
			return dt.table().container();
		},
		columns: undefined,
		filterChanged() {
			return;
		},
		layout: 'columns-3',
	};

	public classes;
	public dom;
	public c;
	public s;
	public panes;
	public selectionList = [];
	public regenerating = false;

	constructor(paneSettings, opts) {
		// Check that the required version of DataTables is included
		if (! DataTable || ! DataTable.versionCheck || ! DataTable.versionCheck('1.10.0')) {
			throw new Error('SearchPane requires DataTables 1.10 or newer');
		}

		// Check that Select is included
		if (! (DataTable as any).select) {
			throw new Error('SearchPane requires Select');
		}

		let table = new DataTable.Api(paneSettings);
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
			wrapper: $('<div/>'),
		};

		this.s = {
			colOpts: [],
			dt: table,
		};

		table.settings()[0]._searchPanes = this;
		this.dom.clearAll[0].innerHTML = table.i18n('searchPanes.clearMessage', 'Clear All');

		if (this.s.dt.settings()[0]._bInitComplete) {
			this._startup(table, paneSettings, opts);
		}
		else {
			this.s.dt.one('init', () => {
				this._startup(table, paneSettings, opts);
			});
		}
	}

	/**
	 * Call the adjust function for all of the panes
	 */
	public adjust(): void {
		// Adjust the width of the columns for all of the panes where the table is defined
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				pane.adjust();
			}
		}
	}

	/**
	 * Clear the selections of all of the panes
	 */
	public clearSelections(): any[] {
		// Load in all of the searchBoxes in the documents
		let searches = document.getElementsByClassName(this.classes.search);

		// For each searchBox set the input text to be empty and then trigger
		//  an input on them so that they no longer filter the panes
		for (let i = 0; i < searches.length; i++) {
			$(searches[i]).val('');
			$(searches[i]).trigger('input');
		}

		let returnArray = [];
		// For every pane, clear the selections in the pane
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				returnArray.push(pane._clearPane());
			}
		}
		return returnArray;
	}

	/**
	 * returns the container node for the searchPanes
	 */
	public getNode(): Node {
		return this.dom.container;
	}

	/**
	 * rebuilds all of the panes
	 */
	public rebuild(targetIdx = false): SearchPane | SearchPane[] {
		// As a rebuild from scratch is required, empty the searchpanes container.
		this.dom.container.empty();
		let returnArray: SearchPane[] = [];

		// Rebuild each pane individually, if a specific pane has been selected then only rebuild that one
		for (let pane of this.panes) {
			if (targetIdx !== false && pane.s.index !== targetIdx) {
				continue;
			}

			returnArray.push(pane.rebuildPane());
		}

		// Attach panes, clear buttons, and title bar to the document
		this._updateFilterCount();
		this._attachPaneContainer();

		(DataTable as any).tables({visible: true, api: true}).columns.adjust();

		// Update the title bar to show how many filters have been selected
		this.panes[0]._updateFilterCount();

		// If a single pane has been rebuilt then return only that pane
		if (returnArray.length === 1) {
			return returnArray[0];
		}
		// Otherwise return all of the panes that have been rebuilt
		else {
			return returnArray;
		}
	}

	/**
	 * Redraws all of the panes
	 */
	public redrawPanes(): void {
		let table = this.s.dt;

		// Only do this if the redraw isn't being triggered by the panes updating themselves
		if (!this.s.updating) {
			let filterActive = true;

			// If the number of rows currently visible is equal to the number of rows in the table
			//  then there can't be any filtering taking place
			if (table.rows({search: 'applied'}).data().toArray().length === table.rows().data().toArray().length) {
				filterActive = false;
				this.selectionList = [];
			}

			// Update every pane with a table defined
			let select = false;
			let deselectIdx;
			let newSelectionList = [];

			// Don't run this if it is due to the panes regenerating
			if (!this.regenerating) {
				for (let pane of this.panes) {
					// Identify the pane where a selection or deselection has been made and add it to the list.
					if (pane.s.selectPresent) {
						this.selectionList.push({index: pane.s.index, rows: pane.s.dtPane.rows({selected: true}).data().toArray()});
						select = true;
						break;
					}
					else if (pane.s.deselect) {
						deselectIdx = pane.s.index;
					}
				}

				// Remove selections from the list from the pane where a deselect has taken place
				for (let selection of this.selectionList) {
					if (selection.index !== deselectIdx) {
						newSelectionList.push(selection);
					}
				}

				// Update all of the panes to reflect the current state of the filters
				for (let pane of this.panes) {
					if (pane.s.dtPane !== undefined) {
						pane._updatePane(select, filterActive, true);
					}
				}

				// Update the label that shows how many filters are in place
				this._updateFilterCount();

				// If the length of the selections are different then some of them have been removed and a deselect has occured
				if (newSelectionList.length > 0 && newSelectionList.length < this.selectionList.length) {
					// Set this to true so that the actions taken do not cause this to run until it is finished
					this.regenerating = true;

					// Load in all of the searchBoxes in the documents
					let searches = document.getElementsByClassName(this.classes.search);

					// For each searchBox set the input text to be empty and then trigger
					//  an input on them so that they no longer filter the panes
					for (let i = 0; i < searches.length; i++) {
						$(searches[i]).val('');
						$(searches[i]).trigger('input');
					}

					// Let the pane know that a cascadeRegen is taking place to avoid unexpected behaviour
					//  and clear all of the previous selections in the pane
					for (let pane of this.panes) {
						pane.setCascadeRegen(true);

						if (pane.s.dtPane !== undefined) {
							pane._clearPane();
						}
					}

					// Remake Selections
					this._makeCascadeSelections(newSelectionList);

					// Set the selection list property to be the list without the selections from the deselect pane
					this.selectionList = newSelectionList;

					// The regeneration of selections is over so set it back to false
					for (let pane of this.panes) {
						pane.setCascadeRegen(false);
					}

					this.regenerating = false;
				}
				else {
					// Update all of the other panes as you would just making a normal selection
					for (let paneUpdate of this.panes) {
						if (paneUpdate.s.dtPane !== undefined) {
							paneUpdate._updatePane(true, filterActive, true);
						}
					}
				}
			}
			else {
				for (let pane of this.panes) {
					if (pane.s.dtPane !== undefined) {
						pane._updatePane(select, filterActive, true);
					}
				}

				// Update the label that shows how many filters are in place
				this._updateFilterCount();
			}
		}
	}

	private _makeCascadeSelections(newSelectionList) {
		// make selections in the order they were made previously, excluding those from the pane where a deselect was made
		for (let selection of newSelectionList) {
			for (let pane of this.panes) {
				if (pane.s.index === selection.index && pane.s.dtPane !== undefined) {
					// select each row previously selected in the pane
					let rowList = pane.s.dtPane.rows().toArray();

					for (let row of selection.rows) {
						for (let rowPoss of rowList[0]) {
							if (pane.s.dtPane.row(rowPoss).data().index === row.index) {
								pane.s.dtPane.row(rowPoss).select();
								break;
							}
						}

						if (this.c.viewTotal) {
							// Update the label that shows how many filters are in place
							this._updateFilterCount();
						}
					}
				}
			}
		}
	}

	/**
	 * Attach the panes, buttons and title to the document
	 */
	private _attach(): Node {
		$(this.dom.container).removeClass(this.classes.hide);
		let titleRow = $('<div/>').addClass(this.classes.titleRow);
		$(this.dom.title).appendTo(titleRow);

		// If the clear button is permitted attach it
		if (this.c.clear) {
			$(this.dom.clearAll).appendTo(titleRow);
		}

		$(titleRow).appendTo(this.dom.container);

		// Attach the container for each individual pane to the overall container
		for (let pane of this.panes) {
			$(pane.dom.container).appendTo(this.dom.panes);
		}

		// Attach everything to the document
		$(this.dom.panes).appendTo(this.dom.container);
		if ($('div.' + this.classes.container).length === 0) {
			$(this.dom.container).prependTo(this.s.dt);
		}
		return this.dom.container;
	}

	/**
	 * If there are no panes to display then this method is called to either
	 *   display a message in their place or hide them completely.
	 */
	private _attachMessage(): Node {
		// Create a message to display on the screen
		let emptyMessage = $('<div/>');
		let message;

		try {
			message = this.s.dt.i18n('searchPanes.emptyPanes', 'No SearchPanes');
		}
		catch (error) {
			message = null;
		}

		// If the message is an empty string then searchPanes.emptyPanes is undefined,
		//  therefore the pane container should be removed from the display
		if (message === null) {
			$(this.dom.container).empty().addClass(this.classes.hide);
			return;
		}
		else {
			$(this.dom.container).removeClass(this.classes.hide);
		}

		// Otherwise display the message
		emptyMessage[0].innerHTML = message;
		$(this.dom.container).empty();
		emptyMessage.appendTo(this.dom.container);
		return this.dom.container;
	}

	/**
	 * Attaches the panes to the document and displays a message or hides if there are none
	 */
	private _attachPaneContainer(): Node {

		// If a pane is to be displayed then attach the normal pane output
		if (this.panes !== undefined) {
			for (let pane of this.panes) {
				if (pane.displayed === true) {
					return this._attach();
					break;
				}
			}
		}
		// Otherwise attach the custom message or remove the container from the display
		return this._attachMessage();
	}

	private _startup(table, paneSettings, opts) {
		// Create Panes
		table
		.columns(this.c.columns)
		.eq(0)
		.each((idx) => {
			this.panes.push(new SearchPane(paneSettings, opts, idx, this.c.layout));
		});

		// If there is any extra custom panes defined then create panes for them too
		let rowLength = table.columns().eq(0).toArray().length;

		if (this.c.panes !== undefined) {
			let paneLength = this.c.panes.length;

			for (let i = 0; i < paneLength; i++) {
				let id = rowLength + i;
				this.panes.push(new SearchPane(paneSettings, opts, id, this.c.layout, this.c.panes[i]));
			}
		}

		// PreSelect any selections which have been defined using the preSelect option
		table
		.columns(this.c.columns)
		.eq(0)
		.each((idx) => {
			if (
				this.panes[idx] !== undefined &&
				this.panes[idx].s.dtPane !== undefined &&
				this.panes[idx].s.colOpts.preSelect !== undefined
			) {
				let tableLength = this.panes[idx].s.dtPane.rows().data().toArray().length;

				for (let i = 0; i < tableLength; i++) {
					if (this.panes[idx].s.colOpts.preSelect.indexOf(this.panes[idx].s.dtPane.cell(i, 0).data()) !== -1) {
						this.panes[idx].s.dtPane.row(i).select();
						this.panes[idx]._updateTable(true);
					}
				}
			}
		});

		// Attach panes, clear buttons, and title bar to the document
		this._updateFilterCount();
		this._attachPaneContainer();

		// (DataTable as any).tables({visible: true, api: true}).columns.adjust();
		table.columns(this.c.columns).eq(0).each((idx) => {
		if (this.panes[idx] !== undefined && this.panes[idx].s.dtPane !== undefined) {
			this.panes[idx].s.dtPane.columns.adjust();
		}
		});

		// Update the title bar to show how many filters have been selected
		this.panes[0]._updateFilterCount();

		// When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
		table.on('draw.dt', () => {
			this._updateFilterCount();

			if (this.c.cascadePanes || this.c.viewTotal) {
				this.redrawPanes();
			}
		});

		// When the clear All button has been pressed clear all of the selections in the panes
		if (this.c.clear) {
			this.dom.clearAll[0].addEventListener('click', () => {
				this.clearSelections();
			});
		}

		table.settings()[0]._searchPanes = this;
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	private _updateFilterCount(): void {
		let filterCount = 0;

		// Add the number of all of the filters throughout the panes
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				filterCount += pane._updateFilterCount();
			}
		}

		// Run the message through the internationalisation method to improve readability
		let message = this.s.dt.i18n('searchPanes.title', 'Filters Active - %d', filterCount);
		this.dom.title[0].innerHTML = (message);
		this.c.filterChanged(filterCount);
	}
}
