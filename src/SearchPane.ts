import DataTable, {
	AjaxResponse,
	Api,
	Context,
	Dom,
	StateLoad,
	util
} from 'datatables.net';
import { IConfig } from './panesType';
import {
	IClasses,
	IConfigPaneItem,
	IDataArray,
	IDefaults,
	IDOM,
	IS,
	SPColumnOptions
} from './paneType';

export default class SearchPane {
	public static version = '3.0.0';

	public static classes = {
		bordered: 'dtsp-bordered',
		buttonGroup: 'dtsp-buttonGroup',
		buttonSub: 'dtsp-buttonSub',
		caret: 'dtsp-caret',
		clear: 'dtsp-clear',
		clearAll: 'dtsp-clearAll',
		clearButton: 'clearButton',
		collapseAll: 'dtsp-collapseAll',
		collapseButton: 'dtsp-collapseButton',
		container: 'dtsp-searchPane',
		countButton: 'dtsp-countButton',
		disabledButton: 'dtsp-disabledButton',
		hidden: 'dtsp-hidden',
		hide: 'dtsp-hide',
		layout: 'dtsp-',
		name: 'dtsp-name',
		nameButton: 'dtsp-nameButton',
		nameCont: 'dtsp-nameCont',
		narrow: 'dtsp-narrow',
		paneButton: 'dtsp-paneButton',
		paneInputButton: 'dtsp-paneInputButton',
		pill: 'dtsp-pill',
		rotated: 'dtsp-rotated',
		search: 'dtsp-search',
		searchCont: 'dtsp-searchCont',
		searchIcon: 'dtsp-searchIcon',
		searchLabelCont: 'dtsp-searchButtonCont',
		selected: 'dtsp-selected',
		smallGap: 'dtsp-smallGap',
		subRow1: 'dtsp-subRow1',
		subRow2: 'dtsp-subRow2',
		subRowsContainer: 'dtsp-subRowsContainer',
		title: 'dtsp-title',
		topRow: 'dtsp-topRow'
	};

	// Define SearchPanes default options
	public static defaults: IDefaults = {
		clear: true,
		collapse: true,
		combiner: 'or',
		container(dt: Api) {
			return dt.table().container();
		},
		controls: true,
		dtOpts: {},
		emptyMessage: '',
		hideCount: false,
		i18n: {
			aria: {
				clearPane: 'Clear selection',
				clearSearch: 'Clear search',
				collapse: 'Collapse / show pane',
				orderByCount: 'Order by count',
				orderByLabel: 'Order by label'
			},
			clearPane: '&times;',
			count: '{total}',
			countFiltered: '',
			emptyMessage: '<em>Empty</em>',
			searchTitle: 'Search: {name}'
		},
		initCollapsed: false,
		layout: 'auto',
		name: '',
		orderable: true,
		orthogonal: {
			display: 'display',
			filter: 'filter',
			hideCount: false,
			search: 'filter',
			show: false,
			sort: 'sort',
			threshold: 0.6,
			type: 'type',
			viewCount: true
		},
		preSelect: [],
		threshold: 0.6,
		viewCount: true
	};

	public classes: IClasses;
	public dom: IDOM;
	public c: IDefaults;
	public s: IS;

	/**
	 * Creates the panes, sets up the search function
	 *
	 * @param hostCtx The settings for the searchPanes
	 * @param opts The options for the default features
	 * @param index the index of the column for this pane
	 * @param panesContainer The overall container for SearchPanes that this pane will be attached to
	 * @param panes The custom pane settings if this is a custom pane
	 * @returns {object} the pane that has been created, including the table and the index of the pane
	 */
	public constructor(
		hostCtx: Context,
		opts: IConfig,
		index: number,
		panesContainer: Dom,
		panes: IConfigPaneItem | null = null
	) {
		let table = new DataTable.Api(hostCtx);

		DataTable.plus('__BUILD_DATE__');

		this.classes = util.object.assignDeep({}, SearchPane.classes);

		// Get options from user
		this.c = util.object.assignDeep(
			{},
			SearchPane.defaults,
			opts,
			panes || {}
		);

		// Legacy
		if (opts && (opts as any).hideCount && opts.viewCount === undefined) {
			this.c.viewCount = !this.c.hideCount;
		}

		let rowLength = table.columns().eq(0).toArray().length;

		this.s = {
			colExists: index < rowLength,
			colOpts: {},
			customPaneSettings: panes,
			displayed: false,
			dt: table,
			dtPane: null,
			firstSet: true,
			index,
			indexes: [],
			listSet: false,
			name: '',
			rowData: {
				arrayFilter: [],
				arrayOriginal: [],
				bins: {},
				binsOriginal: {},
				filterMap: new Map(),
				totalOptions: 0
			},
			scrollTop: 0,
			searchFunction: undefined,
			selections: [],
			serverSelect: [],
			serverSelecting: false,
			tableLength: 0,
			updating: false
		};

		this.s.colOpts = this.s.colExists
			? this._getOptions()
			: this._getBonusOptions();

		this.dom = {
			buttonGroup: Dom.c('div').classAdd(this.classes.buttonGroup),
			clear: Dom.c('button')
				.attr('type', 'button')
				.html('&#215;')
				.attr('disabled', 'true')
				.classAdd(this.classes.disabledButton)
				.classAdd(this.classes.paneButton)
				.classAdd(this.classes.clearButton)
				.attr(
					'aria-label',
					table.i18n(
						'searchPanes.buttons.clearPane',
						this.c.i18n.aria.clearPane
					)
				)
				.html(
					this.s.dt.i18n(
						'searchPanes.clearPane',
						this.c.i18n.clearPane
					)
				),
			collapseButton: Dom.c('button')
				.attr('type', 'button')
				.append(
					Dom.c('span').classAdd(this.classes.caret).html('&#x5e;')
				)
				.classAdd(this.classes.paneButton)
				.classAdd(this.classes.collapseButton)
				.attr(
					'aria-label',
					table.i18n(
						'searchPanes.buttons.collapse',
						this.c.i18n.aria.collapse
					)
				),
			container: Dom.c('div')
				.classAdd(this.classes.container)
				.classAdd(this.s.colOpts.className)
				.classAdd(
					this.classes.layout +
						(parseInt(this.c.layout.split('-')[1], 10) < 10
							? this.c.layout
							: this.c.layout.split('-')[0] + '-9')
				)
				.classAdd(
					this.s.customPaneSettings &&
						this.s.customPaneSettings.className
						? this.s.customPaneSettings.className
						: ''
				),
			countButton: Dom.c('button')
				.attr('type', 'button')
				.append(Dom.c('span'))
				.classAdd(this.classes.paneButton)
				.classAdd(this.classes.countButton)
				.attr(
					'aria-label',
					table.i18n(
						'searchPanes.buttons.orderByCount',
						this.c.i18n.aria.orderByCount
					)
				),
			dtP: Dom.c('table')
				.css('width', '100%')
				.append(
					Dom.c('thead').append(
						Dom.c('tr').append(Dom.c('th')).append(Dom.c('th'))
					)
				),
			lower: Dom.c('div')
				.classAdd(this.classes.subRow2)
				.classAdd(this.classes.narrowButton),
			nameButton: Dom.c('button')
				.attr('type', 'button')
				.append(Dom.c('span'))
				.classAdd(this.classes.paneButton)
				.classAdd(this.classes.nameButton)
				.attr(
					'aria-label',
					table.i18n(
						'searchPanes.buttons.orderByLabel',
						this.c.i18n.aria.orderByLabel
					)
				),
			panesContainer: Dom.s(panesContainer),
			searchBox: Dom.c('input')
				.classAdd(this.classes.paneInputButton)
				.classAdd(this.classes.search),
			searchButton: Dom.c('button')
				.attr('type', 'button')
				.append(Dom.c('span'))
				.classAdd(this.classes.searchIcon)
				.classAdd(this.classes.paneButton)
				.attr(
					'aria-label',
					table.i18n(
						'searchPanes.buttons.clearSearch',
						this.c.i18n.aria.clearSearch
					)
				),
			searchCont: Dom.c('div').classAdd(this.classes.searchCont),
			searchLabelCont: Dom.c('div').classAdd(
				this.classes.searchLabelCont
			),
			topRow: Dom.c('div').classAdd(this.classes.topRow),
			upper: Dom.c('div')
				.classAdd(this.classes.subRow1)
				.classAdd(this.classes.narrowSearch)
		};

		var title = '';

		if (this.s.colExists) {
			title = Dom.s(this.s.dt.column(this.s.index).header()).text();
			this.dom.dtP.find('th').eq(0).text(title);
		}
		else {
			title = this.s.customPaneSettings?.header || 'Custom Pane';

			this.dom.dtP.find('th').eq(0).html(title);
		}

		// Set the value of name in case ordering is desired
		if (this.s.colOpts.name) {
			this.s.name = this.s.colOpts.name;
		}
		else if (this.s.customPaneSettings && this.s.customPaneSettings.name) {
			this.s.name = this.s.customPaneSettings.name;
		}
		else {
			this.s.name = title;
		}

		let tableNode = this.s.dt.table(0).node();

		// Custom search function for table
		this.s.searchFunction = (
			settings: Context,
			searchData: string | string[],
			dataIndex: number
		) => {
			// If no data has been selected then show all
			if (this.s.selections.length === 0) {
				return true;
			}

			if (settings.table !== tableNode) {
				return true;
			}

			let filter: string | string[] = '';

			if (this.s.colExists) {
				// Get the current filtered data
				filter = searchData[this.s.index];

				if (this.s.colOpts.orthogonal?.filter !== 'filter') {
					// get the filter value from the map
					filter = this.s.rowData.filterMap.get(dataIndex);

					if ((filter as any) instanceof DataTable.Api) {
						filter = (filter as any).toArray();
					}
				}
			}

			return this._search(filter, dataIndex);
		};

		DataTable.ext.search.push(this.s.searchFunction);

		// If the clear button for this pane is clicked clear the selections
		if (this.c.clear) {
			this.dom.clear.on('click.dtsp', () => {
				let searches = this.dom.container.find(
					'.' + this.classes.search.replace(/\s+/g, '.')
				);

				searches.each(el => {
					Dom.s(el).val('').trigger('input');
				});

				this.clearPane();
			});
		}

		// Sometimes the top row of the panes containing the search box and
		// ordering buttons appears weird if the width of the panes is lower
		// than expected, this fixes the design. Equally this may occur when the
		// table is resized.
		this.s.dt.on('draw.dtsp', () => this.adjustTopRow());
		this.s.dt.on('buttons-action.dtsp', () => this.adjustTopRow());

		// When column-reorder is present and the columns are moved, it is
		// necessary to reassign all of the panes indexes to the new index of
		// the column.
		this.s.dt.on('column-reorder.dtsp', (e, settings, details) => {
			this.s.index = details.mapping[this.s.index];
		});

		return this;
	}

