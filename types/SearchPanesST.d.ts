export declare function setJQuery(jq: any): void;
import { ISCV } from './panesType';
import SearchPanes from './SearchPanes';
export default class SearchPanesST extends SearchPanes {
    s: ISCV;
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
}
