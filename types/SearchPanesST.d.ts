export declare function setJQuery(jq: any): void;
import { ISVT } from './panesType';
import SearchPanes from './SearchPanes';
export default class SearchPanesST extends SearchPanes {
    s: ISVT;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    _initSelectionListeners(preSelect: any): void;
    _update(pane?: any): () => void;
    _stateLoadListener(): void;
    _updateSelection(): void;
    /**
     * Updates the selection list to include the latest selections for a given pane
     *
     * @param index The index of the pane that is to be updated
     * @param selected Which rows are selected within the pane
     */
    _updateSelectionList(paneIn?: any): void;
    _remakeSelections(): void;
}
