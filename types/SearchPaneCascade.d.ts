import SearchPaneST from './SearchPaneST';
export declare function setJQuery(jq: any): void;
export default class SearchPaneCascade extends SearchPaneST {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    /**
     * This method updates the rows and their data within the SearchPanes
     *
     * This overrides the method in SearchPane
     */
    updateRows(): void;
    /**
     * Fill the array with the values that are currently being displayed in the table
     */
    protected _activePopulatePane(): void;
    /**
     * Overrides the method from SearchPane to make it take no action
     *
     * @returns undefined
     */
    protected _getEmpties(): number;
    /**
     * Gets the message that is to be used to indicate the count for each SearchPane row
     *
     * This method overrides _getMessage() in SearchPane and is overridden by SearchPaneCascadeViewTotal
     *
     * @param row The row object that is being processed
     * @returns string - the message that is to be shown for the count of each entry
     */
    protected _getMessage(row: any): any;
    /**
     * Overrides the blank method in SearchPane to return the number of times a given value is currently being displayed
     *
     * @param filter The filter value
     * @returns number - The number of times the value is shown
     */
    protected _getShown(filter: any): number;
    /**
     * Decides if a row should be added when being added from the server
     *
     * Overrides method in by SearchPaneST
     *
     * @param data the row data
     * @returns boolean indicating if the row should be added or not
     */
    protected _shouldAddRow(data: any): boolean;
}
