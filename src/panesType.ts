import { Api, Dom } from 'datatables.net';
import SearchPane from './SearchPane';
import SearchPaneCascade from './SearchPaneCascade';
import SearchPaneViewTotal from './SearchPaneViewTotal';
import { IConfigPaneItem } from './paneType';

type DeepPartial<T> = T extends (...args: any[]) => any
	? T
	: T extends object
		? {
				[P in keyof T]?: DeepPartial<T[P]>;
		  }
		: T;

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

// export interface IConfigPaneItem {
// 	className: string;
// 	dtOpts: Options;
// 	header: string;
// 	options: IOption[];
// }

export interface IDefaults {
	cascadePanes: boolean;
	clear: boolean;
	collapse: boolean;
	columns: number[];
	container: (dt: any) => any;
	filterChanged?: (this: Api, count: number) => void;
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
	preSelect: ISelectItem[];
	viewCount: boolean;
	viewTotal: boolean;
}

export interface IConfig extends DeepPartial<IDefaults> {};

export interface IDOM {
	clearAll: Dom<HTMLElement>;
	collapseAll: Dom<HTMLElement>;
	container: Dom<HTMLElement>; // Container Method needs to return a Dom
	emptyMessage: Dom<HTMLElement>;
	panes: Dom<HTMLElement>;
	showAll: Dom<HTMLElement>;
	title: Dom<HTMLElement>;
	titleRow: Dom<HTMLElement>;
}

export interface IOption {
	label: string;
	values: any; // Function?
}

export interface IS {
	colOpts: any[];
	dt: Api;
	filterCount: number;
	minPaneWidth: number;
	page: number;
	paging: boolean;
	pagingST: boolean;
	paneClass: typeof SearchPane;
	panes: SearchPane[];
	selectionList: ISelectItem[];
	serverData: {[keys: string]: any};
	stateRead: boolean;
	updating: boolean;
}

export interface ISVT extends IS {
	anotherFilter: boolean;
	panes: SearchPaneViewTotal[] | SearchPaneCascade[];
	reselecting: boolean;
	serverSelect: any;
	serverSelecting: any;
	processing: number;
}

export interface ISelectItem {
	column: number;
	rows: any;
}
