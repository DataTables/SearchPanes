import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneCascade extends SearchPaneST {

}
