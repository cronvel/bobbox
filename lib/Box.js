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



function noop() {}



function Box( ctx , options = {} ) {
	if ( ctx instanceof Box ) {
		this.doc = ctx.doc ;
		this.parent = ctx ;
		this.master = ctx.master ;
	}
	else {
		this.doc = ctx ;
		this.parent = null ;
		this.master = null ;
	}

	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.width = options.width || 0 ;
	this.height = options.height || 0 ;
	this.contentWidth = options.contentWidth || 0 ;
	this.contentHeight = options.contentHeight || 0 ;
	this.align = options.align && Box.align[ options.align ] ? options.align : 'topLeft' ;
	this.pipeInto = null ;	// for container, after overflowing, it points to an eventual new element of the same kind
}

module.exports = Box ;



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
	if ( ! this.parent ) { return { x: this.x , y: this.y } ; }

	var absolute = this.parent.getAbsolute() ;

	Box.align[ this.parent.align ]( absolute , this , this.parent ) ;

	return absolute ;
} ;



Box.align = {} ;

Box.align.topLeft = function topLeft( absolute , self /*, parent*/ ) {
	absolute.x += self.x ;
	absolute.y += self.y ;
} ;

Box.align.top = function top( absolute , self , parent ) {
	absolute.x += ( parent.width - ( parent.contentWidth || self.width ) ) / 2 + self.x ;
	absolute.y += self.y ;
} ;

Box.align.topRight = function topRight( absolute , self , parent ) {
	absolute.x += parent.width - ( parent.contentWidth || self.width ) + self.x ;
	absolute.y += self.y ;
} ;

Box.align.left = function left( absolute , self , parent ) {
	absolute.x += self.x ;
	absolute.y += ( parent.height - ( parent.contentHeight || self.height ) ) / 2 + self.y ;
} ;

Box.align.center = function center( absolute , self , parent ) {
	absolute.x += ( parent.width - ( parent.contentWidth || self.width ) ) / 2 + self.x ;
	absolute.y += ( parent.height - ( parent.contentHeight || self.height ) ) / 2 + self.y ;
} ;

Box.align.right = function right( absolute , self , parent ) {
	absolute.x += parent.width - ( parent.contentWidth || self.width ) + self.x ;
	absolute.y += ( parent.height - ( parent.contentHeight || self.height ) ) / 2 + self.y ;
} ;

Box.align.bottomLeft = function bottomLeft( absolute , self , parent ) {
	absolute.x += self.x ;
	absolute.y += parent.height - ( parent.contentHeight || self.height ) + self.y ;
} ;

Box.align.bottom = function bottom( absolute , self , parent ) {
	absolute.x += ( parent.width - ( parent.contentWidth || self.width ) ) / 2 + self.x ;
	absolute.y += parent.height - ( parent.contentHeight || self.height ) + self.y ;
} ;

Box.align.bottomRight = function bottomRight( absolute , self , parent ) {
	absolute.x += parent.width - ( parent.contentWidth || self.width ) + self.x ;
	absolute.y += parent.height - ( parent.contentHeight || self.height ) + self.y ;
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

