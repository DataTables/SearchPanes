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
     * @param total the total number of rows in the table that match this criteria
     * @param sort the value to be sorted in the pane table
     * @param type the value of which the type is to be derived from
     */
    addRow(display: any, filter: any, total: number | string, sort: any, type: any, className?: string): any;
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
     * Expands the pane from the collapsed state
     */
    show(): void;
    /**
     * Updates the panes if one of the options to do so has been set to true
     * rather than the filtered message when using viewTotal.
     */
    updateTable(): void;
    /**
     * Get's the pane config appropriate to this class
     *
     * @returns The config needed to create a pane of this type
     */
    _getPaneConfig(): {
        columnDefs: ({
            className: string;
            data: string;
            render: (data: any, type: any, row: any) => any;
            targets: number;
            type: any;
            searchable?: undefined;
            visible?: undefined;
        } | {
            className: string;
            data: string;
            searchable: boolean;
            targets: number;
            visible: boolean;
            render?: undefined;
            type?: undefined;
        })[];
        deferRender: boolean;
        dom: string;
        info: boolean;
        language: any;
        paging: boolean;
        scrollX: boolean;
        scrollY: string;
        scroller: boolean;
        select: boolean;
        stateSave: boolean;
    };
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
     * Gets the options for the row for the customPanes
     *
     * @returns {object} The options for the row extended to include the options from the user.
     */
    private _getBonusOptions;
    /**
     * Adds the custom options to the pane
     *
     * @returns {Array} Returns the array of rows which have been added to the pane
     */
    private _getComparisonRows;
    /**
     * Gets the options for the row for the customPanes
     *
     * @returns {object} The options for the row extended to include the options from the user.
     */
    private _getOptions;
    /**
     * This method allows for changes to the panes and table to be made when a selection or a deselection occurs
     */
    private _makeSelection;
    /**
     * Fill the array with the values that are currently being displayed in the table
     */
    private _populatePane;
    /**
     * Populates an array with all of the data for the table
     *
     * @param rowIdx The current row index to be compared
     * @param arrayFilter The array that is to be populated with row Details
     * @param settings The DataTable settings object
     * @param bins The bins object that is to be populated with the row counts
     */
    private _populatePaneArray;
    /**
     * Reloads all of the previous selects into the panes
     *
     * @param loadedFilter The loaded filters from a previous state
     */
    private _reloadSelect;
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
    /**
     * Finds the ratio of the number of different options in the table to the number of rows
     *
     * @param bins the number of different options in the table
     * @param rowCount the total number of rows in the table
     * @returns {number} returns the ratio
     */
    private _uniqueRatio;
    /**
     * Notes the rows that have been selected within this pane and stores them internally
     *
     * @param notUpdating Whether the panes are updating themselves or not
     */
    private _updateSelection;
}
