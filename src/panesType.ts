import SearchPane from './searchPane';

export interface IClasses {
	clear: string;
	clearAll: string;
	container: string;
	emptyMessage: string;
	hide: string;
	panes: string;
	search: string;
	title: string;
	titleRow: string;
}

export interface IConfigPaneItem {
	className: string;
	dtOpts: {[keys: string]: any}; // All dtOpts
	header: string;
	options: IOption[];
}

export interface IDefaults {
	cascadePanes: boolean;
	clear: boolean;
	columns: number[];
	container: (dt: any) => any;
	filterChanged: (count: number) => any;
	layout: string;
	panes: IConfigPaneItem[];
	viewTotal: boolean;
}

export interface IDOM {
	clearAll: JQuery<HTMLElement>;
	container: JQuery<HTMLElement>; // Container Method needs to return a JQuery
	emptyMessage: JQuery<HTMLElement>;
	options: JQuery<HTMLElement>;
	panes: JQuery<HTMLElement>;
	title: JQuery<HTMLElement>;
	titleRow: JQuery<HTMLElement>;
	wrapper: JQuery<HTMLElement>;
}

export interface IOption {
	label: string;
	values: any; // Function?
}

export interface IS {
	colOpts: any[];
	dt: any; // DataTable Instance
	filterPane: number;
	panes: SearchPane[];
	selectionList: ISelectItem[];
	updating: boolean;
}

export interface ISelectItem {
	index: number;
	protect: boolean;
	rows: any;
}
