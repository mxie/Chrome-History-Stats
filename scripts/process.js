function showStats(div) {
    var twoWks_ms = 1000 * 60 * 60 * 24 * 7 * 2;
    var twoWksAgo = (new Date).getTime() - twoWks_ms;

    var query = {
        text: '',
        startTime: twoWksAgo,
        maxResults: 1000
    };

    // using chrome API to grab the most recent 1000 history items (urls) from within the past 2 weeks
    chrome.history.search(
        query,
        function (results) {
            var urlCounts = {};

            // make the URL into a link so that we can just grab its hostname later
            var makeLink = function(url) {
                var link = document.createElement("a");
                link.href = url;
                return link;
            };

            // loop through all the history items and grab their URLs and visit counts
            for (var i = 0; i < results.length; ++i) {
                var l = makeLink(results[i].url);
                var url = l.hostname;
                var count = results[i].visitCount;

                if (url) {
                    urlCounts[url] = urlCounts[url] ? urlCounts[url] + count : count;
                }
            }

            // had a hash before, let's make it into an array for the pie chart
            var urlCounts2 = new Array();
            for (url in urlCounts) {
                urlCounts2.push([url, urlCounts[url]]);
            }
            urlCounts2.sort(sortUrls);
            
            // pie time!
            makeChart(urlCounts2, div);
        }
    );
}



// sorting function for the array of URLs
function sortUrls(a, b) {
    return b[1]-a[1];
}

// uses jqPlot plugin to create the pie chart
function makeChart(urlCounts, div) {
    var visits = 0;
    for (var i = 0; i < urlCounts.length; ++i) {
        visits += urlCounts[i][1];
    }
    // show some totals
    $('#info').html('Websites: ' + urlCounts.length + ' | Visits: ' + visits);
    
    $(document).ready(function() {
        $.jqplot.config.enablePlugins = true;

        // creates the pie chart itself
        chart = $.jqplot(div, [urlCounts], {
            title: 'Breakdown of Your Browser History',
            seriesDefaults: {
                renderer: $.jqplot.PieRenderer,
                rendererOptions: {
                    startAngle: -90,
                    showDataLabels: true,
                    dataLabelPositionFactor: 0.75
                }
            },
        });
        
        // add some click action here to show data
        $('#piechart').bind('jqplotDataClick',
            function (ev, seriesIndex, pointIndex, data) {
                var info = data.toString().split(",");
                var percent = Math.round((info[1]/visits)*100);
                $('#pieinfo').html('You\'ve visited <span id="data">' + info[0] 
                                    + '</span> about <span id="data">' + info[1]
                                    + '</span> times <br/>within the past 2 weeks. That is <span id="data">~'
                                    + percent + '%</span> of all visits.');
                $('#gonow').html('<a href="http://'+info[0]+'" target="_blank">Go there now!</a>');
            }
        );
        $(document).unload(function() {$('*').unbind(); });
    });
}

$(document).ready(function() {
  showStats('piechart')
});
