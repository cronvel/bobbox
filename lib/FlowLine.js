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
var TextContentBox = require( './TextContentBox.js' ) ;

function noop() {}



function FlowLine( from , options = {} ) {
	Box.call( this , from , options ) ;
	this.boxes = [] ;
	this.justify = !! options.justify ;
}

FlowLine.prototype = Object.create( Box.prototype ) ;
FlowLine.prototype.constructor = FlowLine ;

module.exports = FlowLine ;



FlowLine.prototype.appendBox = function appendBox( box ) {
	if ( this.pipeTo ) { return this.pipeTo.appendBox( box ) ; }
	
	box.parent = this ;
	box.x = this.contentWidth ;
	this.contentWidth += box.width ;
	this.boxes.push( box ) ;
	
	if ( this.height < box.height ) {
		this.height = box.height ;
		if ( this.parent ) { this.parent.inflate( this ) ; }
	}
} ;



FlowLine.prototype.prependBox = function prependBox( box ) {
	if ( this.pipeTo ) { return this.pipeTo.prependBox( box ) ; }
	
	box.parent = this ;
	this.boxes.unshift( box ) ;
	this.inflate() ;	// It calls reflow and inflate its parent
} ;



FlowLine.prototype.appendText = function appendText( text , attr , isPrepend ) {
	if ( this.pipeTo ) { return this.pipeTo.appendText( text , attr , isPrepend ) ; }
	
	var length , font , textWidth , textHeight , remainingWidth , remainderText , found ,
		content , textContentBox , newLine ;

	length = text.length ;

	if ( ! length ) { return ; }

	font = this.foreignDoc.getFont( attr.font ) ;
	textHeight = font.lineHeight( attr.fontSize , true ) ;	// include the line gap
	remainingWidth = this.width - this.contentWidth ;
	textWidth = font.widthOfString( text , attr.fontSize ) ;

	if ( textWidth > remainingWidth ) {
		found = FlowLine.wordsUpToWidth( text , font , attr.fontSize , remainingWidth ) ;

		if ( ! found ) {
			if ( this.boxes.length ) {
				newLine = this.overflowTo( 0 , textHeight ) ;
				if ( newLine ) {
					newLine.prependText( text , attr ) ;
				}
				return ;
			}

			found = FlowLine.wordsUpToWidth( text , font , attr.fontSize , remainingWidth , true ) ;

			if ( ! found ) {
				console.error( "FlowBlock#appendText(): Cannot even add a single char..." ) ;
				return ;
			}
		}

		( { text , textWidth , remainderText } = found ) ;
	}

	// Great, there is enough room for this whole text, add it!
	content = Object.assign( {} , attr ) ;
	content.text = text ;

	var textContentBox = new TextContentBox( this , {
		width: textWidth ,
		height: textHeight ,
		content: content
	} ) ;
	
	if ( isPrepend ) { this.prependBox( textContentBox ) ; }
	else { this.appendBox( textContentBox ) ; }

	if ( remainderText ) {
		this.overflowTo( 0 , textHeight ) ;
		if ( this.pipeTo ) {
			if ( isPrepend ) {
				console.error( "Prepending and pipeTo are not supported ATM" ) ;
			}
			else {
				this.pipeTo.appendText( remainderText , attr ) ;
			}
		}
	}
} ;



FlowLine.prototype.prependText = function prependText( text , attr ) {
	return this.appendText( text , attr , true ) ;
} ;



FlowLine.wordsUpToWidth = function wordsUpToWidth( text , font , fontSize , maxWidth , charByChar ) {
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
		return null ;
	}

	return {
		text: lastValidText ,
		textWidth: lastValidWidth ,
		remainderText: text.slice( charByChar ? lastValidText.length : lastValidText.length + 1 )
	} ;
} ;



FlowLine.prototype.inflate = function inflate() {
	var height = this.height ;
	// width is not supposed to change, only contentWidth
	
	this.reflow() ;
	
	if ( this.parent && height !== this.height ) {
		this.parent.inflate( this ) ;
	}
} ;



// Recompute content position with inner adjustements
FlowLine.prototype.reflow = function reflow( fn ) {
	fn = fn || noop ;
	this.contentWidth = 0 ;
	this.height = 0 ;
	this.boxes.forEach( box => {
		box.x = this.contentWidth ;
		fn( box ) ;
		this.contentWidth += box.width ;
		if ( this.height < box.height ) { this.height = box.height ; }
	} ) ;
} ;



FlowLine.prototype.justifyContent = function justifyContent() {
	var spaceCount , spaceWidth ;

	this.trim( true ) ;
	
	if ( ! this.justify || this.contentWidth >= this.width ) { return ; }

	spaceCount = this.boxes.reduce( ( spaceCount_ , box ) => spaceCount_ + box.spaceCount() , 0 ) ;

	if ( spaceCount ) {
		spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
		this.reflow( box => box.resizeSpaces( spaceWidth , false , true ) ) ;
	}

	if ( this.contentWidth + 0.001 < this.width && this.boxes.length === 1 ) {
		spaceCount = this.boxes.reduce( ( spaceCount_ , box ) => spaceCount_ + box.spaceCount( true ) , 0 ) ;

		if ( spaceCount ) {
			spaceWidth = ( this.width - this.contentWidth ) / spaceCount ;
			this.reflow( box => box.resizeSpaces( spaceWidth , true , true ) ) ;
		}
	}
} ;



FlowLine.prototype.trim = function trim( internalCall ) {
	if ( this.boxes.length === 1 ) {
		this.boxes[ 0 ].trim( true ) ;
		this.reflow() ;
	}
	else if ( this.boxes.length > 1 ) {
		this.boxes[ 0 ].trimLeft( true ) ;
		this.boxes[ this.boxes.length - 1 ].trimRight( true ) ;
		this.reflow() ;
	}
	
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



FlowLine.prototype.trimLeft = function trimLeft( internalCall ) {
	if ( this.boxes.length >= 1 ) {
		this.boxes[ 0 ].trimLeft( true ) ;
		this.reflow() ;
	}
	
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



FlowLine.prototype.trimRight = function trimRight( internalCall ) {
	if ( this.boxes.length >= 1 ) {
		this.boxes[ this.boxes.length - 1 ].trimRight( true ) ;
		this.reflow() ;
	}
	
	if ( ! internalCall && this.parent ) { this.parent.inflate( this ) ; }
} ;



FlowLine.prototype.render = function render() {
	this.justifyContent() ;
	this.boxes.forEach( box => box.render() ) ;
} ;

