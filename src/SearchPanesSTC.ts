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
import { ISC } from './panesType';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneCascadeViewTotal from './SearchPaneCascadeViewTotal';
import SearchPanes from './SearchPanes';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default class SearchPanesSTC extends SearchPanes {
	public s: ISC;

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
		if(this.s.updating) {
			return;
		}

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

		this._remakeSelections();
	}

	private _remakeSelections() {
		this.s.updating = true;
		let tmpSL = this.s.selectionList;
		this.clearSelections();
		this.s.dt.draw();
		this.s.selectionList = tmpSL;
		for(let pane of this.s.panes) {
			if (pane.s.displayed) {
				pane.updateRows();
			}
		}
		for(let selection of this.s.selectionList) {
			let pane = this.s.panes[selection.index];
			let ids = pane.s.dtPane.rows().indexes().toArray();
			for(let row of selection.rows) {
				for(let id of ids) {
					let currRow = pane.s.dtPane.row(id);
					let data = currRow.data();
					if (row.filter === data.filter) {
						currRow.select();
					}
				}
			}
			pane.s.selections = selection.rows;
			this.s.dt.draw();
			for(let currPane of this.s.panes) {
				if(currPane.s.displayed && currPane.s.index !== pane.s.index) {
					currPane.updateRows();
				}
			}
		}
		this.s.dt.draw();
		this.s.updating = false;
	}
}