	/**
	 * Adds a row to the panes table
	 *
	 * @param display the value to be displayed to the user
	 * @param filter the value to be filtered on when searchpanes is implemented
	 * @param shown the number of rows in the table that are currently visible
	 *   matching this criteria
	 * @param total the total number of rows in the table that match this
	 *   criteria
	 * @param sort the value to be sorted in the pane table
	 * @param type the value of which the type is to be derived from
	 */
	public addRow(
		display: string,
		filter: any,
		sort: any,
		type: string,
		className?: string,
		total?: number,
		shown?: number | void
	): any {
		if (!total) {
			total = this.s.rowData.bins[filter]
				? this.s.rowData.bins[filter]
				: 0;
		}
		if (!shown) {
			shown = this._getShown(filter);
		}

		let index: number | undefined;

		for (let entry of this.s.indexes) {
			if (entry.filter === filter) {
				index = entry.index;
			}
		}

		if (index === undefined) {
			index = this.s.indexes.length;
			this.s.indexes.push({ filter, index });
		}

		return this.s.dtPane!.row.add({
			className,
			display: display !== '' ? display : this.emptyMessage(),
			filter,
			index,
			shown,
			sort,
			total,
			type
		});
	}

	/**
	 * Adjusts the layout of the top row when the screen is resized
	 */
	public adjustTopRow(): void {
		let subContainers = this.dom.container.find(
			'.' + this.classes.subRowsContainer.replace(/\s+/g, '.')
		);
		let subRow1 = this.dom.container.find(
			'.' + this.classes.subRow1.replace(/\s+/g, '.')
		);
		let subRow2 = this.dom.container.find(
			'.' + this.classes.subRow2.replace(/\s+/g, '.')
		);
		let topRow = this.dom.container.find(
			'.' + this.classes.topRow.replace(/\s+/g, '.')
		);

		// If the width is 0 then it is safe to assume that the pane has not yet
		// been displayed. Even if it has, if the width is 0 it won't make a
		// difference if it has the narrow class or not
		if (
			(Dom.s(subContainers[0]).width() < 252 ||
				Dom.s(topRow[0]).width() < 252) &&
			Dom.s(subContainers[0]).width() !== 0
		) {
			Dom.s(subContainers[0]).classAdd(this.classes.narrow);
			Dom.s(subRow1[0])
				.classAdd(this.classes.narrowSub)
				.classRemove(this.classes.narrowSearch);
			Dom.s(subRow2[0])
				.classAdd(this.classes.narrowSub)
				.classRemove(this.classes.narrowButton);
		}
		else {
			Dom.s(subContainers[0]).classRemove(this.classes.narrow);
			Dom.s(subRow1[0])
				.classRemove(this.classes.narrowSub)
				.classAdd(this.classes.narrowSearch);
			Dom.s(subRow2[0])
				.classRemove(this.classes.narrowSub)
				.classAdd(this.classes.narrowButton);
		}
	}

	/**
	 * In the case of a rebuild there is potential for new data to have been
	 * included or removed so all of the rowData must be reset as a precaution.
	 */
	public clearData(): void {
		this.s.rowData = {
			arrayFilter: [],
			arrayOriginal: [],
			bins: {},
			binsOriginal: {},
			filterMap: new Map(),
			totalOptions: 0
		};
	}

	/**
	 * Clear the selections in the pane
	 */
	public clearPane(): this {
		// Deselect all rows which are selected and update the table and filter
		// count.
		(this.s.dtPane!.rows({ selected: true }) as any).deselect();
		this.updateTable();

		return this;
	}

	/**
	 * Collapses the pane so that only the header is displayed
	 */
	public collapse(): void {
		if (
			!this.s.dtPane ||
			!this.s.displayed ||
			// If collapsing is disabled globally, and not enabled specifically
			// for this column
			(!this.c.collapse && this.s.colOpts.collapse !== true) ||
			// OR, collapsing could be enabled globally and this column
			// specifically is not to be collapsed. We can't just take
			// !this.s.colOpts.collapse here as if it is undefined then the
			// global should be used
			this.s.colOpts.collapse === false
		) {
			return;
		}

		Dom.s(this.s.dtPane.table().container()).classAdd(this.classes.hidden);
		this.dom.topRow.classAdd(this.classes.bordered);
		this.dom.nameButton.classAdd(this.classes.disabledButton);
		this.dom.countButton.classAdd(this.classes.disabledButton);
		this.dom.searchButton.classAdd(this.classes.disabledButton);
		this.dom.collapseButton.classAdd(this.classes.rotated);

		this.dom.topRow.one('click.dtsp', () => this.show());
		this.dom.topRow.trigger('collapse.dtsps');
	}

