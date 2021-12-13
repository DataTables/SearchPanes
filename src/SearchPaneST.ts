import { ISST } from './paneType';
import SearchPane from './SearchPane';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneST extends SearchPane {

	public s: ISST;
	public constructor(paneSettings, opts, index, panesContainer, panes) {
		super(paneSettings, opts, index, panesContainer, panes);
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_makeSelection() {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_reloadSelect(): void {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_updateSelection() {
		if (this.s.dt.page.info().serverSide && !this.s.updating) {
			if (!this.s.serverSelecting) {
				this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
			}
		}
	}

	/**
	 * This method updates the rows and their data within the SearchPanes
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	updateRows() {
		if (!this.s.dt.page.info().serverSide) {
			// Get the latest count values from the table
			this.s.rowData.binsShown = {};
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
			}
		}

		// Update the rows data to show the current counts
		for (let row of this.s.dtPane.rows().data().toArray()) {
			row.shown = typeof this.s.rowData.binsShown[row.filter] === 'number' ?
				this.s.rowData.binsShown[row.filter] :
				0;
			this.s.dtPane.row(row.index).data(row);
		}

		// Show updates in the pane
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_updateShown(rowIdx: number, settings, bins = this.s.rowData.binsShown) {
		let filter = settings.oApi._fnGetCellData(settings, rowIdx, this.s.index, this.s.colOpts.orthogonal.search);

		if (!bins[filter]) {
			bins[filter] = 1;
		}
		else {
			bins[filter] ++;
		}
	}
}
