export declare function setJQuery(jq: any): void;
import { ISVT } from './panesType';
import SearchPanesST from './SearchPanesST';
export default class SearchPanesSTC extends SearchPanesST {
    s: ISVT;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    /**
     * Updates the selection list to include the latest selections for a given pane
     *
     * @param index The index of the pane that is to be updated
     * @param selected Which rows are selected within the pane
     */
    _updateSelectionList(paneIn?: any): void;
    _remakeSelections(): void;
}
