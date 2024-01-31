import { ISST } from './paneType';
import SearchPane from './SearchPane';

export default class SearchPaneST extends SearchPane {

	public s: ISST;
	public constructor(paneSettings, opts, index, panesContainer, panes) {
		super(paneSettings, opts, index, panesContainer, panes);
	}

	/**
	 * When server-side processing is enabled, SP will remove rows and then readd them,
	 * resulting in Select's reference to the last selected cell being lost.
	 * This function is provided to update that reference.
	 *
	 * @returns Function
	 */
	public _emptyPane() {
		let dt = this.s.dtPane;

		if (DataTable.versionCheck('2')) {
			let last = dt.select.last();
			let selectedIndex;

			if (last) {
				selectedIndex = dt.row(last.row).data().index;
			}

			dt.rows().remove();

			return function () {
				if (selectedIndex !== undefined) {
					let idx = dt.row((i, data) => data.index === selectedIndex).index();
					dt.select.last({row: idx, column: 0});
				}
			}
		}

		dt.rows().remove();

		return () => {};
	}

	/**
	 * Populates the SearchPane based off of the data that has been recieved from the server
	 *
	 * This method overrides SearchPane's _serverPopulate() method
	 *
	 * @param dataIn The data that has been sent from the server
	 */
	public _serverPopulate(dataIn: {[keys: string]: any}): void {
		let selection, row, data;

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
			let reselect = this._emptyPane();

			// Add the rows that are to be shown into the pane
			for (data of this.s.rowData.arrayFilter) {
				if (this._shouldAddRow(data)) {
					row = this.addRow(
						data.display,
						data.filter,
						data.sort,
						data.type
					);

					// Select the row if it was selected before
					for (let i = 0; i < selected.length; i++) {
						selection = selected[i];
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
			for (selection of selected) {
				for (data of this.s.rowData.arrayOriginal) {
					if (data.filter === selection.filter) {
						row = this.addRow(
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

			reselect();
		}
	}

	/**
	 * This method updates the rows and their data within the SearchPanes
	 *
	 * SearchPaneCascade overrides this method
	 */
	public updateRows(): void {
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
			this.s.dtPane
				.row(function (idx, data) {
					return data && (data.index === row.index);
				})
				.data(row);
		}

		// Show updates in the pane
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
	}

	/**
	 * Remove functionality from makeSelection - needs to be more advanced when tracking selections
	 */
	protected _makeSelection(): void {
		return;
	}

	/**
	 * Blank method to remove reloading of selected rows - needs to be more advanced when tracking selections
	 */
	protected _reloadSelect(): void {
		return;
	}

	/**
	 * Decides if a row should be added when being added from the server
	 *
	 * Overridden by SearchPaneCascade
	 *
	 * @param data the row data
	 * @returns boolean indicating if the row should be added or not
	 */
	protected _shouldAddRow(data): boolean {
		return true;
	}

	/**
	 * Updates the server selection list where appropriate
	 */
	protected _updateSelection(): void {
		if (this.s.dt.page.info().serverSide && !this.s.updating && !this.s.serverSelecting) {
			this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
		}
	}

	/**
	 * Used when binning the data for a column
	 *
	 * @param rowIdx The current row that is to be added to the bins
	 * @param settings The datatables settings object
	 * @param bins The bins object that is to be incremented
	 */
	protected _updateShown(rowIdx: number, settings, bins = this.s.rowData.binsShown): void {
		let orth = typeof this.s.colOpts.orthogonal === 'string'
			? this.s.colOpts.orthogonal
			: this.s.colOpts.orthogonal.search;

		let fastData = this.s.dt.settings()[0].fastData;
		let filter = fastData(rowIdx, this.s.index, orth);
		let add = (f) => {
			if (!bins[f]) {
				bins[f] = 1;
			}
			else {
				bins[f] ++;
			}
		};

		if (Array.isArray(filter)) {
			for (let f of filter) {
				add(f);
			}
		}
		else {
			add(filter);
		}
	}
}
