M3.scraper = function (options) {
    var scraper = this;
    this.details = {
        fname: null,
        sname: null,
        email: null,
        comm_destinations_tel_num: null,
        company_name: null
    };

    function init(callback) {
        console.log(callback)
        onLoad();
        //When the scraper_insert.js script sends message containing DOM...
        chrome.runtime.onMessage.addListener(function (request, sender) {
            if (request.action == "getSource") {
                //Scrape details from page and call callback (probably fillForm function)
                scrape($(request.source));
                callback(scraper);
            }
        });

        window.onload = this.onLoad;

        //When the user navigates to a new page update the scrape
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (changeInfo.status == 'complete' && tab.active) {
                onLoad();
            }
        });
    }
    ;
    function scrape(page) {
        var phone = page.find("#phone").find('li').html();
        var name = page.find(".full-name").html();
        if (typeof phone == "undefined") {
            phone = "";
        }
        if (typeof name == "undefined") {
            name = "";
        }
        
        // GMAIL
        
        if(name == "") {
            name = page.find("span.gD[email], div.n6[email]").first().text(); //.n6 is new inbox layout
        }

        scraper.details.fname = name.split(' ')[0];
        scraper.details.sname = name.substr(name.indexOf(' ') + 1);
        scraper.details.email = page.find("#email").find('a').html() || page.find("span.gD[email], div.n6[email]").first().attr('email');
        scraper.details.comm_destinations_tel_num = phone.match(/[0-9]+/g);
        scraper.details.company_name = page.find("a[name='company']").html();
        scraper.details.locality = page.find('.locality').text();
    }
    ;
    function onLoad() {
        chrome.tabs.executeScript(null, {
            file: "/scraper_insert.js"
        }, function () {
            // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (chrome.runtime.lastError) {
                //message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
            }
        });
    }
    ;
    
    init(options.callback);
};