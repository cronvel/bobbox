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



function Master( doc , options = {} ) {
	Box.call( this , doc , options ) ;
	this.master = this ;
	this.boxes = [] ;
	this.width = options.width || Infinity ;
	this.height = options.height || Infinity ;
}

Master.prototype = Object.create( Box.prototype ) ;
Master.prototype.constructor = Master ;

module.exports = Master ;



Master.prototype.appendBox = function appendBox( box ) {
    box.parent = this ;
    this.boxes.push( box ) ;
} ;



Master.prototype.render = function render() {
	this.boxes.forEach( box => box.render() ) ;
} ;

