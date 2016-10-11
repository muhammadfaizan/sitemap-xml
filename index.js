"use strict";

var stream = require('stream');
var util = require('util');

function SitemapStream(host) {
	stream.Transform.call(this, { objectMode: true });
	this._headOutputted = false;
	this.host = host;
}

util.inherits(SitemapStream, stream.Transform);

if (!String.prototype.encodeHTML) {
	String.prototype.encodeHTML = function () {
		return this.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	};
}

SitemapStream.prototype._transform = function(chunk, encoding, callback) {
	var loc = function(path){
		return (this.host + path).encodeHTML();
	}
	if (!this._headOutputted) {
		this.push('<?xml version="1.0" encoding="UTF-8"?>\r\n', 'utf-8');
		this.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', 'utf-8');
		this._headOutputted = true;
	}

	if (typeof(chunk) === 'string') {
		chunk = {
			loc: chunk
		};
	}

	this.push('<url>', 'utf-8');
	this.push('<loc>', 'utf-8');
	this.push((this.host + chunk.loc).encodeHTML(), 'utf-8');
	this.push('</loc>', 'utf-8');

	if (chunk.lastmod) {
		this.push('<lastmod>', 'utf-8');
		this.push(chunk.lastmod.encodeHTML(), 'utf-8');
		this.push('</lastmod>', 'utf-8');
	}

	if (chunk.changefreq) {
		this.push('<changefreq>', 'utf-8');
		this.push(chunk.changefreq.encodeHTML(), 'utf-8');
		this.push('</changefreq>', 'utf-8');
	}

	if (chunk.priority) {
		this.push('<priority>', 'utf-8');
		this.push(chunk.priority.encodeHTML(), 'utf-8');
		this.push('</priority>', 'utf-8');
	}

	if (chunk.video) {
		this.push('<video:video>', 'utf-8');
		//support for videos

		if (chunk.video.duration) {
			this.push('<video:duration>', 'utf-8');
			this.push(chunk.video.duration.encodeHTML(), 'utf-8');
			this.push('</video:duration>', 'utf-8');
		}

		if (chunk.video.contentLoc) {
			this.push('<video:content_loc>', 'utf-8');
			this.push(chunk.video.contentLoc.encodeHTML(), 'utf-8');
			this.push('</video:content_loc>', 'utf-8');
		}

		if (chunk.video.description) {
			this.push('<video:description>', 'utf-8');
			this.push(chunk.video.description.encodeHTML(), 'utf-8');
			this.push('</video:description>', 'utf-8');
		}

		if (chunk.video.title) {
			this.push('<video:title>', 'utf-8');
			this.push(chunk.video.title.encodeHTML(), 'utf-8');
			this.push('</video:title>', 'utf-8');
		}

		if (chunk.video.thumbnailLoc) {
			this.push('<video:thumbnail_loc>', 'utf-8');
			this.push(chunk.video.thumbnailLoc.encodeHTML(), 'utf-8');
			this.push('</video:thumbnail_loc>', 'utf-8');
		}
		this.push('</video:video>', 'utf-8');
	}

	this.push('</url>', 'utf-8');
	callback();
};

SitemapStream.prototype._flush = function(callback) {
	this.push('</urlset>');
	callback();
};

module.exports = function(host) {
	if (typeof host != 'string'){
		throw new Error("Host must be string");
	}
	if (host.lastIndexOf('/') == host.length-1){
		host = host.slice(0, host.length-1);
	}
	return new SitemapStream(host);
};
