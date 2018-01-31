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
	if ( this.pipeTo ) { return this.pipeTo.appendText( text , attr ) ; }

	var newLine , length = text.length ;

	if ( ! length ) { return ; }
	
	console.log( "appendText!" , this.contentHeight ) ;

	if ( this.currentLine ) {
		console.log( "appendText! 2" ) ;
		this.currentLine.appendText( text , attr ) ;
		return ;
	}
	
	newLine = new FlowLine( this , {
		width: this.width ,
		align: this.lineAlign
	} ) ;
	
	newLine.appendText( text , attr ) ;
	
	if ( newLine ) {
		console.log( "appendText! 3" ) ;
		newLine.appendText( text , attr ) ;
	}
	else {
		console.log( "appendText! 4" ) ;
	}
} ;



FlowBlock.prototype.appendLine = function appendLine( line ) {
	if ( this.pipeTo ) { return this.pipeTo.appendLine( line ) ; }

	var lastLine = this.lines[ this.lines.length - 1 ] ;
	
	line.y = lastLine ? lastLine.y + lastLine.height : 0 ;
	line.width = this.width ;
	line.height = this.height ;
	line.align = this.lineAlign ;
	
	if ( lastLine && this.justify ) {
		// Always justify all but the last line
		lastLine.justify = this.justify ;
	}

	this.contentHeight += line.height ;
	
	isOverflowing = this.contentResized( 0 , line.height ) ;
	
	console.log( "newLine 1" , isOverflowing ) ;
	
	if ( isOverflowing === true ) {
		// Overflow, but can't return a new container...
		return null ;
	}
	else if ( isOverflowing ) {
		isOverflowing.currentLine = newLine ;
		isOverflowing.lines.push( newLine ) ;
	}
	else {
		this.currentLine = newLine ;
		this.lines.push( newLine ) ;
	}
	
	return newLine ;
} ;



// Deprecated?
FlowBlock.prototype.newLine = function newLine_( newLineHeight = 1 ) {
	if ( this.pipeTo ) { return this.pipeTo.newLine( newLineHeight ) ; }

	var isOverflowing ,
		lastLine = this.lines[ this.lines.length - 1 ] ;

	var newLine = new FlowLine( this , {
		y: lastLine ? lastLine.y + lastLine.height : 0 ,
		width: this.width ,
		height: newLineHeight ,
		align: this.lineAlign

		// Give justify only when there is another line?
		//justify: this.justify
	} ) ;

	if ( lastLine && this.justify ) {
		lastLine.justify = this.justify ;
	}

	this.contentHeight += newLineHeight ;
	
	isOverflowing = this.contentResized( 0 , newLineHeight ) ;
	
	console.log( "newLine 1" , isOverflowing ) ;
	
	if ( isOverflowing === true ) {
		// Overflow, but can't return a new container...
		return null ;
	}
	else if ( isOverflowing ) {
		isOverflowing.currentLine = newLine ;
		isOverflowing.lines.push( newLine ) ;
	}
	else {
		this.currentLine = newLine ;
		this.lines.push( newLine ) ;
	}
	
	return newLine ;
} ;



FlowBlock.prototype.contentResized = function contentResized( width , height ) {
	var oldHeight = this.height ;
	
		console.log( ">>>>>>>>>>>>>>>>>>>>>> bob" , this.contentHeight , this.height ) ;
	if ( this.contentHeight < this.height ) {
		if ( this.autoHeight ) {
			this.height = this.contentHeight ;
			if ( this.parent ) { this.parent.inflate() ; }
		}
	}
	else {
		if ( this.autoHeight ) {
			this.height = this.contentHeight ;
			if ( this.isOverflowing() ) {
				console.log( "bob" , {width,height,x,y,parentWidth:this.parent.width,parentHeight:this.parent.height} = this ) ;
				this.height = oldHeight ;
				// Overflow...
				return this.overflowTo( width , height ) || true ;
			}
			else {
				this.parent.inflate() ;
			}
		}
		else {
			// Overflow...
			return this.overflowTo( width , height ) || true ;
		}
	}
	
	return false ;
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

