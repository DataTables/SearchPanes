import SearchPane from './SearchPane';

export interface IClasses {
	clear: string;
	clearAll: string;
	collapseAll: string;
	container: string;
	disabledButton: string;
	emptyMessage: string;
	hide: string;
	panes: string;
	search: string;
	showAll: string;
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
	clear: boolean;
	collapse: boolean;
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
		collapseMessage: string;
		count: string;
		countFiltered: string;
		emptyMessage: string;
		emptyPanes: string;
		loadMessage: string;
		showMessage: string;
		title: string;
	};
	layout: string;
	order: string[];
	panes: IConfigPaneItem[];
}

export interface IDOM {
	clearAll: JQuery<HTMLElement>;
	collapseAll: JQuery<HTMLElement>;
	container: JQuery<HTMLElement>; // Container Method needs to return a JQuery
	emptyMessage: JQuery<HTMLElement>;
	panes: JQuery<HTMLElement>;
	showAll: JQuery<HTMLElement>;
	title: JQuery<HTMLElement>;
	titleRow: JQuery<HTMLElement>;
}

export interface IOption {
	label: string;
	values: any; // Function?
}

export interface IS {
	colOpts: any[];
	dt: any; // DataTable Instance
	filterCount: number;
	minPaneWidth: number;
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
