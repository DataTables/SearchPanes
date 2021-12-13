import SearchPaneCascade from './SearchPaneCascade';
export declare function setJQuery(jq: any): void;
export default class SearchPaneCascadeViewTotal extends SearchPaneCascade {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    /**
     * Fill the array with the values that are currently being displayed in the table
     *
     * This method overrides _activePopulatePane() in SearchPaneCascade
     */
    protected _activePopulatePane(): void;
    /**
     * Gets the message that is to be used to indicate the count for each SearchPane row
     *
     * This method overrides _getMessage() in SearchPaneCascade
     *
     * @param row The row object that is being processed
     * @returns string - the message that is to be shown for the count of each entry
     */
    protected _getMessage(row: any): string;
}
