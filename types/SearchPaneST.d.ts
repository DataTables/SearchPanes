import { ISST } from './paneType';
import SearchPane from './SearchPane';
export declare function setJQuery(jq: any): void;
export default class SearchPaneST extends SearchPane {
    s: ISST;
    constructor(paneSettings: any, opts: any, index: any, panesContainer: any, panes: any);
    _makeSelection(): void;
    _reloadSelect(): void;
    _updateSelection(): void;
    updateRows(): void;
    _updateShown(rowIdx: number, settings: any, bins?: {
        [keys: string]: number;
    }): void;
}
