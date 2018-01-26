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
var ContentBox = require( './ContentBox.js' ) ;
var Line = require( './Line.js' ) ;



function FlowBlock( doc , options ) {
	Box.call( this , doc , options ) ;
	
	// Always align top-left: we compute real coordinate for all lines.
	// But we will create lines with the wanted alignment.
	this.lineAlign = this.align ;
	this.align = 'topLeft' ;
	
	this.currentLine = null ;
	this.lines = [] ;
}

FlowBlock.prototype = Object.create( Box.prototype ) ;
FlowBlock.prototype.constructor = FlowBlock ;

module.exports = FlowBlock ;



FlowBlock.prototype.appendText = function appendText( text , attr ) {
	var length , font , textWidth , textHeight , fontSpaceWidth , remainingWidth , remainderText , found ;
	
	length = text.length ;
	
	if ( ! length ) { return ; }
	
	if ( ! this.currentLine ) {
		this.newLine() ;
	}
	
	font = this.doc.getFont( attr.font ) ;
	textHeight = font.lineHeight( attr.fontSize , true ) ;	// include the line gap
	remainingWidth = this.currentLine.width - this.currentLine.contentWidth ;
	textWidth = font.widthOfString( text , attr.fontSize ) ;
	
	if ( textWidth > remainingWidth ) {
		found = this.wordsUpToWidth( text , font , attr.fontSize , remainingWidth ) ;
		if ( ! found ) { return ; }
		( { text , textWidth , remainderText } = found ) ;
	}
	
	// Great, there is enough room for this whole text, add it!
	this.appendTextToLine( text , attr , textWidth , textHeight ) ;
	
	if ( remainderText ) {
		// Then call .appendText() again for the remaining text...
		this.currentLine = null ;
		this.appendText( remainderText , attr ) ;
	}
} ;



FlowBlock.prototype.wordsUpToWidth = function wordsUpToWidth( text , font , fontSize , maxWidth , charByChar ) {
	var lastValidText , lastValidWidth , currentText ,
		currentWidth = 0 ,
		index = 0 ,
		length = text.length ;
	
	while ( index < length && currentWidth < maxWidth ) {
		index ++ ;
		
		if ( ! charByChar ) {
			index = text.indexOf( ' ' , index + 1 ) ;
			
			// Not found? go to the end of the string
			if ( index === -1 ) { index = length ; }
		}
		
		currentText = text.slice( 0 , index ) ;
		currentWidth = font.widthOfString( currentText , fontSize ) ;
		
		if ( currentWidth <= maxWidth ) {
			lastValidText = currentText ;
			lastValidWidth = currentWidth ;
		}
	}
	
	if ( ! lastValidText ) {
		if ( charByChar ) { return null ; }
		
		// Retry char by char
		return this.wordsUpToWidth( text , font , fontSize , maxWidth , true ) ;
	}
	
	return {
		text: lastValidText ,
		textWidth: lastValidWidth ,
		remainderText: text.slice( charByChar ? lastValidText.length : lastValidText.length + 1 )
	} ;
} ;



FlowBlock.prototype.newLine = function newLine() {
	var lastLine = this.lines[ this.lines.length - 1 ] ;
	this.currentLine = new Line( this , {
		y: lastLine ? lastLine.y + lastLine.height : 0 ,
		width: this.width ,
		align: this.lineAlign
	} ) ;
	this.lines.push( this.currentLine ) ;
} ;



FlowBlock.prototype.appendTextToLine = function appendTextToLine( text , attr , textWidth , textHeight ) {
	var content = Object.assign( {} , attr ) ;
	content.text = text ;
	
	var contentBox = new ContentBox( this , {
		width: textWidth ,
		height: textHeight ,
		type: 'text' ,
		content: content
	} ) ;
	
	this.currentLine.appendContentBox( contentBox ) ;
} ;



FlowBlock.prototype.render = function render() {
	this.lines.forEach( line => line.render() ) ;
} ;

