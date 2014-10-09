$( function( ) {
	var $body = $( 'body' );
	var $window = $( window );
	
	var width = $window.width( );
	var height = $window.height( );
	var padding = 10;
	
	var $nav = $( 'nav' ).remove( );
	var $links = $( 'a', $nav );
	var nodeCount = $links.length;
	
	// Add an overlay to mask the image loading and display an animation
	var $overlay = $( '<div class="overlay"/>' ).appendTo( $body );
	$overlay.append( '<img src="images/loading-bubbles.svg" />' );
	$( '<img src="icons/sheet.png" />' ).on( 'load', function( ) {
		$overlay.fadeOut( 'slow' );
	} );
	
	// If images are taking long to load, hide the overlay anyway.
	setTimeout( function( ) { $overlay.fadeOut( 'slow' ); }, 3300 );
	
	var nodes = d3.range( nodeCount ).map(
		function( i )
		{
			var $link = $( $links[ i ] );
			var r = Math.round( 25 + 25 * parseFloat( $link.data( 'relevance' ) ) );
			var d =
			{
				radius : r,
				link : $link
			};
			
			return d;
		}
	);
	
	// Setup d3 viewport
	d3.layout.pack( )
		.sort( null )
		.size( [ width, height ] )
		.children(
			function( d )
			{
				return d.values;
			}
		).value(
			function( d )
			{
				return d.radius * d.radius;
			}
		)
		.nodes(
			{
				values : 
					d3.nest( )
						.key(
							function( d )
							{
								return d.cluster;
							}
						)
						.entries( nodes )
			}
		);
	
	var nav = d3.select( 'body' ).append( 'nav' );
	
	var collide = function( alpha ) {
		var quadtree = d3.geom.quadtree( nodes );
		return function( d ) {
			var r = d.radius + padding;
			
			var nx1 = d.x - r;
			var nx2 = d.x + r;
			var ny1 = d.y - r;
			var ny2 = d.y + r;
			
			quadtree.visit(
				function( quad, x1, y1, x2, y2 )
				{
					if( quad.point && ( quad.point !== d ) )
					{
						var x = d.x - quad.point.x;
						var y = d.y - quad.point.y;
						var l = Math.sqrt( x * x + y * y );
						var r = d.radius + quad.point.radius + padding;
						
						if( l < r )
						{
							l = ( l - r ) / l * alpha;
							d.x -= x *= l;
							d.y -= y *= l;
							quad.point.x += x;
							quad.point.y += y;
						}
					}
					
					return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
				}
			);
		};
	};
	
	// Gravitate towards center
	var force = d3.layout.force( )
		.nodes( nodes )
		.size( [ width, height ] )
		.gravity( 0.02 )
		.friction( 0.9 )
		.on( 'tick', function( e )
		{
			node.each( collide( 0.5 ) ).style(
			{
				'left' : function( d ) { return d.x - d.radius + 'px'; },
				'top' : function( d ) { return d.y - d.radius + 'px'; }
			} );
		} ).start( )
                .alpha( 0.05 ); // Ends animation quicker
	
	var node = nav.selectAll( 'a' )
		.data( nodes )
		.enter( ).append( 'a' )
		.attr( 'class', function( d ) { return d.link.attr( 'class' ); } )
		.attr( 'href', function( d ) { return d.link.attr( 'href' ); } )
		.attr( 'data-title', function( d ) { return d.link.text( ); } );
	
	node.transition( )
		.duration( 0 ) // Enlarging over 750 ms sometimes causes graphical glitch in Chrome
		.delay( function( d, i ) { return i * 5; } )
		.styleTween( 'width', function( d )
		{
			var i = d3.interpolate( 0, d.radius );
			return function( t ) { d.radius = i( t ); return 2 * d.radius + 'px'; };
		} )
		.styleTween( 'height', function( d )
		{
			var i = d3.interpolate( 0, d.radius );
			return function( t ) { d.radius = i( t ); return 2 * d.radius + 'px'; };
		} );
	
	var $h3 = $( '<h3/>' ).appendTo( $body ).hide( );
	$( 'nav a' ).on( 'mouseover', function( e )
	{
		var $link = $( this );
		$( 'nav a' ).removeClass( 'hover' );
		$link.addClass( 'hover' );
		$h3.promise( ).done( function( )
		{
			$h3.text( $link.data( 'title' ) ).fadeIn( 'fast' );
		} );
	} ).on( 'mouseout', function( )
	{
		var $link = $( this );
		$link.removeClass( 'hover' );
		/*
		$h3.promise( ).done( function( )
		{
			$h3.fadeOut( 'fast' );
		} );
		*/
		$h3.fadeOut( 'fast' );
	} ).on( 'click touchend', function( e ) {
		var $link = $( this );
		
		if( !$link.hasClass( 'hover' ) )
		{
			e.preventDefault( );
			$link.trigger( 'mouseover' );
		}
	} );
} );