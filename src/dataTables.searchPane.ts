/*! SearchPane 0.0.2
 * 2018 SpryMedia Ltd - datatables.net/license
 */
/**
 * @summary     SearchPane
 * @description Search Panes for DataTables columns
 * @version     0.0.2
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @copyright   Copyright 2018 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

 /// <reference path = "../node_modules/@types/jquery/index.d.ts"/>

// Hack to allow TypeScript to compile our UMD
declare var define: {
    (string, Function): any;
    amd: string;
}

// DataTables extensions common UMD. Note that this allows for AMD, CommonJS
// (with window and jQuery being allowed as parameters to the returned
// function) or just default browser loading.
(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser - assume jQuery has already been loaded
        factory( (window as any).jQuery, window, document );
    }
}(function( $, window, document ) {
	var DataTable = $.fn.dataTable;
	class SearchPanes {
        public classes;
		public dom;
		public c;
		public s;

		static class = {
			container: 'dt-searchPanes',
			clear: 'clear',
			pane: {
				active: 'filtering',
				container: 'pane',
				title: 'title',
				scroller: 'scroller'
			},
			item: {
				selected: 'selected',
				label: 'label',
				count: 'count'
			}
		};
		
		static defaults = {
			container: function(dt) {
				return dt.table().container();
			},
			columns: undefined,
			insert: 'prepend',
			threshold: 0.5,
			minRows: 1 
		};
		
        static version = '0.0.2'; 
        
        constructor(settings, opts){
			//console.log("constructor");
            var that = this;
            var table = new DataTable.Api(settings);

            this.classes = $.extend(true, {}, SearchPanes.class);

            this.dom = {
                container: $('<div/>').addClass(this.classes.container)
            }

            this.c = $.extend(true, {}, SearchPanes.defaults, opts);

            this.s = {
                dt: table
            };

            table.settings()[0].searchPane = this;

            table
                .columns(this.c.columns)
                .eq(0)
                .each(function(idx) {
                    that._pane(idx);
                });

			this._attach();
			$.fn.dataTable.tables({visible: true, api: true}).columns.adjust();
			

        }

        public _attach () {
			var container = this.c.container;
			var host = typeof container === 'function' ? container(this.s.dt) : container;

			if (this.c.insert === 'prepend') {
				$(this.dom.container).prependTo(host);
			} else {
				$(this.dom.container).appendTo(host);
			}
        }
        
        public _pane(idx) {
			//console.log("in -pane");
            var classes = this.classes;
			var itemClasses = classes.item;
			var paneClasses = classes.pane;
			var table = this.s.dt;
			var column = table.column(idx);
			var colOpts = this._getOptions(idx);
            //var list = $('<ul/>');
            var dt = $('<table><thead><tr><th>' + $(column.header()).text() + '</th><th/></tr></thead></table>');
            var container = this.dom.container;
            
			var binData = typeof colOpts.options === 'function' ?
				colOpts.options( table, idx ) :
				colOpts.options ?
					new DataTable.Api(null, colOpts.options) :
					column.data();
			var bins = this._binData(binData.flatten());

			// Don't show the pane if there isn't enough variance in the data
			if (this._variance(bins) < this.c.threshold) {
				return;
			}
			$(container).append(dt);
            var dtPane = {
				table: $(dt).DataTable({
					"paging":false,
					"scrollY":"200px",
					"order":[],
					"columnDefs": [
						{"orderable": false, "targets":[0,1]}
					],
					"info": false,
					select:true 
				}),
				index: idx
			} ;

			// On initialisation, do we need to set a filtering value from a
			// saved state or init option?
			var search = column.search();
			search = search ? search.substr(1, search.length - 2).split('|') : [];

			var data = binData
				.unique()
				.sort()
                .toArray();
            
            for(var i = 0, ien = data.length; i< ien; i++){
                if(data[i]){
					dtPane.table.row.add([data[i], bins[data[i]]]);
                }
			}

			$.fn.dataTable.select.init(dtPane.table);

            dtPane.table.draw();	
			
			dtPane.table.on('select.dt deselect.dt', () => {
				dtPane.table.rows({selected: true}).data().toArray();		
				this._toggle(dtPane);		
			});
        }

		public _toggle (paneIn){
			var columnIdx = paneIn.index;
			var table = this.s.dt;
			var options = this._getOptions(columnIdx);
			var filters = paneIn.table.rows({selected:true}).data().pluck(0).flatten().toArray();

			if(filters.length === 0){
				table
					.columns(columnIdx)
					.search('')
					.draw();
			} else if (options.match === 'any'){
				table
					.column(columnIdx)
					.search(
						'(' + 
						$.map(filters, function(filter) {
							return($.fn as any).dataTable.util.escapeRegex(filter);
						})
						.join('|')
						+ ')',
						true,
						false
					)
					.draw();
			} else {
				table
					.columns(columnIdx)
					.search(
						'^(' + 
						$.map(filters, function(filter) {
							return($.fn as any).dataTable.util.escapeRegex(filter);
						})
						.join('|')
						+ ')$',
						true,
						false
					)
					.draw();
			}
		}
        public _getOptions (colIdx) {
			var table = this.s.dt;

			return table.settings()[0].aoColumns[colIdx].searchPane || {};
        }
        
        public _variance (d) {
			var data = $.map(d, function(val, key) {
				return val;
			});

			var count = data.length;
			var sum = 0;
			for (var i = 0, ien = count; i < ien; i++) {
				sum += data[i];
			}

			var mean = sum / count;
			var varSum = 0;
			for (var i = 0, ien = count; i < ien; i++) {
				varSum += Math.pow(mean - data[i], 2);
			}

			return varSum / (count - 1);
        }
        
        public _binData (data) {
			var out = {};

			for (var i = 0, ien = data.length; i < ien; i++) {
				var d = data[i];

				if (!d) {
					continue;
				}

				if (!out[d]) {
					out[d] = 1;
				} else {
					out[d]++;
				}
			}

			return out;
		}
	}
	($.fn as any).dataTable.SearchPanes = SearchPanes;
	($.fn as any).DataTable.SearchPanes = SearchPanes;

	DataTable.Api.register('searchPanes.rebuild()', function() {
		return this.iterator('table', function(ctx) {
			if (ctx.searchPane) {
				ctx.searchPane.rebuild();
			}
		});
	});

	DataTable.Api.register('column().paneOptions()', function(options) {
		return this.iterator('column', function(ctx, idx) {
			var col = ctx.aoColumns[idx];

			if (!col.searchPane) {
				col.searchPane = {};
			}
			col.searchPane.values = options;

			if (ctx.searchPane) {
				ctx.searchPane.rebuild();
			}
		});
	});

	$(document).on('init.dt', function(e, settings, json) {
		if (e.namespace !== 'dt') {
			return;
		}

		var init = settings.oInit.searchPane;
		var defaults = DataTable.defaults.searchPane;

		if (init || defaults) {
			var opts = $.extend({}, init, defaults);

			if (init !== false) {
				new SearchPanes(settings, opts);
			}
		}
	});



	return SearchPanes;
}));