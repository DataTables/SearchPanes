import { ISST } from './paneType';
import SearchPane from './SearchPane';
export declare function setJQuery(jq: any): void;
export default class SearchPaneST extends SearchPane {
    s: ISST;
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    /**
     * Populates the SearchPane based off of the data that has been recieved from the server
     *
     * This method overrides SearchPane's _serverPopulate() method
     *
     * @param dataIn The data that has been sent from the server
     */
    _serverPopulate(dataIn: any): void;
    /**
     * This method updates the rows and their data within the SearchPanes
     *
     * SearchPaneCascade overrides this method
     */
    updateRows(): void;
    protected _makeSelection(): void;
    protected _reloadSelect(): void;
    protected _updateSelection(): void;
    /**
     * Used when binning the data for a column
     *
     * @param rowIdx The current row that is to be added to the bins
     * @param settings The datatables settings object
     * @param bins The bins object that is to be incremented
     */
    protected _updateShown(rowIdx: number, settings: any, bins?: {
        [keys: string]: number;
    }): void;
    /**
     * Decides if a row should be added when being added from the server
     *
     * Overridden by SearchPaneCascade
     *
     * @param data the row data
     * @returns boolean indicating if the row should be added or not
     */
    protected _shouldAddRow(data: any): boolean;
}