	/**
	 * Strips all of the SearchPanes elements from the document and turns all of
	 * the listeners for the buttons off
	 */
	public destroy(): void {
		if (this.s.dtPane) {
			this.s.dtPane.off('.dtsp');
		}

		this.s.dt.off('.dtsp');
		this.dom.clear.off('.dtsp');
		this.dom.nameButton.off('.dtsp');
		this.dom.countButton.off('.dtsp');
		this.dom.searchButton.off('.dtsp');
		this.dom.collapseButton.off('.dtsp');
		Dom.s(this.s.dt.table().node()).off('.dtsp');

		this.dom.container.detach();

		let searchIdx = DataTable.ext.search.indexOf(this.s.searchFunction);

		while (searchIdx !== -1) {
			DataTable.ext.search.splice(searchIdx, 1);
			searchIdx = DataTable.ext.search.indexOf(this.s.searchFunction);
		}

		// If the DataTables have been defined for the panes then also destroy
		// these
		if (this.s.dtPane) {
			this.s.dtPane.destroy();
		}

		this.s.listSet = false;
	}

	/**
	 * Getting the legacy message is a little complex due a legacy parameter
	 */
	public emptyMessage(): string {
		let def = this.c.i18n.emptyMessage;

		// Legacy parameter support
		if (this.c.emptyMessage) {
			def = this.c.emptyMessage;
		}

		// Override per column
		if (this.s.colOpts.emptyMessage) {
			def = this.s.colOpts.emptyMessage;
		}

		return this.s.dt.i18n('searchPanes.emptyMessage', def);
	}

	/**
	 * Updates the number of filters that have been applied in the title
	 */
	public getPaneCount(): number {
		return this.s.dtPane
			? this.s.dtPane.rows({ selected: true }).data().toArray().length
			: 0;
	}

	/**
	 * Rebuilds the panes from the start having deleted the old ones
	 *
	 * @param dataIn data to be used in buildPane
	 * @param maintainSelection Whether the current selections are to be
	 *   maintained over rebuild
	 */
	public rebuildPane(dataIn: any = null, maintainSelection = false): this {
		this.clearData();

		let selectedRows = [];
		this.s.serverSelect = [];
		let prevEl = null;

		// When rebuilding strip all of the HTML Elements out of the container
		// and start from scratch
		if (this.s.dtPane) {
			if (maintainSelection) {
				if (!this.s.dt.page.info().serverSide) {
					selectedRows = this.s.dtPane
						.rows({ selected: true })
						.data()
						.toArray();
				}
				else {
					this.s.serverSelect = this.s.dtPane
						.rows({ selected: true })
						.data()
						.toArray();
				}
			}

			this.s.dtPane.clear().destroy();
			prevEl = this.dom.container[0].previousElementSibling;
			this.destroy();
			this.s.dtPane = null;
			DataTable.ext.search.push(this.s.searchFunction);
		}

		this.dom.container.classRemove(this.classes.hidden);
		this.s.displayed = false;
		this._buildPane(
			!this.s.dt.page.info().serverSide
				? selectedRows
				: this.s.serverSelect,
			dataIn,
			prevEl
		);

		return this;
	}

	/**
	 * Resizes the pane based on the layout that is passed in
	 *
	 * @param layout the layout to be applied to this pane
	 */
	public resize(layout: string): void {
		this.c.layout = layout;
		this.dom.container
			.classRemove()
			.classAdd(this.classes.show)
			.classAdd(this.classes.container)
			.classAdd(this.s.colOpts.className)
			.classAdd(
				this.classes.layout +
					(parseInt(layout.split('-')[1], 10) < 10
						? layout
						: layout.split('-')[0] + '-9')
			)
			.classAdd(
				this.s.customPaneSettings !== null &&
					this.s.customPaneSettings.className
					? this.s.customPaneSettings.className
					: ''
			);
		this.adjustTopRow();

		// Force the width for the table to be 100% - the use of flexbox for the
		// content in each row makes this difficult as the content will expand
		// to fit it, causing the host table to widen and we need to force it
		// smaller.
		this.dom.dtP.css('table-layout', 'fixed');
		this.dom.dtP.css('width', '100%');
		this.dom.dtP.find('colgroup col').css('width', '100%');
	}

