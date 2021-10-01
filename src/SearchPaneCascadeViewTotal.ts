import { ISVT } from './paneType';
import SearchPaneST from './SearchPaneST';

let $;
let dataTable;

export function setJQuery(jq) {
	$ = jq;
	dataTable = jq.fn.dataTable;
}

export default class SearchPaneCascadeViewTotal extends SearchPaneST {

	public s: ISVT;

	/**
	 * Get's the pane config appropriate to this class
	 *
	 * @returns The config needed to create a pane of this type
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	_getPaneConfig() {
		let countMessage = this.s.dt.i18n('searchPanes.count', this.c.i18n.count);
		let filteredMessage = this.s.dt.i18n('searchPanes.countFiltered', this.c.i18n.countFiltered);
		let haveScroller = (dataTable as any).Scroller;

		return {
			columnDefs: [
				{
					className: 'dtsp-nameColumn',
					data: 'display',
					render: (data, type, row) => {
						if (type === 'sort') {
							return row.sort;
						}
						else if (type === 'type') {
							return row.type;
						}

						let message = this.s.filteringActive ?
							filteredMessage.replace(/{total}/, row.total):
							countMessage.replace(/{total}/, row.total) ;

						while (message.includes('{total}')) {
							message = message.replace(/{total}/, row.total);
						}

						// We are displaying the count in the same columne as the name of the search option.
						// This is so that there is not need to call columns.adjust()
						//  which in turn speeds up the code
						let pill = '<span class="' + this.classes.pill + '">' + message + '</span>';

						if (!this.c.viewCount || !this.s.colOpts.viewCount) {
							pill = '';
						}

						if (type === 'filter') {
							return typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
								data.replace(/<[^>]*>/g, '') :
								data;
						}

						return '<div class="' + this.classes.nameCont + '"><span title="' +
							(
								typeof data === 'string' && data.match(/<[^>]*>/) !== null ?
									data.replace(/<[^>]*>/g, '') :
									data
							) +
							'" class="' + this.classes.name + '">' +
							data + '</span>' +
							pill + '</div>';
					},
					targets: 0,
					// Accessing the private datatables property to set type based on the original table.
					// This is null if not defined by the user, meaning that automatic type detection
					//  would take place
					type: this.s.dt.settings()[0].aoColumns[this.s.index] ?
						this.s.dt.settings()[0].aoColumns[this.s.index]._sManualType :
						null
				},
				{
					className: 'dtsp-countColumn ' + this.classes.badgePill,
					data: 'total',
					searchable: false,
					targets: 1,
					visible: false
				}
			],
			deferRender: true,
			dom: 't',
			info: false,
			language: this.s.dt.settings()[0].oLanguage,
			paging: haveScroller ? true : false,
			scrollX: false,
			scrollY: '200px',
			scroller: haveScroller ? true : false,
			select: true,
			stateSave: this.s.dt.settings()[0].oFeatures.bStateSave ? true : false
		};
	}
}
