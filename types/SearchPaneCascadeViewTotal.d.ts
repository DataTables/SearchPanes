import SearchPaneCascade from './SearchPaneCascade';
export declare function setJQuery(jq: any): void;
export default class SearchPaneCascadeViewTotal extends SearchPaneCascade {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    _getMessage(row: any): any;
    /**
     * Fill the array with the values that are currently being displayed in the table
     */
    _activePopulatePane(): void;
}
