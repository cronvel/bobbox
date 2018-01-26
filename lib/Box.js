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



function Box( ctx , options ) {
	if ( ctx instanceof Box ) {
		this.parent = ctx ;
		this.doc = ctx.doc ;
	}
	else {
		this.parent = null ;
		this.doc = ctx ;
	}
	
	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.width = options.width || 0 ;
	this.height = options.height || 0 ;
	this.align = options.align && Box.align[ options.align ] ? options.align : 'topLeft' ;
}

module.exports = Box ;



// Return absolute coordinates
Box.prototype.getAbsolute = function getAbsolute() {
	if ( ! this.parent ) { return { x: this.x , y: this.y } ; }
	
	var absolute = this.parent.getAbsolute() ;
	
	Box.align[ this.parent.align ]( absolute , this , this.parent ) ;
	
	return absolute ;
} ;



Box.align = {} ;



Box.align.topLeft = function topLeft( absolute , self , parent ) {
	absolute.x += self.x ;
	absolute.y += self.y ;
} ;



Box.align.topRight = function topRight( absolute , self , parent ) {
	absolute.x += parent.width - self.width + self.x ;
	absolute.y += self.y ;
} ;



Box.align.top = function top( absolute , self , parent ) {
	absolute.x += ( parent.width - self.width ) / 2 + self.x ;
	absolute.y += self.y ;
} ;


