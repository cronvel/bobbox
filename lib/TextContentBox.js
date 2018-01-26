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



function TextContentBox( doc , options ) {
	ContentBox.call( this , doc , options ) ;
	this.type = 'text' ;
	this.content = options.content ;
}

TextContentBox.prototype = Object.create( ContentBox.prototype ) ;
TextContentBox.prototype.constructor = TextContentBox ;

module.exports = TextContentBox ;



ContentBox.prototype.computeWidth = function computeWidth() {
	this.width = this.doc.getFont( this.content.font ).widthOfString( this.content.text , this.content.fontSize ) ;
	
	if ( this.content.wordSpacing ) {
		this.width += string.occurenceCount( this.content.text , ' ' ) * this.content.wordSpacing ;
	}
} ;



TextContentBox.prototype.resizeWidth = function resizeWidth( width ) {
	console.log( 'resizeWidth:' , width , this.width ) ;
	if ( width < this.width ) { return ; }	// Not possible
	
	var spaceCount = string.occurenceCount( this.content.text , ' ' ) ;
	
	if ( ! spaceCount ) { return ; } // Not possible
	
	this.content.wordSpacing = ( width - this.width ) / spaceCount ;
	this.width = width ;
} ;



ContentBox.prototype.trim = function trim() {
	this.content.text = this.content.text.trim() ;
	this.computeWidth() ;
} ;



ContentBox.prototype.trimLeft = function trimLeft() {
	this.content.text = this.content.text.trimLeft() ;
	this.computeWidth() ;
} ;



ContentBox.prototype.trimRight = function trimRight() {
	this.content.text = this.content.text.trimRight() ;
	this.computeWidth() ;
} ;

