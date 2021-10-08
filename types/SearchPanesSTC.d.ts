export declare function setJQuery(jq: any): void;
import { ISC } from './panesType';
import SearchPanes from './SearchPanes';
export default class SearchPanesSTC extends SearchPanes {
    s: ISC;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    _updateSelection(): void;
    private _initSelectionListeners;
    /**
     * Updates the selection list to include the latest selections for a given pane
     *
     * @param index The index of the pane that is to be updated
     * @param selected Which rows are selected within the pane
     */
    private _updateSelectionList;
    private _remakeSelections;
}
