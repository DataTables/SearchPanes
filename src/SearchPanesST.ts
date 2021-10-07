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
import { ISCV } from './panesType';
import SearchPanes from './SearchPanes';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default class SearchPanesST extends SearchPanes {

	public s: ISCV;

	public constructor(paneSettings, opts, fromPreInit = false) {
		super(paneSettings, opts, fromPreInit, SearchPaneViewTotal);

		this.s.dt.on('init', () => {
			this._initSelectionListeners();
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_updateSelection() {
		return;
	}

	private _initSelectionListeners() {
		this.s.selectionList = [];

		for (let pane of this.s.panes) {
			if (pane.s.displayed) {
				pane.s.dtPane
					.on('select.dtsp', e => this._updateSelectionList(e, pane))
					.on('deselect.dtsp', e => this._updateSelectionList(e, pane));
			}
		}
		this.s.dt.on('draw', e => this._updateSelectionList(e));
	}

	/**
	 * Updates the selection list to include the latest selections for a given pane
	 *
	 * @param index The index of the pane that is to be updated
	 * @param selected Which rows are selected within the pane
	 */
	private _updateSelectionList(e, paneIn = undefined) {
		let index;
		if(paneIn !== undefined) {
			let rows = paneIn.s.dtPane.rows({selected: true}).data().toArray();
			index = paneIn.s.index;
			this.s.selectionList = this.s.selectionList.filter(selection => selection.index !== index);
			if (rows.length > 0) {
				this.s.selectionList.push({
					index,
					rows
				});
			}
			else {
				index = this.s.selectionList.length > 0 ?
					this.s.selectionList[this.s.selectionList.length-1].index :
					undefined;
			}
		}

		if(this.s.updating) {
			return;
		}

		this.s.updating = true;
		let tempSelectionList = this.s.selectionList;
		let anotherFilter = false;
		this.clearSelections();
		this.s.dt.draw();
		if(this.s.dt.rows().toArray()[0].length > this.s.dt.rows({search: 'applied'}).toArray()[0].length) {
			anotherFilter = true;
		}
		this._remakeSelections(tempSelectionList);
		this.s.dt.draw();
		let filteringActive = false;

		let filterCount = 0;
		let prevSelectedPanes = 0;
		let selectedPanes = 0;
		// Add the number of all of the filters throughout the panes
		for (let pane of this.s.panes) {
			if (pane.s.dtPane) {
				filterCount += pane.getPaneCount();
				if (filterCount > prevSelectedPanes) {
					selectedPanes++;
					prevSelectedPanes = filterCount;
				}
			}
		}
		filteringActive = filterCount > 0;
		for(let pane of this.s.panes) {
			if(pane.s.displayed) {
				if (anotherFilter || (index !== undefined && pane.s.index !== index) || !filteringActive) {
					pane.s.filteringActive = filteringActive || anotherFilter;
				}
				else if (selectedPanes === 1) {
					pane.s.filteringActive = false;
				}
				pane.updateRows();
			}
		}
		this.s.updating = false;
	}

	private _remakeSelections(tempSelectionList) {
		for (let selection of tempSelectionList) {
			for (let pane of this.s.panes) {
				if (pane.s.index === selection.index) {
					pane.s.selections = selection.rows;
					for (let row of selection.rows) {
						pane.s.dtPane.row(row.index).select();
					}
				}
			}
		}
	}
}
