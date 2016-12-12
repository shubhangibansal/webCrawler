"use strict";

var crawlData = require('./crawl_web');

module.exports = function(app) {

	/**
	 * GET crawled data of a web page 
	 *
	 * @request:
	 * http://localhost:3333/getCrawledData
	 *
	 * @response CSV
	 * [list of urls]
	 *
	 * 
	 */
	app.get('/getCrawledData', crawlData.getData, crawlData.responseInCSV, crawlData.error);

};