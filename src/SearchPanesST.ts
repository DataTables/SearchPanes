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
import { ISVT } from './panesType';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneCascadeViewTotal from './SearchPaneCascadeViewTotal';
import SearchPanes from './SearchPanes';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default class SearchPanesST extends SearchPanes {

	public s: ISVT;

	public constructor(paneSettings, opts, fromPreInit = false) {
		let paneClass;
		if(opts.cascadePanes && opts.viewTotal) {
			paneClass = SearchPaneCascadeViewTotal;
		}
		else if(opts.cascadePanes) {
			paneClass = SearchPaneCascade;
		}
		else if(opts.viewTotal) {
			paneClass = SearchPaneViewTotal;
		}
		super(paneSettings, opts, fromPreInit, paneClass);

		this.s.dt.on('init', () => this._initSelectionListeners(this.c.preSelect));
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_initSelectionListeners(preSelect) {
		this.s.selectionList = preSelect;

		for (let pane of this.s.panes) {
			if (pane.s.displayed) {
				pane.s.dtPane
					.on('select.dtsp', () => this._updateSelectionList(pane))
					.on('deselect.dtsp', () => this._updateSelectionList(pane));
			}
		}
		this.s.dt.on('draw', () => this._updateSelectionList());

		this._updateSelectionList();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_updateSelection() {
		return;
	}

	/**
	 * Updates the selection list to include the latest selections for a given pane
	 *
	 * @param index The index of the pane that is to be updated
	 * @param selected Which rows are selected within the pane
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_updateSelectionList(paneIn = undefined) {
		if(this.s.updating) {
			return;
		}

		let index;
		if(paneIn !== undefined) {
			let rows = paneIn.s.dtPane.rows({selected: true}).data().toArray().map(el => el.filter);
			index = paneIn.s.index;
			this.s.selectionList = this.s.selectionList.filter(selection => selection.column !== index);
			if (rows.length > 0) {
				this.s.selectionList.push({
					column: index,
					rows
				});
			}
			else {
				index = this.s.selectionList.length > 0 ?
					this.s.selectionList[this.s.selectionList.length-1].column :
					undefined;
			}
		}

		this._remakeSelections();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_remakeSelections() {
		this.s.updating = true;
		let tmpSL = this.s.selectionList;
		let anotherFilter = false;
		this.clearSelections();
		this.s.dt.draw();
		if(this.s.dt.rows().toArray()[0].length > this.s.dt.rows({search: 'applied'}).toArray()[0].length) {
			anotherFilter = true;
		}
		this.s.selectionList = tmpSL;
		for(let pane of this.s.panes) {
			if (pane.s.displayed) {
				pane.s.filteringActive = anotherFilter;
				pane.updateRows();
			}
		}
		for(let selection of this.s.selectionList) {
			let pane = this.s.panes[selection.column];
			let ids = pane.s.dtPane.rows().indexes().toArray();
			for(let row of selection.rows) {
				for(let id of ids) {
					let currRow = pane.s.dtPane.row(id);
					let data = currRow.data();
					if (row === data.filter) {
						currRow.select();
					}
				}
			}
			pane.s.selections = selection.rows;
			this.s.dt.draw();
			let filteringActive = false;

			let filterCount = 0;
			let prevSelectedPanes = 0;
			let selectedPanes = 0;
			// Add the number of all of the filters throughout the panes
			for (let currPane of this.s.panes) {
				if (currPane.s.dtPane) {
					filterCount += currPane.getPaneCount();
					if (filterCount > prevSelectedPanes) {
						selectedPanes++;
						prevSelectedPanes = filterCount;
					}
				}
			}
			filteringActive = filterCount > 0;
			for(let currPane of this.s.panes) {
				if(currPane.s.displayed) {
					if (anotherFilter || pane.s.index !== currPane.s.index || !filteringActive) {
						currPane.s.filteringActive = filteringActive || anotherFilter;
					}
					else if (selectedPanes === 1) {
						currPane.s.filteringActive = false;
					}
					if(currPane.s.index !== pane.s.index) {
						currPane.updateRows();
					}
				}
			}
		}
		this.s.dt.draw();
		this.s.updating = false;
	}
}
