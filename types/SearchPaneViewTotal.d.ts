import SearchPaneST from './SearchPaneST';
export declare function setJQuery(jq: any): void;
export default class SearchPaneViewTotal extends SearchPaneST {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
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
}
