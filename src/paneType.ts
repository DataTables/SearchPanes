export interface IClasses {
	badgePill?: string;
	buttonGroup: string;
	buttonSub: string;
	clear: string;
	clearAll: string;
	clearButton: string;
	container: string;
	countButton: string;
	disabledButton: string;
	dull: string;
	hidden: string;
	hide: string;
	layout: string;
	name: string;
	nameButton: string;
	narrow: string;
	narrowButton?: string;
	narrowSearch?: string;
	narrowSub?: string;
	paneButton: string;
	paneInputButton: string;
	pill: string;
	search: string;
	searchCont: string;
	searchIcon: string;
	searchLabelCont: string;
	selected: string;
	show?: string;
	smallGap: string;
	subRow1: string;
	subRow2: string;
	subRowsContainer: string;
	table?: string;
	title: string;
	topRow: string;
}

export interface IConfigPaneItem {
	className: string;
	dtOpts: {[keys: string]: any}; // All dtOpts
	header: string;
	options: IOption[];
}

export interface IDataArray {
	display: any;
	filter: any;
	sort: any;
	type: any;
}

export interface IDefaults {
	cascadePanes: boolean;
	clear: boolean;
	combiner: string;
	container: any; // Function?
	controls: boolean;
	dataLength: number;
	dtOpts: {[keys: string]: any}; // All dtOpts
	emptyMessage: string;
	hideCount: boolean;
	layout: string;
	orderable: boolean;
	orthogonal: IOrthogonal;
	preSelect: any;
	threshold: number;
	viewTotal: boolean;
}

export interface IDOM {
	buttonGroup: JQuery<HTMLElement>;
	clear: JQuery<HTMLElement>;
	container: any; // Container Method needs to return a JQuery
	countButton: JQuery<HTMLElement>;
	dtP: JQuery<HTMLElement>;
	lower: JQuery<HTMLElement>;
	nameButton: JQuery<HTMLElement>;
	searchButton: JQuery<HTMLElement>;
	searchBox: JQuery<HTMLElement>;
	searchCont: JQuery<HTMLElement>;
	searchLabelCont: JQuery<HTMLElement>;
	topRow: JQuery<HTMLElement>;
	upper: JQuery<HTMLElement>;
}

export interface IIndexes {
	filter: any; // Could be anything that is stored in the filter
	index: number;
}

export interface IOption {
	label: string;
	values: any; // Function?
}

export interface IOrthogonal {
	display: string;
	hideCount: boolean;
	search: string;
	show: boolean;
	sort: string;
	threshold: number;
	type: string;
}

export interface IRowData {
	arrayFilter: IDataArray[];
	arrayOriginal: IDataArray[];
	arrayTotals: IDataArray[];
	bins: {[keys: string]: number};
	binsOriginal: {[keys: string]: number};
	binsTotal: {[keys: string]: number};
	filterMap: Map<number, any>;
}

export interface IS {
	cascadeRegen: boolean;
	clearing: boolean;
	colOpts: any;
	deselect: boolean;
	displayed: boolean;
	dt: any; // Parent DataTable
	dtPane: any; // Pane DataTable Instance
	filteringActive: boolean;
	index: number;
	indexes: IIndexes[];
	lastSelect: boolean;
	redraw: boolean;
	rowData: IRowData;
	searchFunction: any; // Function?
	selectPresent: boolean;
	updating: boolean;
}
