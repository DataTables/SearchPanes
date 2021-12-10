import SearchPaneCascade from './SearchPaneCascade';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneCascadeViewTotal extends SearchPaneCascade {

	public constructor(paneSettings, opts, index, panesContainer, panes) {
		let override = {
			i18n: {
				count: '{total}',
				countFiltered: '{shown} ({total})'
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
		let config = super._getPaneConfig();
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
		let filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);

		config.columnDefs[0].render = (data, type, row) => {
			if (type === 'sort') {
				return row.sort;
			}
			else if (type === 'type') {
				return row.type;
			}

			let message = (
				this.s.filteringActive ?
					filteredMessage.replace(/{total}/g, row.total):
					countMessage.replace(/{total}/g, row.total)
			)
				.replace(/{shown}/, row.shown);


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
		};

		return config;
	}

	/**
	 * Fill the array with the values that are currently being displayed in the table
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_activePopulatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.binsShown = {};
		let settings = this.s.dt.settings()[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._populatePaneArray(index, this.s.rowData.arrayFilter, settings, this.s.rowData.binsShown);
			}
		}
	}
}
