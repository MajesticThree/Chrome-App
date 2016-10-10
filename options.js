function authenticateApplication(callback) {

    chrome.storage.local.get(null, function (objData) {

        jQuery.each(objData, function (k, v) {
            if (v == "") {
                if (k != "default_form") {
                    var box = new M3.alertbox({
                        type: 'warning'
                    }).content("<span>All fields should be completed: " + k + "</span>");
                    M3.ui.top_bar.append(box.el);
                    setTimeout(function () {
                        box.el.fadeOut("slow", function () {
                            $(this).remove();
                        });
                    }, 2000);
                    callback(false);
                }
            }
        })

        var box = new M3.alertbox({
            type: 'info'
        }).content("<span><strong> Connecting</strong> to server...</span>");
        M3.ui.top_bar.append(box.el);

        // THESE NEED TO BE SPECIFIED FOR AUTH
        objData.username = objData.api_name;
        objData.password = objData.api_pass;
        objData.apikey = objData.api_key;
        objData.apifrontend = objData.api_frontend;

        jQuery.ajax({
            url: objData.api_url + '/mi-chrome-apps/authenticate/app/simple/contact',
            method: 'post',
            data: objData
        })
                .done(function (data) {
                    box.el.append("<br><strong>Connected</strong>");
                    var objResponse = data;

                    if (objResponse.error == 1) {
                        console.log(data);
                        box.changeType('danger');
                        box.el.append('<br><span>Details could not be authenticated</span>');
                        return false;
                    } else {
                        box.changeType('success');
                        box.el.append('<br><span>Details authenticated</span>');
                        setTimeout(function () {
                            box.el.fadeOut("slow", function () {
                                $(this).remove();
                            });
                        }, 2000);
                        chrome.storage.local.set({request_key: data.response});
                        callback(true);
                    }

                })
                .fail(function () {
                    var box = new M3.alertbox({
                        type: 'danger'
                    }).content("<span>An unknown problem has occured. The server could not be contacted</span>");
                    M3.ui.top_bar.append(box.el);
                    callback(false);
                });
    });

    //make sure all fields have been completed

}//end function

//var default_vals = {
//    api_name: "",
//    api_pass: "",
//    api_key: "",
//    api_url: ""
//};

$(function () {
    chrome.storage.local.get(null, function (result) {
        //console.log(result);
        if (result != null) {
            if (result.hasOwnProperty("api_name") && result.api_name != "") {
                $("#api_name").val(result.api_name);
            }
            if (result.hasOwnProperty("api_pass") && result.api_pass != "") {
                $("#api_pass").val(result.api_pass);
            }
            if (result.hasOwnProperty("api_key") && result.api_key != "") {
                $("#api_key").val(result.api_key);
            }
            if (result.hasOwnProperty("api_url") && result.api_url != "") {
                $("#api_url").val(result.api_url);
            }
            if (result.hasOwnProperty("api_frontend") && result.api_frontend != "") {
                $('#api_frontend').val(result.api_frontend);
            }
            if (result.hasOwnProperty("default_form") && result.default_form != "") {
                $('#default_form').val(result.default_form);
            }
        }
    });


    $('.options #btn-authenticate-form').on('click', function () {
        var vals = {
            api_name: $("#api_name").val(),
            api_pass: $("#api_pass").val(),
            api_key: $("#api_key").val(),
            api_url: $("#api_url").val(),
            api_frontend: $("#api_frontend").val(),
            default_form: $('#default_form').val()
        };
        chrome.storage.local.set(vals);
        authenticateApplication(function (valid) {
            if (valid == true) {
                $('.navbar i.options').trigger('click');
                loadContactForms();
                console.log(valid);
                initialise();
            }
        });
    });
});

