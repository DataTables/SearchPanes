import { ISST } from './paneType';
import SearchPane from './SearchPane';
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
    _serverPopulate(dataIn: {
        [keys: string]: any;
    }): void;
    /**
     * This method updates the rows and their data within the SearchPanes
     *
     * SearchPaneCascade overrides this method
     */
    updateRows(): void;
    /**
     * Remove functionality from makeSelection - needs to be more advanced when tracking selections
     */
    protected _makeSelection(): void;
    /**
     * Blank method to remove reloading of selected rows - needs to be more advanced when tracking selections
     */
    protected _reloadSelect(): void;
    /**
     * Decides if a row should be added when being added from the server
     *
     * Overridden by SearchPaneCascade
     *
     * @param data the row data
     * @returns boolean indicating if the row should be added or not
     */
    protected _shouldAddRow(data: any): boolean;
    /**
     * Updates the server selection list where appropriate
     */
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
}
