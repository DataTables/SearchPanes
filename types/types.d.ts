// Type definitions for DataTables SearchPanes
//
// Project: https://datatables.net/extensions/SearchPanes/, https://datatables.net

/// <reference types="jquery" />

import DataTables, {Api} from 'datatables.net';
import * as paneType from './paneType';

export default DataTables;

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Config {
		/**
		 * SearchPanes extension options
		 */
		searchPanes?: boolean | string[] | ConfigSearchPanes | ConfigSearchPanes[];
	}

	interface ConfigLanguage {
		/**
		 * SearchBuilder language options
		 */
		 searchPanes?: ConfigSearchPanesLanguage;
	}

	interface Feature {
		searchPanes?: string[] | ConfigSearchPanes | ConfigSearchPanes[];
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
		SearchPanes: {
			/**
			 * Create a new SearchPanes instance for the target DataTable
			 */
			new (dt: Api<any>, settings: string[] | ConfigSearchPanes | ConfigSearchPanes[]): DataTablesStatic['SearchPanes'];

			/**
			 * SearchPanes version
			 */
			version: string;

			/**
			 * Default configuration values
			 */
			defaults: ConfigSearchPanes;
		}
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

interface ConfigSearchPanes extends DeepPartial<paneType.IDefaults> {}

interface ConfigSearchPanesLanguage extends DeepPartial<paneType.IDefaults['i18n']> {}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * API
 */
interface ApiSearchPanes<T> extends Api<T> {
	/**
	 * Clears the selections in all of the panes
	 *
	 * @returns self for chaining
	 */
	clearSelections(): Api<T>;

	/**
	 * Returns the node of the SearchPanes container
	 *
	 * @returns The node of the SearchPanes container
	 */
	container(): JQuery<HTMLElement>;

	/**
	 * Rebuilds the SearchPanes, regathering the options from the table.
	 *
	 * @param index Optional. The index of a specific pane to rebuild
	 * @param maintainSelect  Optional. Whether to remake the selections once the pane has been rebuilt.
	 * @returns self for chaining
	 */
	rebuildPane(index?: number, maintainSelect?: boolean): Api<T>;

	/**
	 * Resize all of the SearchPanes to fill the container appropriately.
	 *
	 * @returns self for chaining
	 */
	resizePanes(): Api<T>;
}
