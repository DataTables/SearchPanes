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
	 * Get's the pane config appropriate to this class
	 *
	 * @returns The config needed to create a pane of this type
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getPaneConfig() {
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
		let filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);
		let haveScroller = (dataTable as any).Scroller;

		return {
			columnDefs: [
				{
					className: 'dtsp-nameColumn',
					data: 'display',
					render: (data, type, row) => {
						if (type === 'sort') {
							return row.sort;
						}
						else if (type === 'type') {
							return row.type;
						}

						if(row.filter === 'Ishmael') {
							console.log(row)
						}

						// console.log(row.filter, this.s.filteringActive)
						let message = (
							this.s.filteringActive ?
								filteredMessage.replace(/{total}/, row.total):
								countMessage.replace(/{total}/, row.total)
						)
							.replace(/{shown}/, row.shown);


						while (message.includes('{total}')) {
							message = message.replace(/{total}/, row.total);
						}

						while (message.includes('{shown}')) {
							message = message.replace(/{shown}/, row.shown);
						}

						// We are displaying the count in the same columne as the name of the search option.
						// This is so that there is not need to call columns.adjust()
						//  which in turn speeds up the code
						let pill = '<span class="' + this.classes.pill + '">' + message + '</span>';

						if (!this.c.viewCount || !this.s.colOpts.viewCount) {
							pill = '';
						}

						if (type === 'filter') {
							return typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
								data.replace(/<[^>]*>/g, '') :
								data;
						}

						return '<div class="' + this.classes.nameCont + '"><span title="' +
							(
								typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
									data.replace(/<[^>]*>/g, '') :
									data
							) +
							'" class="' + this.classes.name + '">' +
							data + '</span>' +
							pill + '</div>';
					},
					targets: 0,
					// Accessing the private datatables property to set type based on the original table.
					// This is null if not defined by the user, meaning that automatic type detection
					//  would take place
					type: this.s.dt.settings()[0].aoColumns[this.s.index] ?
						this.s.dt.settings()[0].aoColumns[this.s.index]._sManualType :
						null
				},
				{
					className: 'dtsp-countColumn ' + this.classes.badgePill,
					data: 'total',
					searchable: false,
					targets: 1,
					visible: false
				}
			],
			deferRender: true,
			dom: 't',
			info: false,
			language: this.s.dt.settings()[0].oLanguage,
			paging: haveScroller ? true : false,
			scrollX: false,
			scrollY: '200px',
			scroller: haveScroller ? true : false,
			select: true,
			stateSave: this.s.dt.settings()[0].oFeatures.bStateSave ? true : false
		};
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
				console.log(251)
				if(dataPoint.value === 'Ishmael') {
					console.log(dataPoint)
				}
				this.s.rowData.arrayFilter.push({
					display: dataPoint.label,
					filter: dataPoint.value,
					shown: +dataPoint.count,
					sort: dataPoint.label,
					total: +dataPoint.total,
					type: dataPoint.label
				});
				this.s.rowData.binsShown[dataPoint.value] = dataPoint.count;
				this.s.rowData.bins[dataPoint.value] = dataPoint.total;
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
