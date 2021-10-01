let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace DataTables {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface IStaticFunctions {
		select: any;
	}
}
import { ISCV } from './panesType';
import SearchPanes from './SearchPanes';
import SearchPaneViewTotal from './SearchPaneViewTotal';

export default class SearchPanesST extends SearchPanes {

	public s: ISCV;

	public constructor(paneSettings, opts, fromPreInit = false) {
		super(paneSettings, opts, fromPreInit, SearchPaneViewTotal);
	}
}