	/**
	 * Sets the listeners for the pane.
	 *
	 * Having it in it's own function makes it easier to only set them once
	 */
	public setListeners(): void {
		if (!this.s.dtPane) {
			return;
		}

		// When an item is selected on the pane, add these to the array which
		// holds selected items. Custom search will perform.
		this.s.dtPane.off('select.dtsp').on('select.dtsp', () => {
			clearTimeout(this.s.deselectTimeout);
			this._updateSelection(!this.s.updating);

			this.dom.clear
				.classRemove(this.classes.disabledButton)
				.attrRemove('disabled');
		});

		// When an item is deselected on the pane, re add the currently selected
		// items to the array which holds selected items. Custom search will be
		// performed.
		this.s.dtPane.off('deselect.dtsp').on('deselect.dtsp', () => {
			this.s.deselectTimeout = setTimeout(() => {
				if (!this.s.dtPane) {
					return;
				}

				this._updateSelection(true);

				if (
					this.s.dtPane.rows({ selected: true }).data().toArray()
						.length === 0
				) {
					this.dom.clear
						.classAdd(this.classes.disabledButton)
						.attr('disabled', 'true');
				}
			}, 50);
		});

		// If we attempt to turn off this event then it will ruin behaviour in
		//  other panes so need to make sure that it is only done once
		if (this.s.firstSet) {
			this.s.firstSet = false;
			// When saving the state store all of the selected rows for
			// preselection next time around
			this.s.dt.on('stateSaveParams.dtsp', (e, settings, data) => {
				// If the data being passed in is empty then state clear must
				// have occurred so clear the panes state as well
				if (this.s.dtPane && Object.keys(data).length === 0) {
					this.s.dtPane.state.clear();
					return;
				}

				let bins: { [keys: string]: number } = {};
				let order;
				let selected = [];
				let collapsed: boolean = false;
				let searchTerm: string | number | string[] = '';
				let arrayFilter: IDataArray[] = [];

				// Get all of the data needed for the state save from the pane
				if (this.s.dtPane) {
					selected = this.s.dtPane
						.rows({ selected: true })
						.data()
						.map(item =>
							item.filter !== null ? item.filter.toString() : null
						)
						.toArray();
					searchTerm = this.dom.searchBox.val();
					order = this.s.dtPane.order();
					bins = this.s.rowData.binsOriginal;
					arrayFilter = this.s.rowData.arrayOriginal;
					collapsed = this.dom.collapseButton.classHas(
						this.classes.rotated
					);
				}

				if (data.searchPanes === undefined) {
					data.searchPanes = {};
				}

				if (data.searchPanes.panes === undefined) {
					data.searchPanes.panes = [];
				}

				for (let i = 0; i < data.searchPanes.panes.length; i++) {
					if (data.searchPanes.panes[i].id === this.s.index) {
						data.searchPanes.panes.splice(i, 1);
						i--;
					}
				}

				// Add the panes data to the state object
				data.searchPanes.panes.push({
					arrayFilter,
					bins,
					collapsed,
					id: this.s.index,
					order,
					searchTerm,
					selected
				});
			});
		}

		this.s.dtPane
			.off('user-select.dtsp')
			.on('user-select.dtsp', (e, _dt, type, cell, originalEvent) => {
				originalEvent.stopPropagation();
			});

		this.s.dtPane
			.off('draw.dtsp')
			.on('draw.dtsp', () => this.adjustTopRow());

		// When the button to order by the name of the options is clicked then
		//  change the ordering to whatever it isn't currently
		this.dom.nameButton.off('click.dtsp').on('click.dtsp', () => {
			if (!this.s.dtPane) {
				return;
			}

			let currentOrder = this.s.dtPane.order()[0][1];
			this.s.dtPane
				.order([[0, currentOrder === 'asc' ? 'desc' : 'asc']])
				.draw();
			// This state save is required so that the ordering of the panes is
			// maintained
			this.s.dt.state.save();
		});

		// When the button to order by the number of entries in the column is
		//  clicked then change the ordering to whatever it isn't currently
		this.dom.countButton.off('click.dtsp').on('click.dtsp', () => {
			if (!this.s.dtPane) {
				return;
			}

			let currentOrder = this.s.dtPane.order()[0][1];
			let dir: 'asc' | 'desc' = currentOrder === 'asc' ? 'desc' : 'asc';

			this.s.dtPane
				.order([
					[2, dir],
					[1, dir]
				])
				.draw();
			// This state save is required so that the ordering of the panes is
			// maintained
			this.s.dt.state.save();
		});

		// When the button to order by the number of entries in the column is
		//  clicked then change the ordering to whatever it isn't currently
		this.dom.collapseButton.off('click.dtsp').on('click.dtsp', e => {
			e.stopPropagation();

			if (!this.s.dtPane) {
				return;
			}

			let container = Dom.s(this.s.dtPane.table().container());

			// Toggle the classes
			container.classToggle(this.classes.hidden);
			this.dom.topRow.classToggle(this.classes.bordered);
			this.dom.nameButton.classToggle(this.classes.disabledButton);
			this.dom.countButton.classToggle(this.classes.disabledButton);
			this.dom.searchButton.classToggle(this.classes.disabledButton);
			this.dom.collapseButton.classToggle(this.classes.rotated);

			if (container.classHas(this.classes.hidden)) {
				this.dom.topRow.on('click.dtsp', () =>
					this.dom.collapseButton.trigger('click')
				);
			}
			else {
				this.dom.topRow.off('click.dtsp');
			}

			this.s.dt.state.save();
			this.dom.topRow.trigger('collapse.dtsps');
		});

		// When the clear button is clicked reset the pane
		this.dom.clear.off('click.dtsp').on('click.dtsp', () => {
			let searches = this.dom.container.find(
				'.' + this.classes.search.replace(/ /g, '.')
			);

			searches.each(el => {
				// set the value of the search box to be an empty string and
				// then search on that, effectively resetting
				Dom.s(el).val('').trigger('input');
			});

			this.clearPane();
		});

		// When the search button is clicked then draw focus to the search box
		this.dom.searchButton
			.off('click.dtsp')
			.on('click.dtsp', () => this.dom.searchBox.focus());

		// When a character is inputted into the searchbox search the pane for
		// matching values. Doing it this way means that no button has to be
		// clicked to trigger a search, it is done asynchronously
		this.dom.searchBox.off('click.dtsp').on('input.dtsp', () => {
			if (!this.s.dtPane) {
				return;
			}

			let searchVal = this.dom.searchBox.val();
			this.s.dtPane.search(searchVal).draw();
			if (
				typeof searchVal === 'string' &&
				(searchVal.length > 0 ||
					(searchVal.length === 0 &&
						this.s.dtPane.rows({ selected: true }).data().toArray()
							.length > 0))
			) {
				this.dom.clear
					.classRemove(this.classes.disabledButton)
					.attrRemove('disabled');
			}
			else {
				this.dom.clear
					.classAdd(this.classes.disabledButton)
					.attr('disabled', 'true');
			}

			// This state save is required so that the searching on the panes is
			// maintained
			this.s.dt.state.save();
		});

		let colDtOpts = this.s.colOpts.dtOpts as any;

		(this.s.dtPane as any).select.style(
			colDtOpts && colDtOpts.select && colDtOpts.select.style
				? colDtOpts.select.style
				: this.c.dtOpts &&
				  this.c.dtOpts.select &&
				  this.c.dtOpts.select.style
				? this.c.dtOpts.select.style
				: 'os'
		);
	}

	/**
	 * Populates the SearchPane based off of the data that has been received
	 * from the server
	 *
	 * This method is overridden by SearchPaneST
	 *
	 * @param dataIn The data that has been sent from the server
	 */
	public _serverPopulate(dataIn: { [keys: string]: any }): void {
		if (dataIn.tableLength) {
			this.s.tableLength = dataIn.tableLength;
			this.s.rowData.totalOptions = this.s.tableLength;
		}
		else if (
			this.s.tableLength === null ||
			this.s.dt.rows()[0].length > this.s.tableLength
		) {
			this.s.tableLength = this.s.dt.rows()[0].length;
			this.s.rowData.totalOptions = this.s.tableLength;
		}

		let colTitle = this.s.dt.column(this.s.index).dataSrc().toString();

		// If there is SP data for this column add it to the data array and bin
		if (dataIn.searchPanes.options[colTitle]) {
			for (let dataPoint of dataIn.searchPanes.options[colTitle]) {
				this.s.rowData.arrayFilter.push({
					display: dataPoint.label,
					filter: dataPoint.value,
					sort: dataPoint.label,
					type: dataPoint.label
				});

				this.s.rowData.bins[dataPoint.value] = dataPoint.total;
			}
		}

		let binLength = Object.keys(this.s.rowData.bins).length;
		let uniqueRatio = this._uniqueRatio(binLength, this.s.tableLength);

		// Don't show the pane if there isn't enough variance in the data, or
		// there is only 1 entry for that pane
		if (
			this.s.displayed === false &&
			((this.s.colOpts.show === undefined &&
			this.s.colOpts.threshold === null
				? uniqueRatio > this.c.threshold
				: this.s.colOpts.threshold &&
				  uniqueRatio > this.s.colOpts.threshold) ||
				(this.s.colOpts.show !== true && binLength <= 1))
		) {
			this.dom.container.classAdd(this.classes.hidden);
			this.s.displayed = false;
			return;
		}

		// Store the original data
		this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
		this.s.rowData.binsOriginal = this.s.rowData.bins;

		// Flag this pane as being displayed
		this.s.displayed = true;
	}

	/**
	 * Expands the pane from the collapsed state
	 */
	public show(): void {
		if (!this.s.displayed || !this.s.dtPane) {
			return;
		}

		this.dom.topRow.classRemove(this.classes.bordered);
		this.dom.nameButton.classRemove(this.classes.disabledButton);
		this.dom.countButton.classRemove(this.classes.disabledButton);
		this.dom.searchButton.classRemove(this.classes.disabledButton);
		this.dom.collapseButton.classRemove(this.classes.rotated);
		Dom.s(this.s.dtPane.table().container()).classRemove(
			this.classes.hidden
		);

		this.dom.topRow.trigger('collapse.dtsps');
	}

	/**
	 * Finds the ratio of the number of different options in the table to the
	 * number of rows
	 *
	 * @param bins the number of different options in the table
	 * @param rowCount the total number of rows in the table
	 * @returns {number} returns the ratio
	 */
	public _uniqueRatio(bins: number, rowCount: number): number {
		if (
			rowCount > 0 &&
			((this.s.rowData.totalOptions > 0 &&
				!this.s.dt.page.info().serverSide) ||
				(this.s.dt.page.info().serverSide && this.s.tableLength > 0))
		) {
			return bins / this.s.rowData.totalOptions;
		}

		return 1;
	}

