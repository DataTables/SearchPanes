
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
			title: 'dtsp-title',
		},
		panes: 'dtsp-panesContainer',
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
		displayColumns: 3,
	};

	public classes;
	public dom;
	public c;
	public s;
	public panes;

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

		// Add extra elements to DOM object including clear and hide buttons
		this.dom = {
			clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
			container: $('<div/>').addClass(this.classes.panes),
			options: $('<div/>').addClass(this.classes.container),
			panes: $('<div/>').addClass(this.classes.container),
			title: $('<div/>').addClass(this.classes.title),
		};

		this.s = {
			colOpts: [],
			dt: table,
		};

		table.settings()[0]._searchPanes = this;

		this.dom.clearAll[0].innerHTML = table.i18n('searchPanes.clearMessage', 'Clear All');

		// Create Panes
		table
			.columns(this.c.columns)
			.eq(0)
			.each((idx) => {
				this.panes.push(new SearchPane(paneSettings, opts, idx, this.c.displayColumns));
			});

		// If there is any extra custom panes defined then create panes for them too
		let rowLength = table.columns().eq(0).toArray().length;
		if (this.c.panes !== undefined) {
			let paneLength = this.c.panes.length;
			for (let i = 0; i < paneLength; i++) {
				let id = rowLength + i;
				this.panes.push(new SearchPane(paneSettings, opts, id, this.c.displayColumns, this.c.panes[i]));
			}
		}

		// PreSelect any selections which have been defined using the preSelect option
		table
			.columns(this.c.columns)
			.eq(0)
			.each((idx) => {
				if (this.panes[idx].s.dtPane !== undefined && this.panes[idx].s.colOpts.preSelect !== undefined) {
					let tableLength = this.panes[idx].s.dtPane.rows().data().toArray().length;
					for (let i = 0; i < tableLength; i++) {
						if (this.panes[idx].s.colOpts.preSelect.indexOf(this.panes[idx].s.dtPane.cell(i, 0).data()) !== -1) {
							this.panes[idx].s.dtPane.row(i).select();
							this.panes[idx]._updateTable(true);
						}
					}
				}
			});

		// Attach panes, clear buttons, hide button and title bar to the document
		this._updateFilterCount();
		this._attach();

		(DataTable as any).tables({visible: true, api: true}).columns.adjust();

		// Update the title bar to show how many filters have been selected
		this.panes[0]._updateFilterCount();

		// When a draw is called on the DataTable, update all of the panes incase the data in the DataTable has changed
		let initDraw = true;
		table.on('draw.dt', (e, settings, data) => {
			this._updateFilterCount();
			if (initDraw) {
				initDraw = false;
			}
			else {
				if (this.c.cascadePanes || this.c.viewTotal) {
					this.redrawPanes();
				}
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
	 * Call the adjust function for all of the panes
	 */
	public adjust() {
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				pane.adjust();
			}
		}
	}

	public redrawPanes() {
		let table = this.s.dt;
		if (!this.s.updating) {
			let filterActive = true;
			if (table.rows({search: 'applied'}).data().toArray().length === table.rows().data().toArray().length) {
				filterActive = false;
			}
			for (let pane of this.panes) {
				if (pane.s.dtPane !== undefined) {
					pane._updatePane(false, filterActive, true);
				}
			}
			this._updateFilterCount();
		}
	}

	/**
	 * Clear the selections of all of the panes
	 */
	public clearSelections() {
		let searches = document.getElementsByClassName('dtsp-search');
		for(let i = 0; i< searches.length; i++){
			$(searches[i]).val('');
			$(searches[i]).trigger('input');
		}
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				pane.clearPane();
			}
		}
	}

	/**
	 * returns the container node for the searchPanes
	 */
	public getNode() {
		return this.dom.container;
	}

	/**
	 * rebuilds all of the panes
	 */
	public rebuild(targetIdx = false) {
		this.dom.container.empty();
		for (let pane of this.panes) {
			if (targetIdx !== false && pane.s.index !== targetIdx) {
				continue;
			}
			pane.rebuildPane();
		}
		// Attach panes, clear buttons, hide button and title bar to the document
		this._updateFilterCount();
		this._attach();

		(DataTable as any).tables({visible: true, api: true}).columns.adjust();

		// Update the title bar to show how many filters have been selected
		this.panes[0]._updateFilterCount();
	}

	/**
	 * repopulates the desired pane by extracting new data from the table. faster than doing a rebuild
	 * @param callerIndex the index of the pane to be rebuilt
	 */
	public repopulatePane(callerIndex) {
		this.panes[callerIndex].repopulatePane();
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	private _updateFilterCount() {
		let filterCount = 0;
		for (let pane of this.panes) {
			if (pane.s.dtPane !== undefined) {
				filterCount += pane._updateFilterCount();
			}
		}
		let message = this.s.dt.i18n('searchPanes.title', 'Filters Active - %d', filterCount);
		this.dom.title[0].innerHTML = (message);
		this.c.filterChanged(filterCount);
	}

	/**
	 * Attach the panes, buttons and title to the document
	 */
	private _attach() {
		let titleRow = $('<div/>');
		titleRow.addClass(this.classes.titleRow);
		$(this.dom.title).appendTo(titleRow);
		// If the hide button is permitted attach it
		if (this.c.clear) {
			$(this.dom.clearAll).appendTo(titleRow);
		}
		$(titleRow).appendTo(this.dom.container);
		for (let pane of this.panes) {
			$(pane.dom.container).appendTo(this.dom.panes);
		}
		$(this.dom.panes).appendTo(this.dom.container);
	}
}
