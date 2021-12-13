import SearchPaneCascade from './SearchPaneCascade';

let $;

export function setJQuery(jq) {
	$ = jq;
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
	 * Fill the array with the values that are currently being displayed in the table
	 *
	 * This method overrides _activePopulatePane() in SearchPaneCascade
	 */
	protected _activePopulatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.binsShown = {};
		let settings = this.s.dt.settings()[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows({search: 'applied'}).indexes().toArray()) {
				this._populatePaneArray(index, this.s.rowData.arrayFilter, settings, this.s.rowData.binsShown);
			}
		}
	}

	/**
	 * Gets the message that is to be used to indicate the count for each SearchPane row
	 *
	 * This method overrides _getMessage() in SearchPaneCascade
	 *
	 * @param row The row object that is being processed
	 * @returns string - the message that is to be shown for the count of each entry
	 */
	protected _getMessage(row: any): string {
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
		let filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);

		return (this.s.filteringActive ? filteredMessage : countMessage)
			.replace(/{total}/g, row.total)
			.replace(/{shown}/g, row.shown);
	}
}
