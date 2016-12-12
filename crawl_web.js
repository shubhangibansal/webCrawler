"use strict";

var util = require('util');
var async = require('async');
var lodash = require('lodash');

var request = require('request');
var cheerio = require('cheerio'); //for parsing html data
var URL = require('url-parse'); //for parsing links

var START_URL = "https://medium.com";

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);

var resp = []; //Array which will contain all unique links and will be send as csv in response
var count = 0;


//Function to convert array of links in csv format
function arrToCSV(data) {
  var csv = [];
  data.forEach(function(row) {
    csv.push(row);
  });
  csv = csv.join("\n");
  return csv;
}


var crawledData = {

  getData: function(req, res, next) {


    pagesToVisit.push(START_URL);
    resp.push(START_URL);

    var q = async.queue(function(uri, callback) {
      console.log("##### uri", uri);
      pagesVisited[uri] = true;
      numPagesVisited++;

      async.whilst(function() {
          console.log("Receiving callback", numPagesVisited);
          return count < resp.length;

        },
        function(callb) {

          // Make the request
          console.log("Visiting page " + uri);
          request(uri, function(error, response, body) {

            // Check status code (200 is HTTP OK)
            //console.log("Status code: " + response.statusCode);
            if (!response || response.statusCode !== 200) {
              return callb();
            }
            // Parse the document body
            var $ = cheerio.load(body);

            collectInternalLinks(q, $);
            return callb();

          });
        },
        function(err) {

          //console.log("Async callback checking ----", numPagesVisited);
          if (err) {
            util.log(err);
            return next(err);
          }
          return callback();
        });



    }, 5);

    if (count == 0)
      q.push(START_URL);

    //console.log("COUNT  ", count);
    q.drain = function() {
      console.log("QUEUE FINAL DRAIN");
      console.log("Reached max limit of number of pages to visit.");
      req.crawlLinks = resp;
      return next();
    };

    function collectInternalLinks(q, $) {
      //console.log("q ??????: ");
      count++;

      /*   q : 

      { _tasks: 
       DLL {
         tail: 
          { data: 'https://www.condenast.com/reprints-permissions',
            callback: [Function: noop],
            prev: [Object],
            next: undefined },
         head: 
          { data: 'http://arstechnica.com/author/cyrus-farivar/',
            callback: [Function: noop],
            prev: undefined,
            next: [Object] },
         length: 1772 },
      concurrency: 5,
      payload: 1,
      saturated: [Function: noop],
      unsaturated: [Function: noop],
      buffer: 1.25,
      empty: [Function: noop],
      drain: [Function],
      error: [Function: noop],
      started: true,
      paused: false,
      push: [Function: push],
      kill: [Function: kill],
      unshift: [Function: unshift],
      process: [Function: process],
      length: [Function: length],
      running: [Function: running],
      workersList: [Function: workersList],
      idle: [Function: idle],
      pause: [Function: pause],
      resume: [Function: resume] }
    */


      var absoluteLinks = $("a[href^='http']");

      console.log("Found " + absoluteLinks.length + " absolute links on page");

      absoluteLinks.each(function() {
        pagesToVisit.push($(this).attr('href'));
        pagesToVisit = lodash.uniq(pagesToVisit);

        resp.push($(this).attr('href'));
        var len = resp.length;

        //This will ensure that no repeated link will be saved again
        resp = lodash.uniq(resp);
        var len2 = resp.length;

        if (len2 === len)
          q.push($(this).attr('href'));
        //console.log("queue length", q._tasks.length);

      });
    }


  },

  responseInCSV: function(req, res, next) {
    var resp = req.crawlLinks;
    var fileName = "download_crawledData";
    var data;
    var error;
    try {
      res.set('Content-Disposition', 'attachment; filename="' + fileName + '.csv"');
      data = arrToCSV(resp);
      console.log("####### length", data.length);
      res.write(data);
      return res.end();
    } catch (e) {
      util.log(e);
      error = new Error("Unable to create csv");
      error.status = 405;
      return next(error);
    }
  },

  error: function(err, req, res, next) {
    console.log("## error ##", err);
    if (err || err.data || err.status) {
      var response = {};
      response.error = err;
      res.json(response);
    }
  }

};

module.exports = crawledData;

(function() {
  if (require.main === module) {

  }

}());