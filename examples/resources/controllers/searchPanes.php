<?php

/*
 * Example PHP implementation used for the index.html example
 */

// DataTables PHP library
include( "../../../../Editor-PHP-Demo/lib/DataTables.php" );

// Alias Editor classes so they are easy to use
use
	DataTables\Editor,
	DataTables\Editor\Field,
	DataTables\Editor\Format,
	DataTables\Editor\Mjoin,
	DataTables\Editor\Options,
	DataTables\Editor\Upload,
	DataTables\Editor\Validate,
    DataTables\Editor\ValidateOptions,
    DataTables\Editor\SearchPaneOptions;

// Build our Editor instance and process the data coming from _POST
Editor::inst( $db, 'users' )
	->field( 
        Field::inst( 'users.first_name' )
            ->searchPaneOptions(SearchPaneOptions::inst()
        ),
		Field::inst( 'users.last_name' )
            ->searchPaneOptions( SearchPaneOptions::inst()),
		Field::inst( 'users.phone' )
            ->searchPaneOptions( SearchPaneOptions::inst()
                ->table( 'users')
                ->value( 'phone' )
            ),
        Field::inst( 'users.site' )
            ->options( Options::inst()
				->table( 'sites' )
				->value( 'id' )
				->label( 'name' )
			)
            ->validator( Validate::dbValues() ),
        Field::inst( 'sites.name' )
            ->searchPaneOptions( SearchPaneOptions::inst()
                ->value( 'sites.name')
                ->label( 'sites.name' )
                ->leftJoin( 'sites', 'sites.id', '=', 'users.site' )
            )
    )
    ->leftJoin( 'sites', 'sites.id', '=', 'users.site' )
    ->debug(true)
	->process($_POST)
    ->json();