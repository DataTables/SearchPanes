import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
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
	 * Adds a row to the panes table
	 *
	 * @param display the value to be displayed to the user
	 * @param filter the value to be filtered on when searchpanes is implemented
	 * @param shown the number of rows in the table that are currently visible matching this criteria
	 * @param total the total number of rows in the table that match this criteria
	 * @param sort the value to be sorted in the pane table
	 * @param type the value of which the type is to be derived from
	 */
	public addRow(
		display,
		filter,
		sort,
		type,
		className?: string,
		total?,
		shown?
	): any {
		let index: number;
		if(!total) {
			total = this.s.rowData.bins[filter] ?
				this.s.rowData.bins[filter] :
				0;
		}
		if(!shown) {
			shown = this.s.rowData.binsShown && this.s.rowData.binsShown[filter] ?
				this.s.rowData.binsShown[filter] :
				0;
		}

		for (let entry of this.s.indexes) {
			if (entry.filter === filter) {
				index = entry.index;
			}
		}

		if (index === undefined) {
			index = this.s.indexes.length;
			this.s.indexes.push({filter, index});
		}
		return this.s.dtPane.row.add({
			className,
			display: display !== '' ?
				display :
				this.emptyMessage(),
			filter,
			index,
			shown,
			sort,
			total,
			type
		});
	}

	/**
	 * Get's the pane config appropriate to this class
	 *
	 * @returns The config needed to create a pane of this type
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getPaneConfig() {
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
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

						let message = countMessage.replace(/{total}/, row.total).replace(/{shown}/, row.shown);


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
	updateRows() {
		if (!this.s.dt.page.info().serverSide) {
			this._activePopulatePane();
			this.s.rowData.binsShown = {};
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
			}
		}
		let selected = this.s.dtPane.rows({selected: true}).data().toArray();
		this.s.dtPane.rows().remove();
		for(let data of this.s.rowData.arrayFilter) {
			if(data.shown === 0) {
				continue;
			}
			let row = this.addRow(
				data.display,
				data.filter,
				data.sort,
				data.type,
				undefined
			);
			for(let i = 0; i < selected.length; i++) {
				let selection = selected[i];
				if(selection.filter === data.filter) {
					row.select();
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
						data.type,
						undefined
					);
					row.select();
					this.s.selections.push(data.filter);
				}
			}
		}
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentNode.scrollTop = this.s.scrollTop;
		if (!this.s.dt.page.info().serverSide) {
			this.s.dt.draw();
		}
	}

	/**
	 * Fill the array with the values that are currently being displayed in the table
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_activePopulatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.bins = {};
		let settings = this.s.dt.settings()[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._populatePaneArray(index, this.s.rowData.arrayFilter, settings);
			}
		}
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
					shown: dataPoint.count,
					sort: dataPoint.label,
					total: dataPoint.total,
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
				if(data.shown > 0) {
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