	/**
	 * Updates the panes if one of the options to do so has been set to true
	 * rather than the filtered message when using viewTotal.
	 */
	public updateTable(): void {
		if (!this.s.dtPane) {
			return;
		}

		let selectedRows = this.s.dtPane
			.rows({ selected: true })
			.data()
			.toArray()
			.map(el => el.filter);
		this.s.selections = selectedRows;
		this._searchExtras();
	}

	/**
	 * Adds the custom options to the pane
	 *
	 * @returns {Array} Returns the array of rows which have been added to the
	 *   pane
	 */
	protected _getComparisonRows(): any[] {
		if (!this.s.dtPane) {
			return [];
		}

		// Find the appropriate options depending on whether this is a pane for
		// a specific column or a custom pane
		let options = this.s.colOpts.options
			? this.s.colOpts.options
			: this.s.customPaneSettings && this.s.customPaneSettings.options
			? this.s.customPaneSettings.options
			: undefined;

		if (options === undefined) {
			return [];
		}

		let allRows = this.s.dt.rows();
		let tableValsTotal = allRows.data().toArray();
		let rows = [];
		// Clear all of the other rows from the pane, only custom options are to
		// be displayed when they are defined
		this.s.dtPane.clear();
		this.s.indexes = [];

		for (let comp of options) {
			// Initialise the object which is to be placed in the row
			let insert = comp.label !== '' ? comp.label : this.emptyMessage();
			let comparisonObj = {
				className: comp.className,
				display: insert,
				filter:
					typeof comp.value === 'function'
						? comp.value
						: ([] as string[]),
				sort: comp.order !== undefined ? comp.order : insert,
				total: 0,
				type: insert
			};

			// If a custom function is in place
			if (typeof comp.value === 'function') {
				// Count the number of times the function evaluates to true for
				// the original data in the Table
				for (let i = 0; i < tableValsTotal.length; i++) {
					if (
						comp.value.call(
							this.s.dt,
							tableValsTotal[i],
							allRows[0][i]
						)
					) {
						comparisonObj.total++;
					}
				}

				// Update the comparisonObj
				if (typeof comparisonObj.filter !== 'function' && comp.filter) {
					comparisonObj.filter.push(comp.filter);
				}
			}

			rows.push(
				this.addRow(
					comparisonObj.display,
					comparisonObj.filter,
					comparisonObj.sort,
					comparisonObj.type,
					comparisonObj.className,
					comparisonObj.total
				)
			);
		}

		return rows;
	}

	protected _getMessage(row: { [keys: string]: any }): string {
		return this.s.dt
			.i18n('searchPanes.count', this.c.i18n.count)
			.replace(/{total}/g, row.total);
	}

	/**
	 * Overridden in SearchPaneViewTotal and SearchPaneCascade to get the number
	 * of times a specific value is shown
	 *
	 * Here it is blanked so that it takes no action
	 *
	 * @param filter The filter value
	 * @returns undefined
	 */
	protected _getShown(filter: any): number | void {
		// no op
	}

	/**
	 * Get's the pane config appropriate to this class
	 *
	 * @returns The config needed to create a pane of this type
	 */
	protected _getPaneConfig(): { [keys: string]: any } {
		// eslint-disable-next-line no-extra-parens
		let haveScroller = (DataTable as any).Scroller;

		let langOpts = this.s.dt.settings()[0].language;
		langOpts.url = '';

		return {
			columnDefs: [
				{
					className: 'dtsp-nameColumn',
					data: 'display',
					render: (data: any, type: string, row: any) => {
						if (type === 'sort') {
							return row.sort;
						}
						else if (type === 'type') {
							return row.type;
						}

						let message = this._getMessage(row);

						// We are displaying the count in the same column as
						// the name of the search option. This is so that there
						// is not need to call columns.adjust() which in turn
						// speeds up the code
						let pill =
							'<span class="' +
							this.classes.pill +
							'">' +
							message +
							'</span>';

						if (!this.c.viewCount || !this.s.colOpts.viewCount) {
							pill = '';
						}

						if (type === 'filter') {
							return typeof data === 'string' &&
								data.match(/<[^>]*>/) !== null
								? data.replace(/<[^>]*>/g, '')
								: data;
						}

						return (
							'<div class="' +
							this.classes.nameCont +
							'"><span title="' +
							(typeof data === 'string' &&
							data.match(/<[^>]*>/) !== null
								? data.replace(/<[^>]*>/g, '')
								: data) +
							'" class="' +
							this.classes.name +
							'">' +
							data +
							'</span>' +
							pill +
							'</div>'
						);
					},
					targets: 0,
					// Accessing the private DataTables property to set type
					// based on the original table. This is null if not defined
					// by the user, meaning that automatic type detection would
					// take place
					type: this.s.dt.settings()[0].columns[this.s.index]
						? this.s.dt.settings()[0].columns[this.s.index]
								.typeManual
						: null
				},
				{
					className: 'dtsp-countColumn ' + this.classes.badgePill,
					data: 'total',
					searchable: false,
					targets: 1,
					visible: false
				},
				{
					data: 'shown',
					searchable: false,
					targets: 2,
					visible: false,
					defaultContent: 0
				}
			],
			deferRender: true,
			info: false,
			language: langOpts,
			paging: haveScroller ? true : false,
			scrollX: false,
			scrollY: '200px',
			scroller: haveScroller ? true : false,
			select: true,
			stateSave: this.s.dt.settings()[0].features.stateSave ? true : false
		};
	}

	/**
	 * This method allows for changes to the panes and table to be made when a
	 * selection or a deselection occurs
	 */
	protected _makeSelection(): void {
		this.updateTable();
		this.s.updating = true;
		this.s.dt.draw();
		this.s.updating = false;
	}

	/**
	 * Populates an array with all of the data for the table
	 *
	 * @param rowIdx The current row index to be compared
	 * @param arrayFilter The array that is to be populated with row Details
	 * @param settings The DataTable settings object
	 * @param bins The bins object that is to be populated with the row counts
	 */
	protected _populatePaneArray(
		rowIdx: number,
		arrayFilter: any[],
		settings: Context,
		bins: { [keys: string]: number } = this.s.rowData.bins
	): void {
		// Retrieve the rendered data from the cell using the fastData function
		// rather than the cell().render API method for optimisation
		let fastData = settings.fastData;

		if (typeof this.s.colOpts.orthogonal === 'string') {
			let rendered = fastData(
				rowIdx,
				this.s.index,
				this.s.colOpts.orthogonal
			);
			this.s.rowData.filterMap.set(rowIdx, rendered);
			this._addOption(
				rendered,
				rendered,
				rendered,
				rendered,
				arrayFilter,
				bins
			);
			this.s.rowData.totalOptions++;
		}
		else {
			let filter = fastData(
				rowIdx,
				this.s.index,
				this.s.colOpts.orthogonal?.search || ''
			);

			// Null and empty string are to be considered the same value
			if (filter === null) {
				filter = '';
			}

			if (typeof filter === 'string') {
				filter = filter.replace(/<[^>]*>/g, '');
			}

			this.s.rowData.filterMap.set(rowIdx, filter);

			if (!bins[filter]) {
				this._addOption(
					filter,
					fastData(
						rowIdx,
						this.s.index,
						this.s.colOpts.orthogonal?.display || ''
					),
					fastData(
						rowIdx,
						this.s.index,
						this.s.colOpts.orthogonal?.sort || ''
					),
					fastData(
						rowIdx,
						this.s.index,
						this.s.colOpts.orthogonal?.type || ''
					),
					arrayFilter,
					bins
				);
				this.s.rowData.totalOptions++;
			}
			else {
				bins[filter]++;
				this.s.rowData.totalOptions++;
			}
		}
	}

