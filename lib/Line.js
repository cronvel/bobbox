/*
	Bobbox

	Copyright (c) 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var Box = require( './Box.js' ) ;

function noop() {}



function Line( doc , options ) {
	Box.call( this , doc , options ) ;
	this.contentBoxes = [] ;
	this.justify = !! options.justify ;
}

Line.prototype = Object.create( Box.prototype ) ;
Line.prototype.constructor = Line ;

module.exports = Line ;



Line.prototype.appendContentBox = function appendContentBox( contentBox ) {
	contentBox.parent = this ;
	contentBox.x = this.contentWidth ;
	if ( this.height < contentBox.height ) { this.height = contentBox.height ; }
	this.contentWidth += contentBox.width ;
	this.contentBoxes.push( contentBox ) ;
} ;



// Recompute content position with inner adjustements
Line.prototype.reflow = function reflow( fn ) {
	fn = fn || noop ;
	this.contentWidth = 0 ;
	this.contentBoxes.forEach( contentBox => {
		contentBox.x = this.contentWidth ;
		fn( contentBox ) ;
		this.contentWidth += contentBox.width ;
	} ) ;
} ;



Line.prototype.justifyContent = function justifyContent() {
	var spaceCount , spaceWidth ;

	if ( ! this.justify || this.contentWidth >= this.width ) { return ; }

	spaceCount = this.contentBoxes.reduce( ( spaceCount_ , contentBox ) => spaceCount_ + contentBox.spaceCount() , 0 ) ;

	if ( spaceCount ) {
		spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
		this.reflow( contentBox => contentBox.resizeSpaces( spaceWidth ) ) ;
	}

	if ( this.contentWidth + 0.001 < this.width && this.contentBoxes.length === 1 ) {
		spaceCount = this.contentBoxes.reduce( ( spaceCount_ , contentBox ) => spaceCount_ + contentBox.spaceCount( true ) , 0 ) ;

		if ( spaceCount ) {
			spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
			this.reflow( contentBox => contentBox.resizeSpaces( spaceWidth , true ) ) ;
		}
	}
} ;



Line.prototype.trim = function trim() {
	if ( this.contentBoxes.length === 1 ) {
		this.contentBoxes[ 0 ].trim() ;
		this.reflow() ;
	}
	else if ( this.contentBoxes.length > 1 ) {
		this.contentBoxes[ 0 ].trimLeft() ;
		this.contentBoxes[ this.contentBoxes.length - 1 ].trimRight() ;
		this.reflow() ;
	}
} ;



Line.prototype.render = function render() {
	this.trim() ;
	this.justifyContent() ;
	this.contentBoxes.forEach( contentBox => contentBox.render() ) ;
} ;

