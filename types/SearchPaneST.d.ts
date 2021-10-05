import { ISST } from './paneType';
import SearchPane from './SearchPane';
export declare function setJQuery(jq: any): void;
export default class SearchPaneST extends SearchPane {
    s: ISST;
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    updateRows(): void;
    private _updateShown;
}
