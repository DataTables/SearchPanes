# SearchPanes

The SearchPanes extension for DataTables provides improved Searching functionality allowing users to select options from a "Pane" which will then in turn search the DataTable and return the relevant results. There are multiple configuration options available to enhance SearchPanes.

## Installation

To use SearchPanes the best way to obtain the software is to use the [DataTables download builder](https://datatables.net/download). You can also include the individual files from the [DataTables CDN](https://cdn.datatables.net). See the [documentation](http://datatables.net/manual/extensions/searchpanes/) for full details.

### NPM

If you prefer to use a package manager such as NPM, distribution repositories are available with software built from this repository under the name `datatables.net-searchpanes`. Styling packages for Bootstrap, Foundation and other styling libraries are also available by adding a suffix to the package name. Again, use the [DataTables download builder](https://datatables.net/download) to obtain the packages to install.


## Basic Usage

SearchPanes is used in DataTables by placing it in [the `layout` object](https://datatables.net/ref/core/option/layout) where you wish the search panels to appear:

```js
new DataTable('#example', {
    layout: {
        top: 'searchPanes'
    }
});
```

# Documentation / Support

* [Examples](https://datatables.net/examples/searchpanes/)
* [Documentation](https://datatables.net/manual/extensions/searchpanes/)
* [DataTables support forums](http://datatables.net/forums)

