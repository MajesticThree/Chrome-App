function checkOptions( callback ) {
    
    chrome.storage.local.get(null, function (objData) {
        var complete = true;
        objData.username = objData.api_name;
        objData.password = objData.api_pass;
        objData.apikey = objData.api_key;
        jQuery.each(objData, function (k, v) {
            if (v == "" || typeof v == "undefined") {
                complete = false;
            }
        });
        callback(complete);
    });

}