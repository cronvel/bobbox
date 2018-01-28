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



const CLIPPING_DELTA = 1.001 ;
function noop() {}



function Box( from , options = {} ) {
	if ( from instanceof Document ) {
		this.foreignDoc = from.foreignDoc ;
		//this.parent = from ;
		this.parent = null ;
		this.document = from ;
	}
	else if ( from instanceof Box ) {
		this.foreignDoc = from.foreignDoc ;
		this.parent = from ;
		this.document = from.document ;
	}
	else {
		this.foreignDoc = from ;
		this.parent = null ;
		this.document = null ;
	}

	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.contentWidth = options.contentWidth || 0 ;
	this.contentHeight = options.contentHeight || 0 ;
	this.autoWidth = !! options.autoWidth ;
	this.autoHeight = !! options.autoHeight ;
	this.width = options.width || ( this.autoWidth ? this.contentWidth : 0 ) ;
	this.height = options.height || ( this.autoHeight ? this.contentHeight : 0 ) ;
	this.align = options.align && Absolute.align[ options.align ] ? options.align : 'topLeft' ;
	this.pipeInto = null ;	// for container, after overflowing, it points to an eventual new element of the same kind
}

module.exports = Box ;

var Document = require( './Document.js' ) ;



Box.prototype.isOverflowing = function isOverflowing() {
	return this.parent && ( this.x + this.width > parent.width || this.y + this.height > parent.height ) ;
} ;



Box.prototype.overflowTo = function overflowTo( width , height ) {
	if ( this.pipeTo ) { return this.pipeTo ; }
	if ( ! this.parent ) { return null ; }
	this.pipeTo = this.parent.overflow( this , width , height ) || null ;
	return this.pipeTo ;
} ;



// Return absolute coordinates
Box.prototype.getAbsolute = function getAbsolute() {
	if ( ! this.parent ) { return new Absolute( this ) ; }

	var parentAbsolute = this.parent.getAbsolute() ;
	
	/*
	var absolute = new Absolute(
		Box.align[ this.parent.align ]( this , this.parent , parentAbsolute ) ,
		parentAbsolute
	) ;
	*/
	
	var absolute = new Absolute( this , this.parent , parentAbsolute , this.parent.align ) ;
	
	return absolute ;
} ;



function Absolute( child , parent , parentAbsolute , align ) {
	var xDelta , yDelta ;
	
	if ( parent ) {
		Absolute.align[ align ]( this , child , parent , parentAbsolute ) ;
		
		this.xMax = this.x + child.width ;
		this.yMax = this.y + child.height ;
		
		this.xClip = Math.max( this.x , parentAbsolute.xClip ) ;
		this.yClip = Math.max( this.y , parentAbsolute.yClip ) ;
		this.xMaxClip = Math.min( this.xMax , parentAbsolute.xMaxClip ) ;
		this.yMaxClip = Math.min( this.yMax , parentAbsolute.yMaxClip ) ;
		
		xDelta = CLIPPING_DELTA * ( this.xMaxClip - this.xClip ) ;
		yDelta = CLIPPING_DELTA * ( this.yMaxClip - this.yClip ) ;
		
		this.clipped =
			( this.x < this.xClip - xDelta ) ||
			( this.y < this.yClip - yDelta ) ||
			( this.xMax > this.xMaxClip + xDelta ) ||
			( this.yMax > this.yMaxClip + yDelta ) ;
		
		/*
		if ( this.clipped ) {
			console.log( "clipped:" , this , parentAbsolute ) ;
			process.exit() ;
		}*/
	}
	else {
		this.x = this.xClip = child.x ;
		this.y = this.yClip = child.y ;
		this.xMax = this.xMaxClip = child.x + child.width ;
		this.yMax = this.yMaxClip = child.y + child.height ;
		this.clipped = false ;
	}
}



Absolute.align = {} ;

Absolute.align.topLeft = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + child.x ,
	self.y = parentAbsolute.y + child.y
} ;

Absolute.align.top = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + ( parent.width - ( parent.contentWidth || child.width ) ) / 2 + child.x ,
	self.y = parentAbsolute.y + child.y
} ;

Absolute.align.topRight = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + parent.width - ( parent.contentWidth || child.width ) + child.x ,
	self.y = parentAbsolute.y + child.y
} ;

Absolute.align.left = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + child.x ,
	self.y = parentAbsolute.y + ( parent.height - ( parent.contentHeight || child.height ) ) / 2 + child.y
} ;

Absolute.align.center = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + ( parent.width - ( parent.contentWidth || child.width ) ) / 2 + child.x ,
	self.y = parentAbsolute.y + ( parent.height - ( parent.contentHeight || child.height ) ) / 2 + child.y
} ;

Absolute.align.right = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + parent.width - ( parent.contentWidth || child.width ) + child.x ,
	self.y = parentAbsolute.y + ( parent.height - ( parent.contentHeight || child.height ) ) / 2 + child.y
} ;

Absolute.align.bottomLeft = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + child.x ,
	self.y = parentAbsolute.y + parent.height - ( parent.contentHeight || child.height ) + child.y
} ;

Absolute.align.bottom = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + ( parent.width - ( parent.contentWidth || child.width ) ) / 2 + child.x ,
	self.y = parentAbsolute.y + parent.height - ( parent.contentHeight || child.height ) + child.y
} ;

Absolute.align.bottomRight = ( self , child , parent , parentAbsolute ) => {
	self.x = parentAbsolute.x + parent.width - ( parent.contentWidth || child.width ) + child.x ,
	self.y = parentAbsolute.y + parent.height - ( parent.contentHeight || child.height ) + child.y
} ;



// To be subclassed
Box.prototype.render = noop ;
Box.prototype.appendBox = noop ;	// appendBox( box )
Box.prototype.spaceCount = () => 0 ;	// spaceCount( level2 )
Box.prototype.resizeSpaces = noop ;	// resizeSpaces( spaceWidth , level2 , internalCall )
// overflow( fromChild , width , height ) called by a child on its parent, may return a new element of the same kind,
// if provided, width and height it the reclaimed size for the new element
Box.prototype.overflow = noop ;		
Box.prototype.reflow = noop ;		// reflow the inner content, i.e. re-adjust inward (usually just things one level down)
Box.prototype.inflate = noop ;		// inflate( fromChild ) re-adjust outward after a child outer change (may be recursive)
Box.prototype.trim = noop ;			// trim( internalCall )
Box.prototype.trimLeft = noop ;		// trimLeft( internalCall )
Box.prototype.trimRight = noop ;	// trimRight( internalCall )

