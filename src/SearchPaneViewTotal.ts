import { Context, Dom, util } from 'datatables.net';
import { IConfig } from './panesType';
import { IConfigPaneItem } from './paneType';
import SearchPaneST from './SearchPaneST';

export default class SearchPaneViewTotal extends SearchPaneST {
	public constructor(
		ctxHost: Context,
		opts: IConfig,
		index: number,
		panesContainer: Dom,
		panes: IConfigPaneItem | null
	) {
		let override = {
			i18n: {
				countFiltered: '{shown} ({total})'
			}
		};

		super(
			ctxHost,
			util.object.assignDeep(override, opts),
			index,
			panesContainer,
			panes
		);
	}

	/**
	 * Gets the message that is to be used to indicate the count for each
	 * SearchPane row
	 *
	 * This method overrides _getMessage() in SearchPane and is overridden by
	 * SearchPaneCascadeViewTotal
	 *
	 * @param row The row object that is being processed
	 * @returns string - the message that is to be shown for the count of each
	 * entry
	 */
	protected _getMessage(row: any) {
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

	/**
	 * Overrides the blank method in SearchPane to return the number of times a
	 * given value is currently being displayed
	 *
	 * @param filter The filter value
	 * @returns number - The number of times the value is shown
	 */
	protected _getShown(filter: any): number {
		return this.s.rowData.binsShown && this.s.rowData.binsShown[filter]
			? this.s.rowData.binsShown[filter]
			: 0;
	}
}
