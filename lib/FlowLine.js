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



function FlowLine( doc , options ) {
	Box.call( this , doc , options ) ;
	this.boxes = [] ;
	this.justify = !! options.justify ;
}

FlowLine.prototype = Object.create( Box.prototype ) ;
FlowLine.prototype.constructor = FlowLine ;

module.exports = FlowLine ;



FlowLine.prototype.appendBox = function appendBox( box ) {
	box.parent = this ;
	box.x = this.contentWidth ;
	if ( this.height < box.height ) { this.height = box.height ; }
	this.contentWidth += box.width ;
	this.boxes.push( box ) ;
} ;



// Recompute content position with inner adjustements
FlowLine.prototype.reflow = function reflow( fn ) {
	fn = fn || noop ;
	this.contentWidth = 0 ;
	this.boxes.forEach( box => {
		box.x = this.contentWidth ;
		fn( box ) ;
		this.contentWidth += box.width ;
	} ) ;
} ;



FlowLine.prototype.justifyContent = function justifyContent() {
	var spaceCount , spaceWidth ;

	this.trim() ;
	
	if ( ! this.justify || this.contentWidth >= this.width ) { return ; }

	spaceCount = this.boxes.reduce( ( spaceCount_ , box ) => spaceCount_ + box.spaceCount() , 0 ) ;

	if ( spaceCount ) {
		spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
		this.reflow( box => box.resizeSpaces( spaceWidth ) ) ;
	}

	if ( this.contentWidth + 0.001 < this.width && this.boxes.length === 1 ) {
		spaceCount = this.boxes.reduce( ( spaceCount_ , box ) => spaceCount_ + box.spaceCount( true ) , 0 ) ;

		if ( spaceCount ) {
			spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
			this.reflow( box => box.resizeSpaces( spaceWidth , true ) ) ;
		}
	}
} ;



FlowLine.prototype.trim = function trim() {
	if ( this.boxes.length === 1 ) {
		this.boxes[ 0 ].trim() ;
		this.reflow() ;
	}
	else if ( this.boxes.length > 1 ) {
		this.boxes[ 0 ].trimLeft() ;
		this.boxes[ this.boxes.length - 1 ].trimRight() ;
		this.reflow() ;
	}
} ;



FlowLine.prototype.render = function render() {
	this.justifyContent() ;
	this.boxes.forEach( box => box.render() ) ;
} ;

