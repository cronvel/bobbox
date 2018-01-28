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



var ContentBox = require( './ContentBox.js' ) ;
var string = require( 'string-kit' ) ;



function TextContentBox( from , options = {} ) {
	ContentBox.call( this , from , options ) ;
	this.type = 'text' ;	// Force text

	// Allow optimization from the parent: do not compute it twice
	if ( ! this.width ) { this.computeWidth() ; }
	if ( ! this.height ) { this.computeHeight() ; }
}

TextContentBox.prototype = Object.create( ContentBox.prototype ) ;
TextContentBox.prototype.constructor = TextContentBox ;

module.exports = TextContentBox ;



TextContentBox.prototype.inflate = function inflate() {
	var width = this.width , height = this.height ;

	this.computeHeight() ;
	this.computeWidth() ;

	if ( this.parent && ( width !== this.width || height !== this.height ) ) {
		this.parent.inflate( this ) ;
	}
} ;



TextContentBox.prototype.computeWidth = function computeWidth() {
	if ( ! this.content.text ) {
		this.width = 0 ;
		return ;
	}

	this.width = this.foreignDoc.getFont( this.content.font ).widthOfString( this.content.text , this.content.fontSize ) ;

	if ( this.content.wordSpacing ) {
		this.width += string.occurenceCount( this.content.text , ' ' ) * this.content.wordSpacing ;
	}

	if ( this.content.characterSpacing ) {
		this.width += ( string.unicode.length( this.content.text ) - 1 ) * this.content.characterSpacing ;
	}
} ;



TextContentBox.prototype.computeHeight = function computeHeight() {
	if ( ! this.content.text ) {
		this.height = 0 ;
		return ;
	}

	this.height = this.foreignDoc.getFont( this.content.font ).lineHeight( this.content.fontSize , true ) ;
} ;



TextContentBox.prototype.spaceCount = function spaceCount( level2 ) {
	return level2 ?
		string.unicode.length( this.content.text ) - 1 :
		string.occurenceCount( this.content.text , ' ' ) ;
} ;



TextContentBox.prototype.resizeSpaces = function resizeSpaces( spaceWidth , level2 , internalCall ) {
	if ( level2 ) {
		// Use charSpacing to resize
		this.content.characterSpacing = spaceWidth ;
	}
	else {
		// Use wordSpacing to resize
		this.content.wordSpacing = spaceWidth ;
	}

	this.computeWidth() ;
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



TextContentBox.prototype.trim = function trim( internalCall ) {
	this.content.text = this.content.text.trim() ;
	this.computeWidth() ;
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



TextContentBox.prototype.trimLeft = function trimLeft( internalCall ) {
	this.content.text = this.content.text.trimLeft() ;
	this.computeWidth() ;
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



TextContentBox.prototype.trimRight = function trimRight( internalCall ) {
	this.content.text = this.content.text.trimRight() ;
	this.computeWidth() ;
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;

