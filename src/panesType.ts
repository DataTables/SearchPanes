import SearchPane from './searchPane';

export interface IClasses {
	clear: string;
	clearAll: string;
	container: string;
	disabledButton: string;
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
	i18n: {
		clearMessage: string;
		clearPane: string;
		collapse: {
			0: string;
			_: string;
		};
		count: string;
		countFiltered: string;
		emptyMessage: string;
		emptyPanes: string;
		loadMessage: string;
		title: string;
	};
	layout: string;
	order: string[];
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
	filterCount: number;
	filterPane: number;
	page: number;
	paging: boolean;
	panes: SearchPane[];
	selectionList: ISelectItem[];
	serverData: {[keys: string]: any};
	stateRead: boolean;
	updating: boolean;
}

export interface ISelectItem {
	index: number;
	protect: boolean;
	rows: any;
}