	/**
	 * Reloads all of the previous selects into the panes
	 *
	 * @param loadedFilter The loaded filters from a previous state
	 */
	protected _reloadSelect(loadedFilter: { [keys: string]: any }): void {
		// If the state was not saved don't selected any
		if (loadedFilter === undefined || !this.s.dtPane) {
			return;
		}

		let idx: number | null = null;

		// For each pane, check that the loadedFilter list exists and is not
		// null, find the id of each search item and set it to be selected.
		for (let i = 0; i < loadedFilter.searchPanes.panes.length; i++) {
			if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
				idx = i;
				break;
			}
		}

		if (idx !== null) {
			let table = this.s.dtPane;
			let rows = table
				.rows({ order: 'index' })
				.data()
				.map(item =>
					item.filter !== null ? item.filter.toString() : null
				)
				.toArray();

			for (let filter of loadedFilter.searchPanes.panes[idx].selected) {
				let id = -1;

				if (filter !== null) {
					id = rows.indexOf(filter.toString());
				}

				if (id > -1) {
					this.s.serverSelecting = true;
					(table.row(id) as any).select();
					this.s.serverSelecting = false;
				}
			}
		}
	}

	/**
	 * Notes the rows that have been selected within this pane and stores them
	 * internally
	 *
	 * @param notUpdating Whether the panes are updating themselves or not
	 */
	public _updateSelection(notUpdating: boolean): void {
		let run = () => {
			if (!this.s.dtPane) {
				return;
			}

			this.s.scrollTop = Dom.s(
				this.s.dtPane.table().node()
			).parent()[0].scrollTop;

			if (this.s.dt.page.info().serverSide && !this.s.updating) {
				if (!this.s.serverSelecting) {
					this.s.serverSelect = this.s.dtPane
						.rows({ selected: true })
						.data()
						.toArray();
					this.s.dt.draw(false);
				}
			}
			else if (notUpdating) {
				this._makeSelection();
			}

			this.s.dt.processing(false);
		};

		this.s.dt.processing(true);
		setTimeout(run, 1);
	}

	/**
	 * Takes in potentially undetected rows and adds them to the array if they
	 * are not yet featured
	 *
	 * @param filter the filter value of the potential row
	 * @param display the display value of the potential row
	 * @param sort the sort value of the potential row
	 * @param type the type value of the potential row
	 * @param arrayFilter the array to be populated
	 * @param bins the bins to be populated
	 */
	private _addOption(
		filter: any,
		display: any,
		sort: any,
		type: string,
		arrayFilter: any[],
		bins: { [keys: string]: number }
	): void {
		// If the filter is an array then take a note of this, and add the
		// elements to the arrayFilter array
		if (Array.isArray(filter) || filter instanceof DataTable.Api) {
			// Convert to an array so that we can work with it
			if (filter instanceof DataTable.Api) {
				filter = filter.toArray();
				display = display.toArray();
			}

			if (filter.length === display.length) {
				for (let i = 0; i < filter.length; i++) {
					// If we haven't seen this row before add it
					if (!bins[filter[i]]) {
						bins[filter[i]] = 1;
						arrayFilter.push({
							display: display[i],
							filter: filter[i],
							sort: sort[i],
							type: type[i]
						});
					}
					// Otherwise just increment the count
					else {
						bins[filter[i]]++;
					}
					this.s.rowData.totalOptions++;
				}
				return;
			}

			throw new Error('display and filter not the same length');
		}
		// If the values were affected by orthogonal data and are not an array
		// then check if it is already present
		else if (typeof this.s.colOpts.orthogonal === 'string') {
			if (!bins[filter]) {
				bins[filter] = 1;
				arrayFilter.push({
					display,
					filter,
					sort,
					type
				});

				this.s.rowData.totalOptions++;
			}
			else {
				bins[filter]++;
				this.s.rowData.totalOptions++;
			}
		}
		// Otherwise we must just be adding an option
		else {
			bins[filter] = 1;
			arrayFilter.push({
				display,
				filter,
				sort,
				type
			});
		}
	}

	/**
	 * Method to construct the actual pane.
	 *
	 * @param selectedRows previously selected Rows to be reselected
	 * @param dataIn Data that should be used to populate this pane
	 * @param prevEl Reference to the previous element, used to ensure insert is
	 *   in the correct location
	 * @returns boolean to indicate whether this pane was the last one to have a
	 *   selection made
	 */
	private _buildPane(
		selectedRows: any[] = [],
		dataIn: AjaxResponse | null = null,
		prevEl: Element | null = null
	): boolean {
		// Aliases
		this.s.selections = [];

		// Other Variables
		let loadedFilter = this.s.dt.state.loaded();
		let row;

		// If the listeners have not been set yet then using the latest state
		// may result in funny errors
		if (this.s.listSet) {
			loadedFilter = this.s.dt.state();
		}

		// If it is not a custom pane in place
		if (this.s.colExists) {
			let idx = -1;

			if (
				loadedFilter &&
				loadedFilter.searchPanes &&
				loadedFilter.searchPanes.panes
			) {
				for (
					let i = 0;
					i < loadedFilter.searchPanes.panes.length;
					i++
				) {
					if (loadedFilter.searchPanes.panes[i].id === this.s.index) {
						idx = i;
						break;
					}
				}
			}

			// Perform checks that do not require populate pane to run
			if (
				(this.s.colOpts.show === false ||
					(this.s.colOpts.show !== undefined &&
						this.s.colOpts.show !== true)) &&
				idx === -1
			) {
				this.dom.container.classAdd(this.classes.hidden);
				this.s.displayed = false;
				return false;
			}
			else if (this.s.colOpts.show === true || idx !== -1) {
				this.s.displayed = true;
			}

			if (
				!this.s.dt.page.info().serverSide &&
				(!dataIn || !dataIn.searchPanes || !dataIn.searchPanes.options)
			) {
				// Only run populatePane if the data has not been collected yet
				if (this.s.rowData.arrayFilter.length === 0) {
					this.s.rowData.totalOptions = 0;
					this._populatePane();
					this.s.rowData.arrayOriginal = this.s.rowData.arrayFilter;
					this.s.rowData.binsOriginal = this.s.rowData.bins;
				}

				let binLength = Object.keys(this.s.rowData.binsOriginal).length;
				let uniqueRatio = this._uniqueRatio(
					binLength,
					this.s.dt.rows()[0].length
				);

				// Don't show the pane if there isn't enough variance in the
				//  data, or there is only 1 entry for that pane
				let colOptsThreshold = this.s.colOpts.threshold;

				if (
					this.s.displayed === false &&
					((this.s.colOpts.show === undefined &&
					colOptsThreshold === null
						? uniqueRatio > this.c.threshold
						: colOptsThreshold && uniqueRatio > colOptsThreshold) ||
						(this.s.colOpts.show !== true && binLength <= 1))
				) {
					this.dom.container.classAdd(this.classes.hidden);
					this.s.displayed = false;
					return false;
				}

				this.dom.container.classAdd(this.classes.show);
				this.s.displayed = true;
			}
			else if (
				dataIn &&
				dataIn.searchPanes &&
				dataIn.searchPanes.options
			) {
				this._serverPopulate(dataIn);
			}
		}
		else {
			this.s.displayed = true;
		}

		// If the variance is acceptable then display the search pane
		this._displayPane();

		if (!this.s.listSet) {
			// Here, when the state is loaded if the data object on the original
			// table is empty, then a state.clear() must have occurred, so
			// delete all of the panes tables state objects too.
			this.dom.dtP.on(
				'stateLoadParams.dtsp',
				(e: Event, settings: Context, data: StateLoad) => {
					if (
						Object.keys(this.s.dt.state.loaded() || {}).length === 0
					) {
						Object.keys(data).forEach(key => {
							delete (data as any)[key];
						});
					}
				}
			);
		}

		// Add the container to the document in its original location
		if (prevEl !== null && this.dom.panesContainer[0].contains(prevEl)) {
			this.dom.container.insertAfter(prevEl);
		}
		else {
			this.dom.panesContainer.prepend(this.dom.container);
		}

		// Declare the DataTable for the pane
		let errMode = DataTable.ext.errMode;
		DataTable.ext.errMode = 'none';

		// For async loading of a DataTable (e.g. language file) we need to set
		// the select style to make sure the event handlers are added.
		this.dom.dtP.on('init.dt', (e, s) => {
			var dt = new DataTable.Api(this.dom.dtP) as any;
			var style = dt.select.style();

			dt.select.style(style);
		});

		let layout;

		// We need to modify the layout default to null all entries, keeping in
		// mind that the default might have been modified by the dev using DT,
		// so it needs to be dynamic.
		let cloned = util.object.assignDeep(
			{},
			DataTable.defaults.layout
		) as any;

		Object.keys(cloned).forEach(key => {
			cloned[key] = null;
		});

		layout = { layout: cloned };

		this.s.dtPane = new DataTable(
			this.dom.dtP[0],
			util.object.assignDeep(
				this._getPaneConfig(),
				this.c.dtOpts,
				this.s.colOpts ? this.s.colOpts.dtOpts : {},
				this.s.colOpts.options || !this.s.colExists
					? {
							createdRow(row: HTMLElement, data: any) {
								Dom.s(row).classAdd(data.className);
							}
					  }
					: undefined,
				this.s.customPaneSettings !== null &&
					this.s.customPaneSettings.dtOpts
					? this.s.customPaneSettings.dtOpts
					: {},
				layout
			)
		);

		this.dom.dtP.classAdd(this.classes.table);

		// Getting column titles is a little messy
		let headerText = 'Custom Pane';

		if (this.s.customPaneSettings && this.s.customPaneSettings.header) {
			headerText = this.s.customPaneSettings.header;
		}
		else if (this.s.colOpts.header) {
			headerText = this.s.colOpts.header;
		}
		else if (this.s.colExists) {
			headerText = this.s.dt.column(this.s.index).title();
		}

		headerText = this._escapeHTML(headerText);
		let titleText = this.s.dt
			.i18n('searchBuilder.searchTitle', this.c.i18n.searchTitle)
			.replace('{name}', headerText);

		this.dom.searchBox
			.attr('placeholder', headerText)
			.attr('title', titleText);

		DataTable.ext.errMode = errMode;

		// If it is not a custom pane
		if (this.s.colExists) {
			// Add all of the search options to the pane
			for (
				let j = 0, jen = this.s.rowData.arrayFilter.length;
				j < jen;
				j++
			) {
				if (this.s.dt.page.info().serverSide) {
					row = this.addRow(
						this.s.rowData.arrayFilter[j].display,
						this.s.rowData.arrayFilter[j].filter,
						this.s.rowData.arrayFilter[j].sort,
						this.s.rowData.arrayFilter[j].type
					);

					for (let option of this.s.serverSelect) {
						if (
							option.filter ===
							this.s.rowData.arrayFilter[j].filter
						) {
							this.s.serverSelecting = true;
							row.select();
							this.s.serverSelecting = false;
						}
					}
				}
				else if (
					!this.s.dt.page.info().serverSide &&
					this.s.rowData.arrayFilter[j]
				) {
					this.addRow(
						this.s.rowData.arrayFilter[j].display,
						this.s.rowData.arrayFilter[j].filter,
						this.s.rowData.arrayFilter[j].sort,
						this.s.rowData.arrayFilter[j].type
					);
				}
				else if (!this.s.dt.page.info().serverSide) {
					// Just pass an empty string as the message will be
					// calculated based on that in addRow()
					this.addRow('', '', '', '');
				}
			}
		}

		// If there are custom options set or it is a custom pane then get them
		if (
			this.s.colOpts.options ||
			(this.s.customPaneSettings && this.s.customPaneSettings.options)
		) {
			this._getComparisonRows();
		}

		// Display the pane
		this.s.dtPane.draw();
		this.s.dtPane.table().node().parentElement!.scrollTop =
			this.s.scrollTop;
		this.adjustTopRow();
		this.setListeners();
		this.s.listSet = true;

		for (let selection of selectedRows) {
			if (selection) {
				for (row of this.s.dtPane.rows().indexes().toArray()) {
					if (
						this.s.dtPane.row(row).data() &&
						selection.filter ===
							this.s.dtPane.row(row).data().filter
					) {
						// If this is happening when serverSide processing is
						//  happening then different behaviour is needed
						if (this.s.dt.page.info().serverSide) {
							this.s.serverSelecting = true;
							(this.s.dtPane.row(row) as any).select();
							this.s.serverSelecting = false;
						}
						else {
							(this.s.dtPane.row(row) as any).select();
						}
					}
				}
			}
		}

		//  If SSP and the table is ready, apply the search for the pane
		if (this.s.dt.page.info().serverSide) {
			this.s.dtPane.search(this.dom.searchBox.val()).draw();
		}

		if (
			((this.c.initCollapsed && this.s.colOpts.initCollapsed !== false) ||
				this.s.colOpts.initCollapsed) &&
			((this.c.collapse && this.s.colOpts.collapse !== false) ||
				this.s.colOpts.collapse)
		) {
			// If the pane has not initialised yet then we need to wait for it
			// to do so before collapsing Otherwise the container that the class
			// is added to does not exist
			this.s.dtPane.ready(() => {
				this.collapse();
			});
		}

		// Reload the selection, searchbox entry and ordering from the previous
		// state Need to check here if SSP that this is the first draw,
		// otherwise it will infinite loop
		if (
			loadedFilter &&
			loadedFilter.searchPanes &&
			loadedFilter.searchPanes.panes &&
			(!dataIn || dataIn.draw === 1)
		) {
			this._reloadSelect(loadedFilter);

			for (let pane of loadedFilter.searchPanes.panes) {
				if (pane.id === this.s.index) {
					// Save some time by only triggering an input if there is a
					// value
					if (pane.searchTerm && pane.searchTerm.length > 0) {
						this.dom.searchBox
							.val(pane.searchTerm)
							.trigger('input');
					}

					if (pane.order) {
						this.s.dtPane.order(pane.order).draw();
					}

					// Is the pane to be hidden or shown?
					if (pane.collapsed) {
						this.collapse();
					}
					else {
						this.show();
					}
				}
			}
		}

		return true;
	}

	/**
	 * Appends all of the HTML elements to their relevant parent Elements
	 */
	private _displayPane(): void {
		// Empty everything to start again
		this.dom.dtP.empty();
		this.dom.topRow.empty().classAdd(this.classes.topRow);

		// If there are more than 3 columns defined then make there be a smaller
		// gap between the panes
		if (parseInt(this.c.layout.split('-')[1], 10) > 3) {
			this.dom.container.classAdd(this.classes.smallGap);
		}

		this.dom.topRow
			.classAdd(this.classes.subRowsContainer)
			.append(this.dom.upper.append(this.dom.searchCont))
			.append(this.dom.lower.append(this.dom.buttonGroup));

		// If no selections have been made in the pane then disable the clear
		// button
		if (
			this.c.dtOpts.searching === false ||
			(this.s.colOpts.dtOpts &&
				this.s.colOpts.dtOpts.searching === false) ||
			!this.c.controls ||
			!this.s.colOpts.controls ||
			(this.s.customPaneSettings &&
				this.s.customPaneSettings.dtOpts &&
				this.s.customPaneSettings.dtOpts.searching !== undefined &&
				!this.s.customPaneSettings.dtOpts.searching)
		) {
			this.dom.searchBox
				.classRemove(this.classes.paneInputButton)
				.classAdd(this.classes.disabledButton)
				.attr('disabled', 'true');
		}

		this.dom.searchBox.appendTo(this.dom.searchCont);

		// Create the contents of the searchCont div. Worth noting that this
		// function will change when using semantic ui
		this._searchContSetup();

		// If the clear button is allowed to show then display it
		if (this.c.clear && this.c.controls && this.s.colOpts.controls) {
			this.dom.clear.appendTo(this.dom.buttonGroup);
		}

		if (
			this.c.orderable &&
			this.s.colOpts.orderable &&
			this.c.controls &&
			this.s.colOpts.controls
		) {
			this.dom.nameButton.appendTo(this.dom.buttonGroup);
		}

		// If the count column is hidden then don't display the ordering button
		// for it
		if (
			this.c.viewCount &&
			this.s.colOpts.viewCount &&
			this.c.orderable &&
			this.s.colOpts.orderable &&
			this.c.controls &&
			this.s.colOpts.controls
		) {
			this.dom.countButton.appendTo(this.dom.buttonGroup);
		}

		if (
			((this.c.collapse && this.s.colOpts.collapse !== false) ||
				this.s.colOpts.collapse) &&
			this.c.controls &&
			this.s.colOpts.controls
		) {
			this.dom.collapseButton.appendTo(this.dom.buttonGroup);
		}

		this.dom.container.prepend(this.dom.topRow).append(this.dom.dtP).show();
	}

	/**
	 * Escape html characters within a string
	 *
	 * @param txt the string to be escaped
	 * @returns the escaped string
	 */
	private _escapeHTML(txt: string): string {
		return txt
			.toString()
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&');
	}

	/**
	 * Gets the options for the row for the customPanes
	 *
	 * @returns The options for the row extended to include the options
	 *   from the user.
	 */
	private _getBonusOptions(): SPColumnOptions {
		// We need to reset the thresholds as if they have a value in colOpts
		// then that value will be used
		let defaultMutator = {
			threshold: null
		};

		return util.object.assignDeep(
			{},
			SearchPane.defaults,
			defaultMutator,
			this.c ? this.c : {}
		);
	}

	/**
	 * Gets the options for the row for the customPanes
	 *
	 * @returns The options for the row extended to include the options
	 *   from the user.
	 */
	private _getOptions(): SPColumnOptions {
		let table = this.s.dt;
		// We need to reset the thresholds as if they have a value in colOpts
		// then that value will be used
		let defaultMutator = {
			collapse: null,
			emptyMessage: false,
			initCollapsed: null,
			threshold: null
		};
		let columnOptions =
			table.settings()[0].columns[this.s.index].searchPanes;

		let colOpts = util.object.assignDeep<SPColumnOptions>(
			{},
			SearchPane.defaults,
			defaultMutator,
			columnOptions
		);

		// Legacy support
		if (
			columnOptions &&
			(columnOptions as any).hideCount &&
			columnOptions.viewCount === undefined
		) {
			colOpts.viewCount = !(columnOptions as any).hideCount;
		}

		return colOpts;
	}

	/**
	 * Fill the array with the values that are currently being displayed in the
	 * table
	 */
	private _populatePane(): void {
		this.s.rowData.arrayFilter = [];
		this.s.rowData.bins = {};
		let settings = this.s.dt.context[0];

		if (!this.s.dt.page.info().serverSide) {
			for (let index of this.s.dt.rows().indexes().toArray()) {
				this._populatePaneArray(
					index,
					this.s.rowData.arrayFilter,
					settings
				);
			}
		}
	}

	/**
	 * This method decides whether a row should contribute to the pane or not
	 *
	 * @param filter the value that the row is to be filtered on
	 * @param dataIndex the row index
	 */
	private _search(filter: any, dataIndex: number): boolean {
		let colOpts = this.s.colOpts;
		let table = this.s.dt;

		// For each item selected in the pane, check if it is available in the
		// cell
		for (let colSelect of this.s.selections) {
			if (typeof colSelect === 'string' && typeof filter === 'string') {
				// The filter value will not have the &amp; in place but a &,
				// so we need to do a replace to make sure that they will match
				colSelect = this._escapeHTML(colSelect);
			}

			// if the filter is an array then is the column present in it
			if (Array.isArray(filter)) {
				if (colOpts.combiner === 'and') {
					if (!filter.includes(colSelect)) {
						return false;
					}
				}
				else if (filter.includes(colSelect)) {
					return true;
				}
			}
			// if the filter is a function then does it meet the criteria of
			// that function or not
			else if (typeof colSelect === 'function') {
				if (
					colSelect.call(
						table,
						table.row(dataIndex).data(),
						dataIndex
					)
				) {
					if (colOpts.combiner === 'or') {
						return true;
					}
				}
				// If the combiner is an "and" then we need to check against all
				// possible selections so if it fails here then the and is not
				// met and return false
				else if (colOpts.combiner === 'and') {
					return false;
				}
			}
			// otherwise if the two filter values are equal then return true
			else if (
				filter === colSelect ||
				// Loose type checking in case number type in column comparing to
				// a string eslint-disable-next-line eqeqeq
				(!(typeof filter === 'string' && filter.length === 0) &&
					filter == colSelect) ||
				(colSelect === null &&
					typeof filter === 'string' &&
					filter === '')
			) {
				return true;
			}
		}

		// If the combiner is an and then we need to check against all possible
		// selections so return true here if so because it would have returned
		// false earlier if it had failed
		if (colOpts.combiner === 'and') {
			return true;
		}

		// Otherwise it hasn't matched with anything by this point so it must be
		// false
		return false;
	}

	/**
	 * Creates the contents of the searchCont div
	 *
	 * NOTE This is overridden when semantic ui styling in order to integrate
	 * the search button into the text box.
	 */
	public _searchContSetup(): void {
		if (this.c.controls && this.s.colOpts.controls) {
			this.dom.searchButton.appendTo(this.dom.searchLabelCont);
		}

		if (
			!(
				this.c.dtOpts.searching === false ||
				(this.s.colOpts.dtOpts &&
					this.s.colOpts.dtOpts.searching === false) ||
				(this.s.customPaneSettings &&
					this.s.customPaneSettings.dtOpts &&
					this.s.customPaneSettings.dtOpts.searching !== undefined &&
					!this.s.customPaneSettings.dtOpts.searching)
			)
		) {
			this.dom.searchLabelCont.appendTo(this.dom.searchCont);
		}
	}

	/**
	 * Adds outline to the pane when a selection has been made
	 */
	private _searchExtras(): void {
		if (!this.s.dtPane) {
			return;
		}

		let updating = this.s.updating;
		this.s.updating = true;
		let filters = this.s.dtPane
			.rows({ selected: true })
			.data()
			.pluck('filter')
			.toArray();
		let nullIndex = filters.indexOf(this.emptyMessage());
		let container = Dom.s(this.s.dtPane.table().container());

		// If null index is found then search for empty cells as a filter.
		if (nullIndex > -1) {
			filters[nullIndex] = '';
		}

		// If a filter has been applied then outline the respective pane, remove it when it no longer is.
		if (filters.length > 0) {
			container.classAdd(this.classes.selected);
		}
		else if (filters.length === 0) {
			container.classRemove(this.classes.selected);
		}

		this.s.updating = updating;
	}
}
