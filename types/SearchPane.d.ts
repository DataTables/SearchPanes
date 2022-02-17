import { IClasses, IDefaults, IDOM, IS } from './paneType';
export declare function setJQuery(jq: any): void;
export default class SearchPane {
    private static version;
    private static classes;
    private static defaults;
    classes: IClasses;
    dom: IDOM;
    c: IDefaults;
    s: IS;
    /**
     * Creates the panes, sets up the search function
     *
     * @param paneSettings The settings for the searchPanes
     * @param opts The options for the default features
     * @param index the index of the column for this pane
     * @param panesContainer The overall container for SearchPanes that this pane will be attached to
     * @param panes The custom pane settings if this is a custom pane
     * @returns {object} the pane that has been created, including the table and the index of the pane
     */
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes?: any);
    /**
     * Adds a row to the panes table
     *
     * @param display the value to be displayed to the user
     * @param filter the value to be filtered on when searchpanes is implemented
     * @param shown the number of rows in the table that are currently visible matching this criteria
     * @param total the total number of rows in the table that match this criteria
     * @param sort the value to be sorted in the pane table
     * @param type the value of which the type is to be derived from
     */
    addRow(display: string, filter: any, sort: any, type: string, className?: string, total?: number, shown?: number): any;
    /**
     * Adjusts the layout of the top row when the screen is resized
     */
    adjustTopRow(): void;
    /**
     * In the case of a rebuild there is potential for new data to have been included or removed
     * so all of the rowData must be reset as a precaution.
     */
    clearData(): void;
    /**
     * Clear the selections in the pane
     */
    clearPane(): this;
    /**
     * Collapses the pane so that only the header is displayed
     */
    collapse(): void;
    /**
     * Strips all of the SearchPanes elements from the document and turns all of the listeners for the buttons off
     */
    destroy(): void;
    /**
     * Getting the legacy message is a little complex due a legacy parameter
     */
    emptyMessage(): string;
    /**
     * Updates the number of filters that have been applied in the title
     */
    getPaneCount(): number;
    /**
     * Rebuilds the panes from the start having deleted the old ones
     *
     * @param? dataIn data to be used in buildPane
     * @param? maintainSelection Whether the current selections are to be maintained over rebuild
     */
    rebuildPane(dataIn?: any, maintainSelection?: boolean): this;
    /**
     * Resizes the pane based on the layout that is passed in
     *
     * @param layout the layout to be applied to this pane
     */
    resize(layout: string): void;
    /**
     * Sets the listeners for the pane.
     *
     * Having it in it's own function makes it easier to only set them once
     */
    setListeners(): void;
    /**
     * Populates the SearchPane based off of the data that has been recieved from the server
     *
     * This method is overriden by SearchPaneST
     *
     * @param dataIn The data that has been sent from the server
     */
    _serverPopulate(dataIn: {
        [keys: string]: any;
    }): void;
    /**
     * Expands the pane from the collapsed state
     */
    show(): void;
    /**
     * Finds the ratio of the number of different options in the table to the number of rows
     *
     * @param bins the number of different options in the table
     * @param rowCount the total number of rows in the table
     * @returns {number} returns the ratio
     */
    _uniqueRatio(bins: number, rowCount: number): number;
    /**
     * Updates the panes if one of the options to do so has been set to true
     * rather than the filtered message when using viewTotal.
     */
    updateTable(): void;
    /**
     * Adds the custom options to the pane
     *
     * @returns {Array} Returns the array of rows which have been added to the pane
     */
    protected _getComparisonRows(): any[];
    protected _getMessage(row: {
        [keys: string]: any;
    }): string;
    /**
     * Overridden in SearchPaneViewTotal and SearchPaneCascade to get the number of times a specific value is shown
     *
     * Here it is blanked so that it takes no action
     *
     * @param filter The filter value
     * @returns undefined
     */
    protected _getShown(filter: any): number;
    /**
     * Get's the pane config appropriate to this class
     *
     * @returns The config needed to create a pane of this type
     */
    protected _getPaneConfig(): {
        [keys: string]: any;
    };
    /**
     * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
     */
    protected _makeSelection(): void;
    /**
     * Populates an array with all of the data for the table
     *
     * @param rowIdx The current row index to be compared
     * @param arrayFilter The array that is to be populated with row Details
     * @param settings The DataTable settings object
     * @param bins The bins object that is to be populated with the row counts
     */
    protected _populatePaneArray(rowIdx: number, arrayFilter: any, settings: any, bins?: {
        [keys: string]: number;
    }): void;
    /**
     * Reloads all of the previous selects into the panes
     *
     * @param loadedFilter The loaded filters from a previous state
     */
    protected _reloadSelect(loadedFilter: {
        [keys: string]: any;
    }): void;
    /**
     * Notes the rows that have been selected within this pane and stores them internally
     *
     * @param notUpdating Whether the panes are updating themselves or not
     */
    protected _updateSelection(notUpdating: boolean): void;
    /**
     * Takes in potentially undetected rows and adds them to the array if they are not yet featured
     *
     * @param filter the filter value of the potential row
     * @param display the display value of the potential row
     * @param sort the sort value of the potential row
     * @param type the type value of the potential row
     * @param arrayFilter the array to be populated
     * @param bins the bins to be populated
     */
    private _addOption;
    /**
     * Method to construct the actual pane.
     *
     * @param selectedRows previously selected Rows to be reselected
     * @param dataIn Data that should be used to populate this pane
     * @param prevEl Reference to the previous element, used to ensure insert is in the correct location
     * @returns boolean to indicate whether this pane was the last one to have a selection made
     */
    private _buildPane;
    /**
     * Appends all of the HTML elements to their relevant parent Elements
     */
    private _displayPane;
    /**
     * Escape html characters within a string
     *
     * @param txt the string to be escaped
     * @returns the escaped string
     */
    private _escapeHTML;
    /**
     * Gets the options for the row for the customPanes
     *
     * @returns {object} The options for the row extended to include the options from the user.
     */
    private _getBonusOptions;
    /**
     * Gets the options for the row for the customPanes
     *
     * @returns {object} The options for the row extended to include the options from the user.
     */
    private _getOptions;
    /**
     * Fill the array with the values that are currently being displayed in the table
     */
    private _populatePane;
    /**
     * This method decides whether a row should contribute to the pane or not
     *
     * @param filter the value that the row is to be filtered on
     * @param dataIndex the row index
     */
    private _search;
    /**
     * Creates the contents of the searchCont div
     *
     * NOTE This is overridden when semantic ui styling in order to integrate the search button into the text box.
     */
    private _searchContSetup;
    /**
     * Adds outline to the pane when a selection has been made
     */
    private _searchExtras;
}
