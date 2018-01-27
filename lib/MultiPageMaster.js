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



var Master = require( './Master.js' ) ;
var PageMaster = require( './PageMaster.js' ) ;



function MultiPageMaster( doc , options = {} ) {
	Master.call( this , doc , options ) ;
	this.currentPage = null ;
	this.pages = [] ;
}

MultiPageMaster.prototype = Object.create( Master.prototype ) ;
MultiPageMaster.prototype.constructor = MultiPageMaster ;

module.exports = MultiPageMaster ;



MultiPageMaster.prototype.appendBox = function appendBox( box ) {
	if ( ! this.currentPage ) {
		this.newPage() ;
	}
	
	this.currentPage.appendBox( box ) ;
} ;



MultiPageMaster.prototype.newPage = function newPage() {
	this.currentPage = new PageMaster( this , {
		width: this.width ,
		height: this.height
	} ) ;
	
	this.pages.push( this.currentPage ) ;
} ;



MultiPageMaster.prototype.render = function render() {
	this.pages.forEach( page => {
		this.doc.newPage() ;
		page.render() ;
	} ) ;
} ;

