var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var helpers = require('../web/http-helpers');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

exports.handleRequest = function (req, res) {
  if (req.method === 'GET') {
    var requestUrl = url.parse(req.url);
    var filePath = archive.paths.siteAssets + requestUrl.path;

    // for root url, serve index.html
    if (requestUrl.path === '/') {
      filePath = archive.paths.siteAssets + '/index.html';
    }

    if (requestUrl.path !== '/') {
      filePath = archive.paths.archivedSites + requestUrl.path;
    }

    helpers.serveAssets(res, filePath);
    
  }

  if (req.method === 'POST') {

    var urlReceived = "";

    req.on('data', function(chunk) {
      urlReceived += chunk;
    });

    req.on('end', function(){
      if (urlReceived.indexOf('=') !== -1) {
        urlReceived = querystring.parse(urlReceived);
        urlReceived = JSON.stringify(urlReceived);
      }

      // urlReceived = JSON.parse(urlReceived).url;
      urlReceived = JSON.parse(urlReceived).url;
      // console.log(urlReceived)
      // urlReceived = urlReceived.substr(4);
      // Check if url is in the list, use isUrlInList
      // archive.readListOfUrls(function(sites) {
        archive.isUrlInList(urlReceived, function(notInList) {
          if (notInList) {
            archive.addUrlToList(urlReceived, function() {
              // Not in the list go downloadUrls
              // Else fetch it from isUrlArchived 
              // res.end();
              // console.log('url is not in list')
              helpers.serveAssets(res, archive.paths.siteAssets + '/loading.html', true);
              // download Urls
              archive.readListOfUrls(function(listOfUrls) {
                archive.downloadUrls(listOfUrls);
              });
            });
          } else {
            // in list
            // console.log("URL ALREADY IN LIST")
            archive.isUrlArchived(urlReceived, function(result) {
              if (result) {
                // console.log("URL is archived!")
                filePath = archive.paths.archivedSites + '/' + urlReceived;
                helpers.serveAssets(res, filePath);
              } else {
                // downloadURL???
                // Display loading html
                helpers.serveAssets(res, archive.paths.siteAssets + '/loading.html', true);
                //Download Urls
                archive.readListOfUrls(function(listOfUrls) {
                  archive.downloadUrls(listOfUrls);
                });
                // console.log("URL is not in archive")
              }
            });
          }
        });
      // });

      // archive.addUrlToList('./archives/sites.txt', urlReceived, function() {
      //   res.end();
      // });
    // res.end()
    });
  }
  // res.end(archive.paths.list);
};