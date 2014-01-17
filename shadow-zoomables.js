/**
 * ================================================================================
 * Shadow Zoomables
 * --------------------------------------------------------------------------------
 * Author:      Andrew Hosgood
 * Version:     0.9.6
 * Date:        17/01/2014
 * ================================================================================
 */

(
	function( window, $ ) {
		try {
			if( $ ) {
				$.fn.zoomables = function( strZoomableAttribute, objUserOptions ) {
						var jqoZoomablesScope = this,
						objOptions = $.extend( {}, $.fn.zoomables.objDefaultOptions, objUserOptions ),
						arrTouchIDs = [],
						objStartingPositions = {},
						strEnlargedImageUri = null,
						intLoupeWidth = objOptions.loupeWidth,
						intStartingSeparation = 0,
						intLastTouchTime = 0,
						setLoupeDisplacement = function() {
								if( touchBrowser() ) {
									if( objOptions.loupePosition === 'n'
											|| objOptions.loupePosition === 'e'
											|| objOptions.loupePosition === 's'
											|| objOptions.loupePosition === 'w' ) {
										intLoupeDisplacement = intLoupeWidth / 2;
									} else {
										intLoupeDisplacement = Math.sqrt( Math.pow( intLoupeWidth, 2 ) / 2 ) / 2;
									}
								} else {
									intLoupeDisplacement = 0;
								}
							},
						intLoupeDisplacement = intLoupeWidth,
						blUnderFinger = false,
						isIE = function() {
								var strUserAgent = navigator.userAgent,
								intMSIEOffset = strUserAgent.indexOf( 'MSIE ' );
								return ( intMSIEOffset === -1 ) ? false : parseFloat( strUserAgent.substring( intMSIEOffset + 5, strUserAgent.indexOf( ';', intMSIEOffset ) ) );
							},
						compensateScroll = function() {
								if( navigator.userAgent.indexOf( 'Android' ) !== -1 ) {
									compensateScroll = function() { return true; };
								} else {
									compensateScroll = function() { return false; };
								}
							},
						touchBrowser = function() {
								return ( 'ontouchstart' in window || 'onmsgesturechange' in window ) && ( !isIE() );
							},
						jqoWindow = $( window ),
						objCache = {
								jqoTarget: null,
								jqoEnlargedImage: null,
								intLoupeX: 0,
								intLoupeY: 0,
								intWindowScrollX: jqoWindow.scrollLeft(),
								intWindowScrollY: jqoWindow.scrollTop(),
								blDoFirstDraw: false
							},
						doLoupe = function( jqoTarget, jqoEnlargedImage, intLoupeX, intLoupeY, blDoFirstDraw ) {
								var intTargetWidth = jqoTarget.width(),
								intTargetHeight = jqoTarget.height(),
								intWindowScrollTop = jqoWindow.scrollTop(),
								intWindowScrollLeft = jqoWindow.scrollLeft(),
								intTargetX = jqoTarget.offset().left,
								intTargetY = jqoTarget.offset().top,
								intLoupeOffsetX = 0,
								intLoupeOffsetY = 0,
								fltImagePercentageTop = 0,
								fltImagePercentageLeft = 0,
								intNowLoupeWidth = intLoupeWidth,
								intLoupeDifference = 0;

								intLoupeX += ( intWindowScrollLeft - objCache.intWindowScrollX ) + ( compensateScroll() ? intWindowScrollLeft : 0 );
								intLoupeY += ( intWindowScrollTop - objCache.intWindowScrollY ) + ( compensateScroll() ? intWindowScrollTop : 0 );

								objCache.jqoTarget = jqoTarget,
								objCache.jqoEnlargedImage = jqoEnlargedImage,
								objCache.intLoupeX = intLoupeX,
								objCache.intLoupeY = intLoupeY,
								objCache.intWindowScrollX = intWindowScrollLeft,
								objCache.intWindowScrollY = intWindowScrollTop,
								objCache.blDoFirstDraw = blDoFirstDraw;

								if( objOptions.loupeResize
										&& arrTouchIDs.length > 1 ) {
									var intSeparation = Math.sqrt( Math.pow( objStartingPositions[arrTouchIDs[0]].x - objStartingPositions[arrTouchIDs[1]].x, 2 ) + Math.pow( objStartingPositions[arrTouchIDs[0]].y - objStartingPositions[arrTouchIDs[1]].y, 2 ) ),
									intNowLoupeWidth = intLoupeWidth + ( ( intSeparation - intStartingSeparation ) * objOptions.separationScaling );
									if( intNowLoupeWidth < objOptions.loupeWidthMin ) {
										intNowLoupeWidth = objOptions.loupeWidthMin;
									} else if( intNowLoupeWidth > objOptions.loupeWidthMax ) {
										intNowLoupeWidth = objOptions.loupeWidthMax;
									}
									intLoupeDifference = intNowLoupeWidth - intLoupeWidth;
								}

								if( ( blUnderFinger
											|| ( !blUnderFinger
												&& ( objOptions.loupePosition === 'n'
													|| objOptions.loupePosition === 's' ) ) )
										&& intLoupeX < intTargetX ) {
									intLoupeX = intTargetX;
								} else if( ( blUnderFinger
											|| ( !blUnderFinger
												&& ( objOptions.loupePosition === 'n'
													|| objOptions.loupePosition === 's' ) ) )
										&& intLoupeX > intTargetX + intTargetWidth ) {
									intLoupeX = intTargetX + intTargetWidth;
								} else if( ( objOptions.loupePosition === 'sw'
											|| objOptions.loupePosition === 'w'
											|| objOptions.loupePosition === 'nw' )
										&& intLoupeX < intTargetX + intLoupeDisplacement ) {
									intLoupeX = intTargetX + intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'ne'
											|| objOptions.loupePosition === 'e'
											|| objOptions.loupePosition === 'se' )
										&& intLoupeX < intTargetX - intLoupeDisplacement ) {
									intLoupeX = intTargetX - intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'sw'
											|| objOptions.loupePosition === 'w'
											|| objOptions.loupePosition === 'nw' )
										&& intLoupeX > intTargetX + intTargetWidth + intLoupeDisplacement ) {
									intLoupeX = intTargetX + intTargetWidth + intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'ne'
											|| objOptions.loupePosition === 'e'
											|| objOptions.loupePosition === 'se' )
										&& intLoupeX > intTargetX + intTargetWidth - intLoupeDisplacement ) {
									intLoupeX = intTargetX + intTargetWidth - intLoupeDisplacement;
								}

								if( ( blUnderFinger
											|| ( !blUnderFinger
												&& ( objOptions.loupePosition === 'e'
													|| objOptions.loupePosition === 'w' ) ) )
										&& intLoupeY < intTargetY ) {
									intLoupeY = intTargetY;
								} else if( ( blUnderFinger
											|| ( !blUnderFinger
												&& ( objOptions.loupePosition === 'e'
													|| objOptions.loupePosition === 'w' ) ) )
										&& intLoupeY > intTargetY + intTargetHeight ) {
									intLoupeY = intTargetY + intTargetHeight;
								} else if( ( objOptions.loupePosition === 'n'
											|| objOptions.loupePosition === 'ne'
											|| objOptions.loupePosition === 'nw' )
										&& intLoupeY < intTargetY + intLoupeDisplacement ) {
									intLoupeY = intTargetY + intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'se'
											|| objOptions.loupePosition === 's'
											|| objOptions.loupePosition === 'sw' )
										&& intLoupeY < intTargetY - intLoupeDisplacement ) {
									intLoupeY = intTargetY - intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'n'
											|| objOptions.loupePosition === 'ne'
											|| objOptions.loupePosition === 'nw' )
										&& intLoupeY > intTargetY + intTargetHeight + intLoupeDisplacement ) {
									intLoupeY = intTargetY + intTargetHeight + intLoupeDisplacement;
								} else if( ( objOptions.loupePosition === 'se'
											|| objOptions.loupePosition === 's'
											|| objOptions.loupePosition === 'sw' )
										&& intLoupeY > intTargetY + intTargetHeight - intLoupeDisplacement ) {
									intLoupeY = intTargetY + intTargetHeight - intLoupeDisplacement;
								}

								fltImagePercentageTop = ( ( intLoupeY - intTargetY ) / intTargetHeight ) * 100;
								fltImagePercentageLeft = ( ( intLoupeX - intTargetX ) / intTargetWidth ) * 100;

								if( !blUnderFinger ) {
									switch( objOptions.loupePosition ) {
										case 'n':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY - intLoupeDisplacement ) / intTargetHeight ) * 100;
											break;

										case 'ne':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY - intLoupeDisplacement ) / intTargetHeight ) * 100;
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX + intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;

										case 'e':
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX + intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;

										case 'se':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY + intLoupeDisplacement ) / intTargetHeight ) * 100;
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX + intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;

										case 's':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY + intLoupeDisplacement ) / intTargetHeight ) * 100;
											break;

										case 'sw':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY + intLoupeDisplacement ) / intTargetHeight ) * 100;
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX - intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;

										case 'w':
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX - intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;

										case 'nw':
											fltImagePercentageTop = ( ( intLoupeY - intTargetY - intLoupeDisplacement ) / intTargetHeight ) * 100;
											fltImagePercentageLeft = ( ( intLoupeX - intTargetX - intLoupeDisplacement ) / intTargetWidth ) * 100;
											break;
									}
								}

								switch( objOptions.loupePosition ) {
									case 'n':
										intLoupeOffsetX = -intLoupeDifference / 2;
										intLoupeOffsetY = -( intLoupeDisplacement + intLoupeDifference );
										break;

									case 'ne':
										intLoupeOffsetX = intLoupeDisplacement;
										intLoupeOffsetY = -( intLoupeDisplacement + intLoupeDifference );
										break;

									case 'e':
										intLoupeOffsetX = intLoupeDisplacement;
										intLoupeOffsetY = -intLoupeDifference / 2;
										break;

									case 'se':
										intLoupeOffsetX = intLoupeDisplacement;
										intLoupeOffsetY = intLoupeDisplacement;
										break;

									case 's':
										intLoupeOffsetX = -intLoupeDifference / 2;
										intLoupeOffsetY = intLoupeDisplacement;
										break;

									case 'sw':
										intLoupeOffsetX = -( intLoupeDisplacement + intLoupeDifference );
										intLoupeOffsetY = intLoupeDisplacement;
										break;

									case 'w':
										intLoupeOffsetX = -( intLoupeDisplacement + intLoupeDifference );
										intLoupeOffsetY = -intLoupeDifference / 2;
										break;

									case 'nw':
										intLoupeOffsetX = -( intLoupeDisplacement + intLoupeDifference );
										intLoupeOffsetY = -( intLoupeDisplacement + intLoupeDifference );
										break;
								}

								fltImagePercentageLeft = ( fltImagePercentageLeft * ( 1 + ( objOptions.imageMargin * 2 ) ) ) - ( objOptions.imageMargin * 100 );
								fltImagePercentageTop = ( fltImagePercentageTop * ( 1 + ( objOptions.imageMargin * 2 ) ) ) - ( objOptions.imageMargin * 100 );

								var objImageCSS = {
										width: intNowLoupeWidth + 'px',
										height: intNowLoupeWidth + 'px',
										margin: '-' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px 0 0 -' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px',
										top: intLoupeY + 'px',
										left: intLoupeX + 'px',
										backgroundPosition: jqoEnlargedImage.hasClass( 'loaded' ) ? ( fltImagePercentageLeft + '% ' + fltImagePercentageTop + '%' ) : 'center',
										transform: 'translate(' + ( intLoupeOffsetX - intWindowScrollLeft ) + 'px, ' + ( intLoupeOffsetY - intWindowScrollTop ) + 'px)'
									};

								if( blDoFirstDraw === true ) {
									$( '.' + objOptions.loupeClass ).fadeOut(),
									jqoEnlargedImage.css( objImageCSS ).stop( true, true ).fadeIn();
								} else {
									jqoEnlargedImage.css( objImageCSS );
								}
							},
						doLoupeWithCache = function() {
								if( touchBrowser() ) {
									objCache.intWindowScrollX = jqoWindow.scrollLeft(),
									objCache.intWindowScrollY = jqoWindow.scrollTop();
								}

								if( objCache.jqoTarget !== null ) {
									doLoupe( objCache.jqoTarget, objCache.jqoEnlargedImage, objCache.intLoupeX, objCache.intLoupeY, false );
								}
							},
						getTimecode = function() {
								var datNow = new Date(),
								strMilliseconds = datNow.getMilliseconds().toString();

								if( strMilliseconds.length < 3 ) {
									for( var intChar = 0; intChar < 3; intChar++ ) {
										strMilliseconds = '0' + strMilliseconds;
									}
								}

								return parseInt( Math.floor( datNow.getTime() / 1000 ) + strMilliseconds.substr( -3 ) );
							};

						setLoupeDisplacement();

						jqoZoomablesScope.find( '[' + strZoomableAttribute +']' ).css(
							{
								cursor: 'none',
								'-webkit-touch-callout': 'none',
								'-khtml-touch-callout': 'none',
								'-moz-touch-callout': 'none',
								'-ms-touch-callout': 'none',
								'-o-touch-callout': 'none',
								'touch-callout': 'none',
								'-webkit-user-select': 'none',
								'-khtml-user-select': 'none',
								'-moz-user-select': 'none',
								'-ms-user-select': 'none',
								'-o-user-select': 'none',
								'user-select': 'none'
							}
						),
						$( 'html' ).on( 'touchstart',
							function( e ) {
								for( var t in e.originalEvent.changedTouches ) {
									var objTouch = e.originalEvent.changedTouches[t];
									if( typeof objTouch === 'object' ) {
										var jqoTarget = $( objTouch.target ),
										intTouchID = objTouch.identifier;

										if( arrTouchIDs.length
												|| ( !arrTouchIDs.length
													&& jqoTarget.attr( strZoomableAttribute ) ) ) {
											arrTouchIDs.push( intTouchID );
											objStartingPositions[intTouchID] = { x: objTouch.screenX, y: objTouch.screenY };

											if( strEnlargedImageUri === null ) {
												strEnlargedImageUri = jqoTarget.attr( strZoomableAttribute );

												var jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );

												if( !jqoEnlargedImage.length ) {
													jqoEnlargedImage = $( '<div class="' + objOptions.loupeClass + '" data-zoomablesfullimage="' + strEnlargedImageUri + '"/>' ).css(
														{
															width: intLoupeWidth + 'px',
															height: intLoupeWidth + 'px',
															margin: '-' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px 0 0 -' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px',
															position: 'fixed',
															top: '0',
															left: '0',
															background: 'url(' + objOptions.loaderImage + ') center no-repeat ' + objOptions.loaderImageBackground,
															backgroundSize: '50px 50px',
															border: objOptions.loupeBorderWidth + 'px ' + objOptions.loupeBorderColour + ' solid',
															borderRadius: ( objOptions.loupeWidthMax / 2 ) + 'px',
															boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.5), inset 0 0 3px rgba(0, 0, 0, 0.5)',
															cursor: 'none',
															zIndex: objOptions.loupeZIndex,
															'-webkit-touch-callout': 'none',
															'-khtml-touch-callout': 'none',
															'-moz-touch-callout': 'none',
															'-ms-touch-callout': 'none',
															'-o-touch-callout': 'none',
															'touch-callout': 'none',
															'-webkit-user-select': 'none',
															'-khtml-user-select': 'none',
															'-moz-user-select': 'none',
															'-ms-user-select': 'none',
															'-o-user-select': 'none',
															'user-select': 'none'
														}
													).on( 'dbltap',
														function() {
															intLastTouchTime = 0;
															//TODO: alert( $( this ).attr( 'data-zoomablesfullimage' ) );
														}
													).hide().appendTo( 'body' );

													if( !jqoEnlargedImage.hasClass( 'loading' ) ) {
														var strThisEnlargedImageUri = strEnlargedImageUri;
														$( '<img src="' + strThisEnlargedImageUri + '"/>' ).on( 'load',
															function() {
																jqoEnlargedImage.removeClass( 'loading' ).addClass( 'loaded' ).css(
																	{
																		background: 'url(' + strThisEnlargedImageUri + ') 0 0 no-repeat ' + objOptions.loupeBackgroundColour,
																		backgroundSize: 'auto'
																	}
																),
																$( this ).remove();
															}
														).css(
															{
																width: '0',
																height: '0'
															}
														).appendTo( 'body' );

														jqoEnlargedImage.addClass( 'loading' );
													}
												}

												if( arrTouchIDs.length ) {
													doLoupe( jqoTarget, jqoEnlargedImage, objStartingPositions[arrTouchIDs[0]].x, objStartingPositions[arrTouchIDs[0]].y, true );
												}
											} else {
												if( arrTouchIDs.length > 1 ) {
													intStartingSeparation = Math.sqrt( Math.pow( objStartingPositions[arrTouchIDs[0]].x - objStartingPositions[arrTouchIDs[1]].x, 2 ) + Math.pow( objStartingPositions[arrTouchIDs[0]].y - objStartingPositions[arrTouchIDs[1]].y, 2 ) );
												}
											}
										}
									}
								}
							}
						).on( 'touchmove',
							function( e ) {
								for( var t in e.originalEvent.changedTouches ) {
									var objTouch = e.originalEvent.changedTouches[t];

									if( typeof objTouch === 'object' ) {
										var jqoTarget = $( objTouch.target ),
										intTouchID = objTouch.identifier;

										if( arrTouchIDs.length > 1
												|| ( arrTouchIDs.length === 1
													&& jqoTarget.attr( strZoomableAttribute ) )
													/*&& jqoTarget.attr( 'data-zoomablesfullimage' ) === jqoThisZoomable.attr( 'data-zoomablesfullimage' )*/ ) {
											e.preventDefault();

											var jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );

											if( intTouchID === arrTouchIDs[0] ) {
												doLoupe( jqoTarget, jqoEnlargedImage, objTouch.screenX, objTouch.screenY );
											} else if( intTouchID === arrTouchIDs[1] ) {
												objStartingPositions[intTouchID] = {
														x: objTouch.screenX,
														y: objTouch.screenY
													};
											}
										}
									}
								}
							}
						).on( 'touchend',
							function( e ) {
								var jqoEnlargedImage;

								for( var t in e.originalEvent.changedTouches ) {
									var objTouch = e.originalEvent.changedTouches[t];

									if( objOptions.loupeResize
											&& arrTouchIDs.length > 1 ) {
										var intSeparation = Math.sqrt( Math.pow( objStartingPositions[arrTouchIDs[0]].x - objStartingPositions[arrTouchIDs[1]].x, 2 ) + Math.pow( objStartingPositions[arrTouchIDs[0]].y - objStartingPositions[arrTouchIDs[1]].y, 2 ) ),
										intNowLoupeWidth = intLoupeWidth + ( ( intSeparation - intStartingSeparation ) * objOptions.separationScaling );
										if( intNowLoupeWidth < objOptions.loupeWidthMin ) {
											intNowLoupeWidth = objOptions.loupeWidthMin;
										} else if( intNowLoupeWidth > objOptions.loupeWidthMax ) {
											intNowLoupeWidth = objOptions.loupeWidthMax;
										}

										intLoupeWidth = intNowLoupeWidth;
										setLoupeDisplacement();
									}

									if( typeof objTouch === 'object' ) {
										jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );

										arrTouchIDs.splice( arrTouchIDs.indexOf( objTouch.identifier ), 1 );
									}
								}

								if( arrTouchIDs.length === 0 ) {
									strEnlargedImageUri = null;

									if( jqoEnlargedImage.length ) {
										var intTime = getTimecode();

										jqoEnlargedImage.stop( true, true ).fadeOut();

										if( intTime - intLastTouchTime < objOptions.doubleTapSpeed ) {
											jqoEnlargedImage.trigger( 'dbltap' );
										}

										intLastTouchTime = intTime;

										objCache.jqoTarget = null;
									}
								}
							}
						),
						jqoZoomablesScope.on( 'mouseenter', '[' + strZoomableAttribute + ']',
							function( e ) {
								objCache.jqoTarget = $( this ),
								strEnlargedImageUri = objCache.jqoTarget.attr( strZoomableAttribute );
								var jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );

								if( !jqoEnlargedImage.length ) {
									jqoEnlargedImage = $( '<div class="' + objOptions.loupeClass + '" data-zoomablesfullimage="' + strEnlargedImageUri + '"/>' ).css(
										{
											width: intLoupeWidth + 'px',
											height: intLoupeWidth + 'px',
											margin: '-' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px 0 0 -' + ( ( intLoupeWidth / 2 ) + objOptions.loupeBorderWidth ) + 'px',
											position: 'fixed',
											top: '0',
											left: '0',
											background: 'url(' + objOptions.loaderImage + ') center no-repeat ' + objOptions.loaderImageBackground,
											backgroundSize: '50px 50px',
											border: objOptions.loupeBorderWidth + 'px ' + objOptions.loupeBorderColour + ' solid',
											borderRadius: '100px',
											boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.5), inset 0 0 3px rgba(0, 0, 0, 0.5)',
											zIndex: objOptions.loupeZIndex
										}
									).hide().appendTo( 'body' );

									if( !jqoEnlargedImage.hasClass( 'loading' ) ) {
										var strThisEnlargedImageUri = strEnlargedImageUri;
										$( '<img src="' + strThisEnlargedImageUri + '"/>' ).on( 'load',
											function() {
												jqoEnlargedImage.removeClass( 'loading' ).addClass( 'loaded' ).css(
													{
														background: 'url(' + strThisEnlargedImageUri + ') 0 0 no-repeat ' + objOptions.loupeBackgroundColour,
														backgroundSize: 'auto'
													}
												),
												$( this ).remove();
											}
										).css(
											{
												width: '0',
												height: '0'
											}
										).appendTo( 'body' );

										jqoEnlargedImage.addClass( 'loading' );
									}
								}

								var jqoWindow = $( window );
								objCache.intWindowScrollX = jqoWindow.scrollLeft(),
								objCache.intWindowScrollY = jqoWindow.scrollTop();

								doLoupe( objCache.jqoTarget, jqoEnlargedImage, e.pageX, e.pageY, true );
							}
						),
						$( 'html' ).on( 'mousemove',
							function( e ) {
								if( objCache.jqoTarget !== null ) {
									var jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );

									doLoupe( objCache.jqoTarget, jqoEnlargedImage, e.pageX, e.pageY );
								}
							}
						).on( 'mouseleave', '.' + objOptions.loupeClass,
							function( e ) {
								var jqoEnlargedImage = $( '.' + objOptions.loupeClass + '[data-zoomablesfullimage="' + strEnlargedImageUri + '"]' );
								strEnlargedImageUri = null;
								if( jqoEnlargedImage ) {
									jqoEnlargedImage.stop().fadeOut();
									objCache.jqoTarget = null;
								}
							}
						).on( 'click', '.' + objOptions.loupeClass,
							function( e ) {
								if( !touchBrowser() ) {
									e.preventDefault();
									var jqoTarget = $( this );
									//TODO: alert( jqoTarget.attr( 'data-zoomablesfullimage' ) );
								}
							}
						),
						$( document ).on( 'scroll', doLoupeWithCache );

						return this;
					},
				$.fn.zoomables.objDefaultOptions = {
						doubleTapSpeed: 350,
						imageMargin: 0.15,
						intentDelay: 400,
						intentDistance: 50,
						loaderImage: '',
						loaderImageSize: '50px 50px',
						loaderImageBackground: '#D8D8D8',
						loupeBackgroundColour: '#FFF',
						loupeBorderColour: '#FFF',
						loupeBorderWidth: 3,
						loupeClass: 'zoomables-loupe',
						loupePosition: 'nw',
						loupeResize: false,
						loupeWidth: 200,
						loupeWidthMax: 400,
						loupeWidthMin: 125,
						loupeZIndex: 99,
						separationScaling: 1.25
					};
			} else {
				throw 'Shadow Zoomables requires jQuery to run';
			}
		} catch( err ) {
			if( window.console ) {
				if( window.console.error ) {
					console.error( err );
				} else if( window.console.log ) {
					console.log( err );
				}
			}
		}
	}
)( window, jQuery );