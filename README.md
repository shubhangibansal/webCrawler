# webCrawler
It is a small application allowing to crawl hyperlinks on a site.

Features
-----------

1) Here the concurrency of requesting data from a link has been maintained at 5 using queuing functionality of async module.

2) It is being ensured that same link does not get queued up again for processing using lodash module which identifies the unique data. 

3) And the data is generated in form of csv file.
