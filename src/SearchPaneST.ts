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
	 *
	 * SearchPaneCascade overrides this method
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

	/**
	 * Used when binning the data for a column
	 *
	 * @param rowIdx The current row that is to be added to the bins
	 * @param settings The datatables settings object
	 * @param bins The bins object that is to be incremented
	 */
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

	/**
	 * Populates the SearchPane based off of the data that has been recieved from the server
	 *
	 * This method overrides SearchPane's _serverPopulate() method
	 *
	 * @param dataIn The data that has been sent from the server
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_serverPopulate(dataIn): void {
		this.s.rowData.binsShown = {};
		this.s.rowData.arrayFilter = [];

		if (dataIn.tableLength !== undefined) {
			this.s.tableLength = dataIn.tableLength;
			this.s.rowData.totalOptions = this.s.tableLength;
		}
		else if (this.s.tableLength === null || this.s.dt.rows()[0].length > this.s.tableLength) {
			this.s.tableLength = this.s.dt.rows()[0].length;
			this.s.rowData.totalOptions = this.s.tableLength;
		}

		let colTitle = this.s.dt.column(this.s.index).dataSrc();

		// If there is SP data for this column add it to the data array and bin
		if (dataIn.searchPanes.options[colTitle] !== undefined) {
			for (let dataPoint of dataIn.searchPanes.options[colTitle]) {
				this.s.rowData.arrayFilter.push({
					display: dataPoint.label,
					filter: dataPoint.value,
					shown: +dataPoint.count,
					sort: dataPoint.label,
					total: +dataPoint.total,
					type: dataPoint.label
				});
				this.s.rowData.binsShown[dataPoint.value] = +dataPoint.count;
				this.s.rowData.bins[dataPoint.value] = +dataPoint.total;
			}
		}

		let binLength = Object.keys(this.s.rowData.bins).length;
		let uniqueRatio = this._uniqueRatio(binLength, this.s.tableLength);

		// Don't show the pane if there isnt enough variance in the data, or there is only 1 entry for that pane
		if (
			!this.s.colOpts.show &&
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

		// If the pane exists
		if (this.s.dtPane) {
			// Not the selections that have been made and remove all of the rows
			let selected = this.s.serverSelect;
			this.s.dtPane.rows().remove();

			// Add the rows that are to be shown into the pane
			for (let data of this.s.rowData.arrayFilter) {
				if (this._shouldAddRow(data)) {
					let row = this.addRow(
						data.display,
						data.filter,
						data.sort,
						data.type
					);

					// Select the row if it was selected before
					for (let i = 0; i < selected.length; i++) {
						let selection = selected[i];
						if (selection.filter === data.filter) {
							// This flag stops another request being made to the server
							this.s.serverSelecting = true;
							row.select();
							this.s.serverSelecting = false;

							// Remove the selection from the to select list and add it to the selected list
							selected.splice(i, 1);
							this.s.selections.push(data.filter);
							break;
						}
					}
				}
			}

			// Remake any selections that are no longer present
			for (let selection of selected) {
				for (let data of this.s.rowData.arrayOriginal) {
					if (data.filter === selection.filter) {
						let row = this.addRow(
							data.display,
							data.filter,
							data.sort,
							data.type
						);
						this.s.serverSelecting = true;
						row.select();
						this.s.serverSelecting = false;
						this.s.selections.push(data.filter);
					}
				}
			}

			// Store the selected rows
			this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
			// Update the pane
			this.s.dtPane.draw();
		}
	}

	/**
	 * Decides if a row should be added when being added from the server
	 *
	 * Overridden by SearchPaneCascade
	 *
	 * @param data the row data
	 * @returns boolean indicating if the row should be added or not
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_shouldAddRow(data) {
		return true;
	}
}
