import { ISST } from './paneType';
import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneViewTotal extends SearchPaneST {

	public s: ISST;

	public constructor(paneSettings, opts, index, panesContainer, panes) {
		let override = {
			i18n: {
				countFiltered:'{shown} ({total})'
			}
		};
		super(paneSettings, $.extend(override, opts), index, panesContainer, panes);
	}

	/**
	 * Overrides the blank method in SearchPane to return the number of times a given value is currently being displayed
	 *
	 * @param filter The filter value
	 * @returns number - The number of times the value is shown
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getShown(filter) {
		return this.s.rowData.binsShown && this.s.rowData.binsShown[filter] ?
			this.s.rowData.binsShown[filter] :
			0;
	}

	/**
	 * Overrides the method from SearchPane to make it take no action
	 *
	 * @returns undefined
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getEmpties(): number {
		return undefined;
	}

	/**
	 * Gets the message that is to be used to indicate the count for each SearchPane row
	 *
	 * This method overrides _getMessage() in SearchPane and is overridden by SearchPaneCascadeViewTotal
	 *
	 * @param row The row object that is being processed
	 * @returns string - the message that is to be shown for the count of each entry
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getMessage(row: any) {
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
		let filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);
		return (this.s.filteringActive ? filteredMessage : countMessage)
			.replace(/{total}/g, row.total)
			.replace(/{shown}/g, row.shown);
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_serverPopulate(dataIn) {
		this.s.rowData.binsShown = {};
		if (dataIn.tableLength !== undefined) {
			this.s.tableLength = dataIn.tableLength;
			this.s.rowData.totalOptions = this.s.tableLength;
		}
		else if (this.s.tableLength === null || this.s.dt.rows()[0].length > this.s.tableLength) {
			this.s.tableLength = this.s.dt.rows()[0].length;
			this.s.rowData.totalOptions = this.s.tableLength;
		}

		let colTitle = this.s.dt.column(this.s.index).dataSrc();
		this.s.rowData.arrayFilter = [];

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

		let binLength: number = Object.keys(this.s.rowData.bins).length;
		let uniqueRatio: number = this._uniqueRatio(binLength, this.s.tableLength);

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

		this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
		this.s.rowData.binsOriginal = this.s.rowData.bins;

		this.s.displayed = true;

		if (this.s.dtPane) {
			let selected = this.s.serverSelect;
			this.s.dtPane.rows().remove();
			for(let data of this.s.rowData.arrayFilter) {
				let row = this.addRow(
					data.display,
					data.filter,
					data.sort,
					data.type
				);
				for(let i = 0; i < selected.length; i++) {
					let selection = selected[i];
					if(selection.filter === data.filter) {
						this.s.serverSelecting = true;
						row.select();
						this.s.serverSelecting = false;
						selected.splice(i, 1);
						this.s.selections.push(data.filter);
						break;
					}
				}
			}
			for (let selection of selected) {
				for(let data of this.s.rowData.arrayOriginal) {
					if(data.filter === selection.filter) {
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
			this.s.serverSelect = this.s.dtPane.rows({selected: true}).data().toArray();
			this.s.dtPane.draw();
		}
	}
}
