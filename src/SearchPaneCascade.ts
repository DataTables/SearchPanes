import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneCascade extends SearchPaneST {

	public constructor(paneSettings, opts, index, panesContainer, panes) {
		super(paneSettings, opts, index, panesContainer, panes);

		this.c.i18n.count = '{shown}';
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
		total: number | string,
		sort,
		type,
		className?: string,
		shown?: number
	): any {
		let index: number;

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
		this._activePopulatePane();
		this.s.rowData.binsShown = {};
		for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
			this._updateShown(index, this.s.dt.settings()[0], this.s.rowData.binsShown);
		}
		let selected = this.s.dtPane.rows({selected: true}).data().toArray();
		this.s.dtPane.rows().remove();
		for(let data of this.s.rowData.arrayFilter) {
			let row = this.addRow(
				data.display,
				data.filter,
				this.s.rowData.bins[data.filter],
				data.sort,
				data.type,
				undefined,
				this.s.rowData.binsShown[data.filter]
			);
			for(let i = 0; i < selected.length; i++) {
				let selection = selected[i];
				if(selection.filter === data.filter) {
					row.select();
					selected.splice(i, 1);
					this.s.selections.push({
						filter: data.filter,
						index: row.index()
					});
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
						this.s.rowData.bins[data.filter] ? this.s.rowData.bins[data.filter] : 0,
						data.sort,
						data.type,
						undefined,
						0
					);
					row.select();
					this.s.selections.push({
						filter: data.filter,
						index: row.index()
					});
				}
			}
		}
		this.s.dtPane.draw();
		this.s.dt.draw();
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
}
