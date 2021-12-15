import { ISVT } from './panesType';
import SearchPanes from './SearchPanes';
export default class SearchPanesST extends SearchPanes {
    s: ISVT;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    /**
     * Retrieve the total values from the server data
     */
    protected _serverTotals(): void;
    /**
     * Set's the function that is to be performed when a state is loaded
     *
     * Overrides the method in SearchPanes
     */
    protected _stateLoadListener(): void;
    /**
     * Remove the function's actions when using cascade
     *
     * Overrides the method in SearchPanes
     */
    protected _updateSelection(): void;
    /**
     * Ensures that the correct selection listeners are set for selection tracking
     *
     * @param preSelect Any values that are to be preselected
     */
    private _initSelectionListeners;
    /**
     * Returns a function that updates the selection list based on a specific pane
     *
     * @param pane the pane that is to have it's selections loaded
     */
    private _update;
    /**
     * Updates the selection list to include the latest selections for a given pane
     *
     * @param index The index of the pane that is to be updated
     * @param selected Which rows are selected within the pane
     */
    private _updateSelectionList;
    /**
     * Remake the selections that were present before new data or calculations have occured
     */
    private _remakeSelections;
}
