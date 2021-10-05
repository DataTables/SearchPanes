import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneCascade extends SearchPaneST {

	public constructor(paneSettings, opts, index, panesContainer, panes) {
		super(paneSettings, opts, index, panesContainer, panes);
	}
}
