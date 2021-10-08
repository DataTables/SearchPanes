import SearchPaneCascade from './SearchPaneCascade';
export declare function setJQuery(jq: any): void;
export default class SearchPaneCascadeViewTotal extends SearchPaneCascade {
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
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
     * Fill the array with the values that are currently being displayed in the table
     */
    _activePopulatePane(): void;
}
