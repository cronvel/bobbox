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



function Line( doc , options ) {
	Box.call( this , doc , options ) ;
	this.contentWidth = 0 ;
	this.contentBoxes = [] ;
}

Line.prototype = Object.create( Box.prototype ) ;
Line.prototype.constructor = Line ;

module.exports = Line ;



Line.prototype.appendContentBox = function appendContentBox( contentBox ) {
	contentBox.parent = this ;
	if ( this.height < contentBox.height ) { this.height = contentBox.height ; }
	this.contentBoxes.push( contentBox ) ;
} ;



Line.prototype.render = function render() {
	this.contentBoxes.forEach( contentBox => contentBox.render() ) ;
} ;

