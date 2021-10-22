import SearchPaneST from './SearchPaneST';
export declare function setJQuery(jq: any): void;
export default class SearchPaneCascade extends SearchPaneST {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
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
    addRow(display: any, filter: any, sort: any, type: any, className?: string, total?: any, shown?: any): any;
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
    updateRows(): void;
    /**
     * Fill the array with the values that are currently being displayed in the table
     */
    _activePopulatePane(): void;
    _serverPopulate(dataIn: any): void;
}
