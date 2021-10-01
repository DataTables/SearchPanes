export declare function setJQuery(jq: any): void;
import SearchPanes from './SearchPanes';
export default class SearchPanesCV extends SearchPanes {
    constructor(paneSettings: any, opts: any, fromPreInit?: boolean);
    /**
     * Updates the number of filters that have been applied in the title
     */
    _updateFilterCount(): void;
}
