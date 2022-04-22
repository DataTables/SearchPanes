import SearchPaneST from './SearchPaneST';

let $;

export function setJQuery(jq) {
	$ = jq;
}

export default class SearchPaneCascade extends SearchPaneST {
	public constructor(paneSettings, opts, index, panesContainer, panes) {
		let override = {
			i18n: {
				count: '{shown}'
			}
		};
		super(paneSettings, $.extend(override, opts), index, panesContainer, panes);
	}

	/**
	 * This method updates the rows and their data within the SearchPanes
	 *
	 * This overrides the method in SearchPane
	 */
	public updateRows(): void {
		// Note the currently selected values in the pane and remove all of the rows
		let selected = this.s.dtPane.rows({selected: true}).data().toArray();

		if (
			this.s.colOpts.options ||
			this.s.customPaneSettings && this.s.customPaneSettings.options
		) {
			// If there are custom options set or it is a custom pane then get them
			this._getComparisonRows();

			let rows = this.s.dtPane.rows().toArray()[0];

			for (let i = 0; i < rows.length; i++) {
				let row = this.s.dtPane.row(rows[i]);
				let rowData = row.data();

				if(rowData === undefined) {
					continue;
				}

				if (rowData.shown === 0) {
					row.remove();
					rows = this.s.dtPane.rows().toArray()[0];
					i--;
					continue;
				}

				for(let selection of selected) {
					if(rowData.filter === selection.filter) {
						row.select();
						selected.splice(i, 1);
						this.s.selections.push(rowData.filter);
						break;
					}
				}
			}
		}
		else {
			if (!this.s.dt.page.info().serverSide) {
				// Get the latest count values from the table
				this._activePopulatePane();
				this.s.rowData.binsShown = {};

				for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
					this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
				}
			}

			this.s.dtPane.rows().remove();

			// Go over all of the rows that could be displayed
			for (let data of this.s.rowData.arrayFilter) {
				// Cascade - If there are no rows present in the table don't show the option
				if (data.shown === 0) {
					continue;
				}

				// Add the row to the pane
				let row = this.addRow(
					data.display,
					data.filter,
					data.sort,
					data.type,
					undefined
				);

				// Check if this row was selected
				for (let i = 0; i < selected.length; i++) {
					let selection = selected[i];

					if (selection.filter === data.filter) {
						row.select();
						// Remove the row from the to find list and then add it to the selections list
						selected.splice(i, 1);
						this.s.selections.push(data.filter);
						break;
					}
				}
			}

			// Add all of the rows that were previously selected but aren't any more
			for (let selection of selected) {
				for (let data of this.s.rowData.arrayOriginal) {
					if (data.filter === selection.filter) {
						let row = this.addRow(
							data.display,
							data.filter,
							data.sort,
							data.type,
							undefined
						);
						row.select();
						this.s.selections.push(data.filter);
					}
				}
			}
		}

		// Show updates in the pane
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;

		// If client side updated the tables results
		if (!this.s.dt.page.info().serverSide) {
			this.s.dt.draw();
		}
	}

	/**
	 * Fill the array with the values that are currently being displayed in the table
	 */
	protected _activePopulatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.bins = {};
		let settings = this.s.dt.settings()[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._populatePaneArray(index, this.s.rowData.arrayFilter, settings);
			}
		}
	}

	protected _getComparisonRows(): any[] {
		// Find the appropriate options depending on whether this is a pane for a specific column or a custom pane
		let options = this.s.colOpts.options
			? this.s.colOpts.options
			: this.s.customPaneSettings && this.s.customPaneSettings.options
				? this.s.customPaneSettings.options
				: undefined;

		if (options === undefined) {
			return;
		}

		let allRows = this.s.dt.rows();
		let shownRows = this.s.dt.rows({search: 'applied'});
		let tableValsTotal = allRows.data().toArray();
		let tableValsShown = shownRows.data().toArray();
		let rows = [];
		// Clear all of the other rows from the pane, only custom options are to be displayed when they are defined
		this.s.dtPane.clear();
		this.s.indexes = [];

		for (let comp of options) {
			// Initialise the object which is to be placed in the row
			let insert = comp.label !== '' ?
				comp.label :
				this.emptyMessage();
			let comparisonObj = {
				className: comp.className,
				display: insert,
				filter: typeof comp.value === 'function' ? comp.value : [],
				shown: 0,
				sort: insert,
				total: 0,
				type: insert
			};

			// If a custom function is in place
			if (typeof comp.value === 'function') {
				// Count the number of times the function evaluates to true for the original data in the Table
				for (let i = 0; i < tableValsTotal.length; i++) {
					if (comp.value.call(this.s.dt, tableValsTotal[i], allRows[0][i])) {
						comparisonObj.total++;
					}
				}

				for(let i = 0; i < tableValsShown.length; i++) {
					if(comp.value.call(this.s.dt, tableValsShown[i], shownRows[0][i])) {
						comparisonObj.shown++;
					}
				}

				// Update the comparisonObj
				if (typeof comparisonObj.filter !== 'function') {
					comparisonObj.filter.push(comp.filter);
				}
			}

			rows.push(this.addRow(
				comparisonObj.display,
				comparisonObj.filter,
				comparisonObj.sort,
				comparisonObj.type,
				comparisonObj.className,
				comparisonObj.total,
				comparisonObj.shown
			));
		}

		return rows;
	}

	/**
	 * Gets the message that is to be used to indicate the count for each SearchPane row
	 *
	 * This method overrides _getMessage() in SearchPane and is overridden by SearchPaneCascadeViewTotal
	 *
	 * @param row The row object that is being processed
	 * @returns string - the message that is to be shown for the count of each entry
	 */
	protected _getMessage(row: {[keys: string]: any}): string {
		return this.s.dt.i18n('searchPanes.count', this.c.i18n.count)
			.replace(/{total}/g, row.total)
			.replace(/{shown}/g, row.shown);
	}

	/**
	 * Overrides the blank method in SearchPane to return the number of times a given value is currently being displayed
	 *
	 * @param filter The filter value
	 * @returns number - The number of times the value is shown
	 */
	protected _getShown(filter: string): number {
		return this.s.rowData.binsShown && this.s.rowData.binsShown[filter] ?
			this.s.rowData.binsShown[filter] :
			0;
	}

	/**
	 * Decides if a row should be added when being added from the server
	 *
	 * Overrides method in by SearchPaneST
	 *
	 * @param data the row data
	 * @returns boolean indicating if the row should be added or not
	 */
	protected _shouldAddRow(data: {[keys: string]: any}): boolean {
		return data.shown > 0;
	}
}
