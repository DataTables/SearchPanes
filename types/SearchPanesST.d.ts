import { ISelectItem, ISVT } from './panesType';
import SearchPanes from './SearchPanes';
export default class SearchPanesST extends SearchPanes {
    s: ISVT;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    /**
     * Ensures that the correct selection listeners are set for selection tracking
     *
     * @param preSelect Any values that are to be preselected
     */
    protected _initSelectionListeners(isPreselect?: boolean, preSelect?: ISelectItem[]): void;
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
     * Returns a function that updates the selection list based on a specific pane
     * Also clears the timeout to stop the deselect from running
     *
     * @param pane the pane that is to have it's selections loaded
     */
    private _update;
    /**
     * Returns a function that updates the selection list based on a specific pane
     * Also sets a timeout incase a select is about to be made
     *
     * @param pane the pane that is to have it's selections loaded
     */
    private _updateTimeout;
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
