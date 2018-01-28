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
//var ContentBox = require( './ContentBox.js' ) ;
var FlowLine = require( './FlowLine.js' ) ;

function noop() {}



function FlowBlock( from , options = {} ) {
	Box.call( this , from , options ) ;

	// Always align top-left: we compute real coordinate for all lines.
	// But we will create lines with the wanted alignment.
	this.lineAlign = this.align ;
	this.align = 'topLeft' ;
	this.justify = !! options.justify ;

	this.currentLine = null ;
	this.lines = [] ;
}

FlowBlock.prototype = Object.create( Box.prototype ) ;
FlowBlock.prototype.constructor = FlowBlock ;

module.exports = FlowBlock ;



FlowBlock.prototype.appendText = function appendText( text , attr ) {
	var length , font , textWidth , textHeight , remainingWidth , remainderText , found ;

	length = text.length ;

	if ( ! length ) { return ; }

	if ( ! this.currentLine ) {
		this.newLine() ;
	}

	this.currentLine.appendText( text , attr ) ;
} ;



FlowBlock.prototype.newLine = function newLine( height ) {
	var lastLine = this.lines[ this.lines.length - 1 ] ;

	var newLine = new FlowLine( this , {
		y: lastLine ? lastLine.y + lastLine.height : 0 ,
		width: this.width ,
		height: height ,
		align: this.lineAlign

		// Give justify only when there is another line?
		//justify: this.justify
	} ) ;

	if ( lastLine && this.justify ) {
		lastLine.justify = this.justify ;
	}
	
	/*
	// Temp condition
	if ( this.lines.length > 10 ) {
		if ( this.parent && ( this.parent.overflow
	}
	else {
		this.currentLine = newLine ;
		this.lines.push( newLine ) ;
	}
	*/
	
	this.currentLine = newLine ;
	this.lines.push( newLine ) ;
	
	return newLine ;
} ;



FlowBlock.prototype.overflow = function overflow( fromChild , width , height ) {
	if ( fromChild instanceof FlowLine ) {
		return this.newLine( height ) ;
	}
} ;



FlowBlock.prototype.inflate = function inflate() {
	var height = this.height ;
	// width is not supposed to change, only contentWidth
	
	this.reflow() ;
	
	if ( this.contentHeight > this.height ) {
		console.log( "Content too big!" ) ;
	}
	
	if ( this.parent && height !== this.height ) {
		this.parent.inflate( this ) ;
	}
} ;



// Recompute content position with inner adjustements
FlowBlock.prototype.reflow = function reflow( fn ) {
	fn = fn || noop ;
	this.contentHeight = 0 ;
	this.lines.forEach( line => {
		line.y = this.contentHeight ;
		fn( line ) ;
		this.contentHeight += line.height ;
	} ) ;
	
	if ( this.autoHeight ) { this.height = this.contentHeight ; }
} ;



FlowBlock.prototype.render = function render() {
	this.lines.forEach( line => line.render() ) ;
} ;

