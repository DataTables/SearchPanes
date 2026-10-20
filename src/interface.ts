import DataTables, { Dom, Order } from 'datatables.net';
import { IConfig } from './panesType';
import { SPColumnOptions } from './paneType';
import SearchPane from './SearchPane';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneCascadeViewTotal from './SearchPaneCascadeViewTotal';
import SearchPanes from './SearchPanes';
import SearchPanesST from './SearchPanesST';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default DataTables;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Options {
		/**
		 * SearchPanes extension options
		 */
		searchPanes?: boolean | string[] | IConfig | IConfig[];
	}

	interface ColumnOptions {
		/**
		 * SearchPanes extension options
		 */
		searchPanes?: SPColumnOptions;
	}

	interface Defaults {
		/**
		 * SearchPanes defaults
		 */
		searchPanes?: IConfig;
	}

	interface Language {
		/**
		 * SearchPanes language options
		 */
		searchPanes?: IConfig['i18n'];
	}

	interface Feature {
		searchPanes?: boolean | string[] | IConfig | IConfig[];
	}

	interface Context {
		/**
		 * SearchPanes instance
		 */
		_searchPanes: SearchPanes;
	}

	interface ColumnContext {
		/**
		 * SearchPanes instance
		 */
		searchPanes: IConfig;
	}

	interface Api<T> {
		/**
		 * SearchPanes methods container
		 *
		 * @returns Api for chaining with the additional SearchPanes methods
		 */
		searchPanes: ApiSearchPanes<T>;
	}

	interface DataTablesStatic {
		/**
		 * SearchPanes class
		 */
		SearchPanes: typeof SearchPanes;

		/** @deprecated */
		SearchPanesST: typeof SearchPanesST;

		/**
		 * Individual SearchPane class
		 */
		SearchPane: typeof SearchPane;

		/** @deprecated */
		SearchPaneViewTotal: typeof SearchPaneViewTotal;

		/** @deprecated */
		SearchPaneCascade: typeof SearchPaneCascade;

		/** @deprecated */
		SearchPaneCascadeViewTotal: typeof SearchPaneCascadeViewTotal;
	}

	export interface Buttons {
		/** SearchPanes button */
		searchPanes: {
			extend: 'searchPanes';

			/**
			 * Configuration object
			 */
			config: IConfig;

			/**
			 * Delay initialisation of SearchPanes until the button is
			 * activated.
			 */
			delayInit?: boolean;

			/**
			 * Button text
			 */
			text?: string;

			/**
			 * Internal reference to the SearchPanes instance for this instance
			 *
			 * @ignore
			 */
			_panes: SearchPanes;
		};
	}

	export interface AjaxData {
		/** SearchPanes selections */
		searchPanes: {
			[name: string]: {
				[id: string]: string;
			};
		};

		/** Null values */
		searchPanes_null: {
			[name: string]: {
				[id: string]: boolean;
			};
		};

		searchPanesLast?: string | number;

		searchPanes_options: {
			cascade: boolean;
			viewCount: boolean;
			viewTotal: boolean;
		};
	}

	export interface AjaxResponse {
		searchPanes: {
			options: any;
		};
	}

	export interface State {
		searchPanes: any;
	}

	export interface StateLoad {
		searchPanes: {
			selectionList: any;
			panes: Array<{
				collapsed: boolean;
				id: number;
				searchTerm: string;
				order: Order;
			}>;
		};
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

interface ApiSearchPanes<T> {
	/**
	 * Clears the selections in all of the panes
	 *
	 * @returns Self for chaining
	 */
	clearSelections(): ApiSearchPanes<T>;

	/**
	 * Returns the node of the panes container.
	 *
	 * @returns Dom instance that contains the SearchPanes container
	 */
	container(): Dom;

	/**
	 * Rebuilds the SearchPanes, regathering the options from the table.
	 *
	 * @param index The index of a specific pane to rebuild
	 * @param maintainSelect  Whether to remake the selections once the pane has
	 *   been rebuilt.
	 * @returns Self for chaining
	 */
	rebuildPane(index?: number, maintainSelect?: boolean): ApiSearchPanes<T>;

	/**
	 * Resize all of the SearchPanes to fill the container appropriately.
	 *
	 * @returns Self for chaining
	 */
	resizePanes(): ApiSearchPanes<T>;
}
