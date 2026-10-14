import { Context, Dom, util } from 'datatables.net';
import { IConfig } from './panesType';
import { IConfigPaneItem } from './paneType';
import SearchPaneCascade from './SearchPaneCascade';

export default class SearchPaneCascadeViewTotal extends SearchPaneCascade {
	public constructor(
		ctxHost: Context,
		opts: IConfig,
		index: number,
		panesContainer: Dom,
		panes: IConfigPaneItem | null
	) {
		let override = {
			i18n: {
				count: '{total}',
				countFiltered: '{shown} ({total})'
			}
		};

		super(
			ctxHost,
			util.object.assign(override, opts),
			index,
			panesContainer,
			panes
		);
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
			for (let index of this.s.dt
				.rows({ search: 'applied' })
				.indexes()
				.toArray()) {
				this._populatePaneArray(
					index,
					this.s.rowData.arrayFilter,
					settings,
					this.s.rowData.binsShown
				);
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
		let countMessage = this.s.dt.i18n(
			'searchPanes.count',
			this.c.i18n.count
		);
		let filteredMessage = this.s.dt.i18n(
			'searchPanes.countFiltered',
			this.c.i18n.countFiltered
		);

		return (this.s.filteringActive ? filteredMessage : countMessage)
			.replace(/{total}/g, row.total)
			.replace(/{shown}/g, row.shown);
	}
}
