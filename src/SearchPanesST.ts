import { ISelectItem, ISVT } from './panesType';
import SearchPane from './SearchPane';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneCascadeViewTotal from './SearchPaneCascadeViewTotal';
import SearchPanes from './SearchPanes';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default class SearchPanesST extends SearchPanes {

	public s: ISVT;

	public constructor(paneSettings, opts, fromPreInit = false) {
		let paneClass;

		if (opts.cascadePanes && opts.viewTotal) {
			paneClass = SearchPaneCascadeViewTotal;
		}
		else if (opts.cascadePanes) {
			paneClass = SearchPaneCascade;
		}
		else if (opts.viewTotal) {
			paneClass = SearchPaneViewTotal;
		}

		super(paneSettings, opts, fromPreInit, paneClass);

		let loadedFilter = this.s.dt.state.loaded();

		let loadFn = () => this._initSelectionListeners(
			loadedFilter && loadedFilter.searchPanes && loadedFilter.searchPanes.selectionList ?
				loadedFilter.searchPanes.selectionList :
				this.c.preSelect
		);

		this.s.dt.off('init.dtsps').on('init.dtsps', loadFn);
	}

	/**
	 * Ensures that the correct selection listeners are set for selection tracking
	 *
	 * @param preSelect Any values that are to be preselected
	 */
	protected _initSelectionListeners(preSelect: ISelectItem[] = []): void {
		this.s.selectionList = preSelect;

		// Set selection listeners for each pane
		for (let pane of this.s.panes) {
			if (pane.s.displayed) {
				pane.s.dtPane
					.off('select.dtsp')
					.on('select.dtsp', this._update(pane))
					.off('deselect.dtsp')
					.on('deselect.dtsp', this._update(pane));
			}
		}

		// Update on every draw
		this.s.dt.off('draw.dtsps').on('draw.dtsps', this._update());

		// Also update right now as table has just initialised
		this._updateSelectionList();
	}

	/**
	 * Retrieve the total values from the server data
	 */
	protected _serverTotals(): void {
		for (let pane of this.s.panes) {
			if (pane.s.colOpts.show) {
				let colTitle = this.s.dt.column(pane.s.index).dataSrc();
				let blockVT = true;

				// If any of the counts are not equal to the totals filtering must be active
				for (let data of this.s.serverData.searchPanes.options[colTitle]) {
					if (data.total !== data.count) {
						blockVT = false;
						break;
					}
				}

				// Set if filtering is present on the pane and populate the data arrays
				pane.s.filteringActive = !blockVT;
				pane._serverPopulate(this.s.serverData);
			}
		}
	}

	/**
	 * Set's the function that is to be performed when a state is loaded
	 *
	 * Overrides the method in SearchPanes
	 */
	protected _stateLoadListener(): void {
		let stateLoadFunction = (e, settings, data) => {
			if (data.searchPanes === undefined) {
				return;
			}

			// Set the selection list for the panes so that the correct
			// rows can be reselected and in the right order
			this.s.selectionList =
				data.searchPanes.selectionList ?
					data.searchPanes.selectionList :
					[];

			// Find the panes that match from the state and the actual instance
			if (data.searchPanes.panes) {
				for (let loadedPane of data.searchPanes.panes) {
					for (let pane of this.s.panes) {
						if (loadedPane.id === pane.s.index) {
							// Set the value of the searchbox
							pane.dom.searchBox.val(loadedPane.searchTerm);
							// Set the value of the order
							pane.s.dtPane.order(loadedPane.order);
						}
					}
				}
			}

			this._updateSelectionList();
		};
		this.s.dt.off('stateLoadParams.dtsps', stateLoadFunction).on('stateLoadParams.dtsps', stateLoadFunction);
	}

	/**
	 * Remove the function's actions when using cascade
	 *
	 * Overrides the method in SearchPanes
	 */
	protected _updateSelection(): void {
		return;
	}

	/**
	 * Returns a function that updates the selection list based on a specific pane
	 *
	 * @param pane the pane that is to have it's selections loaded
	 */
	private _update(pane=undefined): () => void {
		return () => this._updateSelectionList(pane);
	}

	/**
	 * Updates the selection list to include the latest selections for a given pane
	 *
	 * @param index The index of the pane that is to be updated
	 * @param selected Which rows are selected within the pane
	 */
	private _updateSelectionList(paneIn = undefined): void {
		// Bail if any of these flags are set
		if (this.s.updating || paneIn && paneIn.s.serverSelecting) {
			return;
		}

		if (paneIn !== undefined) {
			if (this.s.dt.page.info().serverSide) {
				paneIn._updateSelection();
			}

			// Get filter values for all of the rows and the selections
			let rows = paneIn.s.dtPane.rows({selected: true}).data().toArray().map(el => el.filter);
			this.s.selectionList = this.s.selectionList.filter(selection => selection.column !== paneIn.s.index);

			if (rows.length > 0) {
				this.s.selectionList.push({
					column: paneIn.s.index,
					rows
				});
			}

			if (this.s.dt.page.info().serverSide) {
				this.s.dt.draw(false);
			}
		}

		this._remakeSelections();
	}

	/**
	 * Remake the selections that were present before new data or calculations have occured
	 */
	private _remakeSelections(): void {
		this.s.updating = true;

		if (!this.s.dt.page.info().serverSide) {
			let tmpSL = this.s.selectionList;
			let anotherFilter = false;
			this.clearSelections();
			this.s.dt.draw();

			// When there are no selections present if the length of the data does not match the searched data
			// then another filter is present
			if (this.s.dt.rows().toArray()[0].length > this.s.dt.rows({search: 'applied'}).toArray()[0].length) {
				anotherFilter = true;
			}

			this.s.selectionList = tmpSL;

			// Update the rows in each pane
			for (let pane of this.s.panes) {
				if (pane.s.displayed) {
					pane.s.filteringActive = anotherFilter;
					pane.updateRows();
				}
			}

			for (let selection of this.s.selectionList) {
				let pane = this.s.panes[selection.column];
				let ids = pane.s.dtPane.rows().indexes().toArray();

				// Select the rows that are present in the selection list
				for (let row of selection.rows) {
					for (let id of ids) {
						let currRow = pane.s.dtPane.row(id);
						let data = currRow.data();

						if (row === data.filter) {
							currRow.select();
						}
					}
				}

				pane.s.selections = selection.rows;

				// If there are no rows selected then don't bother continuing past here
				// Will just increase processing time and skew the rows that are shown in the table
				if (selection.rows.length === 0) {
					continue;
				}

				// Update the table to display the current results
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

				for (let currPane of this.s.panes) {
					if (currPane.s.displayed) {
						// Set the filtering active flag
						if (anotherFilter || pane.s.index !== currPane.s.index || !filteringActive) {
							currPane.s.filteringActive = filteringActive || anotherFilter;
						}
						else if (selectedPanes === 1) {
							currPane.s.filteringActive = false;
						}

						// Update the rows to show correct counts
						if (currPane.s.index !== pane.s.index) {
							currPane.updateRows();
						}
					}
				}
			}

			// Update table to show final search results
			this.s.dt.draw();
		}
		else {
			// Identify the last pane to have a change in selection
			let pane: SearchPaneCascade | SearchPaneCascadeViewTotal | SearchPaneViewTotal;
			if (this.s.selectionList.length > 0) {
				pane = this.s.panes[this.s.selectionList[this.s.selectionList.length-1].column];
			}

			// Update the rows of all of the other panes
			for (let currPane of this.s.panes) {
				if (currPane.s.displayed && (!pane || currPane.s.index !== pane.s.index)) {
					currPane.updateRows();
				}
			}
		}

		this.s.updating = false;
	}
}
