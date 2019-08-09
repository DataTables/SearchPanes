
let DataTable = $.fn.dataTable;
namespace DataTables {
	interface IStaticFunctions {
		select: any;
	}
}
import SearchPane from './searchPane';
export default class SearchPanes {

	private static version = '0.0.2';

	private static class = {
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
			title: 'title',
		},
		panes: 'panes',
		title: 'dtsp-title',
	};

	// Define SearchPanes default options
	private static defaults = {
		clear: true,
		container(dt) {
			return dt.table().container();
		},
		columns: undefined,
		filterChanged(){},
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
		this.classes = $.extend(true, {}, SearchPanes.class);

		// Add extra elements to DOM object including clear and hide buttons
		this.dom = {
			clearAll: $('<button type="button">Clear All</button>').addClass(this.classes.clearAll),
			container: $('<div/>').addClass(this.classes.panes),
			options: $('<div/>').addClass(this.classes.container),
			panes: $('<div/>').addClass(this.classes.container),
			title: $('<div/>').addClass(this.classes.title),
		};

		// Get options from user
		this.c = $.extend(true, {}, SearchPanes.defaults, opts);

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
				this.panes.push(new SearchPane(paneSettings, opts, idx));
			});

		// If there is any extra custom panes defined then create panes for them too
		let rowLength = table.columns().eq(0).toArray().length;
		if (this.c.panes !== undefined) {
			let paneLength = this.c.panes.length;
			for (let i = 0; i < paneLength; i++) {
				let id = rowLength + i;
				this.panes.push(new SearchPane(paneSettings, opts, id));
			}
		}

		// PreSelect any selections which have been defined using the preSelect option
		table
			.columns(this.c.columns)
			.eq(0)
			.each((idx) => {
				if (this.panes[idx].s.colOpts.preSelect !== undefined) {
					for (let i = 0; i < this.panes[idx].s.dtPane.rows().data().toArray().length; i++) {
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
		table.on('draw.dt', (e, settings, data) => {
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

	/**
	 * Clear the selections of all of the panes
	 */
	public clearSelections() {
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
	public rebuild() {
		this.dom.container.empty();
		for (let pane of this.panes) {
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
		// $(this.dom.options).appendTo(this.dom.container);
		$(this.dom.title).appendTo(this.dom.container);
		// If the hide button is permitted attach it
		if (this.c.clear) {
			$(this.dom.clearAll).appendTo(this.dom.container);
		}
		for (let pane of this.panes) {
			$(pane.dom.container).appendTo(this.dom.panes);
		}
		$(this.dom.panes).appendTo(this.dom.container);
	}
}
