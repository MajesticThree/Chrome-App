var M3 = {};

var localStorage = null;
chrome.storage.local.get(null, function (result) {
    localStorage = result;
});

var spinner = $('<i class="fa fa-spinner fa-spin"></i>');

function initialise() {
    $('#create-contact-form').html();
    $('#create-contact-form').append(spinner);

    checkOptions(function (complete) {

        loadContactForms();
        M3.ui.init();

        if (complete == false) {
            $('i.options').trigger('click');
            console.log('triggered')
        } else {
            chrome.storage.local.get(null, function (result) {

                var form = new M3.form({
                    url: result.api_frontend + "/forms/bf/json/",
                    id: result.default_form,
                    el: $("div#create-contact-form"),
                    callback: function () {
                        form.fillForm(scraper);
                        M3.ui.update();
                    }
                });
                var scraper = new M3.scraper({
                    callback: form.fillForm
                });
                form.onSubmit = function () {
                    form.submit_button.attr('disabled', 'disabled');
                    var box = new M3.alertbox({
                        type: 'info'
                    }).content("<i class='fa fa-spinner fa-spin'></i><strong> Creating contact...</strong>");
                    M3.ui.top_bar.append(box.el);
                };
                form.onSuccess = function (data) {

                    var box = new M3.alertbox({
                        type: 'success'
                    }).content("<strong>Success!</strong>");
                    M3.ui.top_bar.append(box.el);

                    form.resetForm();
                };
                form.onError = function (data) {
                    form.resetSubmit();
                    var error_box = new M3.alertbox({
                        type: "danger",
                        close: true
                    });
                    error_box.content($("<strong>Error: " + JSON.stringify(data.response.objForm.submit_errors) + "</strong>"));
                    $('#bottom_bar').prepend(error_box.el);
                };
            });
        }
    });



}

$(function () {

    $('i.options').on('click', function () {
        $('body').toggleClass('options');
        $('body').toggleClass('create_contact');
        $(this).toggleClass('rotate');
        $('i.back').toggleClass('rotate');
    });
    
    initialise();

});

function setDisplayConnectionDetails()
{
    chrome.storage.local.get(null, function (result) {
        var objKey = result;
        if (typeof objKey != 'undefined')
        {
            if (typeof objKey.request_key != 'undefined')
            {
                var element = $('.connection-details');
                element.append('<small class="text-muted">Connected to ' + objKey.request_url + '</small><br/>');
                element.append('<small class="text-muted">Authenticated as ' + objKey.request_user + '</small><hr/>');
                element.show();
                return;
            }//end if
        }//end if

        var element = $('.connection-details');
        element.append('<small class="text-danger">Not connected</small>').show();
    });
}//end function

function loadContactForms() {
    $('#default_form').removeAttr('disabled').append($('<option></option>').val('').text('Loading data...'));

    //check if forms are cached
    chrome.storage.local.get(null, function (result) {
        var objKey = result;
        if (typeof objKey != 'undefined')
        {
            if (typeof objKey.contact_forms != 'undefined')
            {
                $('#default_form').empty().append($('<option></option>').val('').text('--select--'));
                $.each(objKey.contact_forms, function (form, id) {
                    if (typeof objKey.default_form != 'undefined' && id == objKey.default_form) {
                        $('#default_form').append($('<option selected></option>').val(id).text(form));
                    } else {
                        $('#default_form').append($('<option></option>').val(id).text(form));
                    }//end if
                });

                return;
            }//end if

            console.log('Requesting available forms...');
            //request forms
            $.ajax({
                url: objKey.api_url + '/mi-chrome-apps/contacts/simple/read-forms-available',
                method: 'post',
                data: {
                    digest: objKey.request_key
                }
            })
                    .done(function (data) {
                        console.log('Processing form data...');
                        console.log(data);
                        if (data.error == 1)
                        {
                            $('#default_form').empty().attr('disabled', true).append($('<option></option>').val('').text('Forms could not be loaded'));
                            return;
                        }//end if

                        chrome.storage.local.set({'contact_forms': data.response}, function (result) {
                            return loadContactForms();
                        });
                    })
                    .fail(function () {
                        $('#default_form').empty().attr('disabled', true).append($('<option></option>').val('').text('Forms could not be loaded'));
                        console.log('Forms could not be loaded');
                        return;
                    });
        }//end if
    });
}//end function

$(function () {
    $('#btn-options-form').on('click', function () {
        chrome.tabs.create({'url': 'chrome-extension://' + chrome.runtime.id + '/options.html'});
    });
    $('#btn-create-contact-form').on('click', function () {
        if ($('body').hasClass("create_contact")) {
            //createContact();
            $(this).parent().append('<span id="info"><i class="fa fa-circle-o-notch fa-spin fa-fw"></i><strong style="padding-left:5px">Creating contact...</strong></span>');
            $(this).hide();
        } else if ($('body').hasClass('search_contact')) {

        }


    });
});

function clearBar() {
    $('.btn-primary').attr('disabled', false);
    $('.btn-primary').show().parent().find('#info').remove();
    $('.btn-primary').parent().removeClass('alert-success alert-error').addClass("alert-info");
}

function clearForm() {

    clearBar();
}

function createContact() {

    var URL = "";

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
//        URL = tabs[0].url;
    });

    //compile the data
    var objData = {
        fname: $('.contact_firstname').val(),
        sname: $('.contact_lastname').val(),
        email: $('.contact_email').val(),
        tel_num_country_id: null,
        comm_destinations_tel_num: $('.contact_phone').val(),
        company_name: $('.contact_company').val(),
        field161: URL,
        form_id: 89
    };


    var form_id = 89;

    //load saved settings
    objStorage.get(null, function (result) {
        console.log(result);
        var objKey = result;
        if (typeof objKey != 'undefined') {
            if (typeof objKey.request_key != 'undefined') {
                //set additional data items
                objData.digest = objKey.request_key;

                //send the data
                console.log('Connecting to server...');
                console.log(objData);
                $.ajax({
                    url: objKey.api_url + '/mi-chrome-apps/contacts/simple/create-contact',
                    method: 'post',
                    data: objData,
                })
                        .done(function (data) {
                            console.log('Processing contact operation response...');

                            if (data.error == 1) {

                                console.log(data.response);

                                $('.btn-primary')
                                        .parent().addClass('alert-error').append('<span id="info"><strong style="padding-left:5px">Error: </strong>check log for details!</span>');
                                ;

                                setTimeout(function () {
                                    clearBar();
                                }, 3000);

                                return;

                            } else {
                                if ($('#journey').val() != 67) {
                                    $('#info').find("strong").html("Starting contact on journey...");
                                    console.log('Contact has been created successfully.');

                                    startJourney($('#journey').val(), data.response.id, function (response) {
                                        success();
                                    });
                                } else {
                                    success();
                                }


                            }
                        })
                        .fail(function () {
                            console.log('Contact could not be created. An unknown error has occurred.');
                        });
            }
        }
    });

    if ($('#remember_form').is(':checked') && form_id != '') {
        objStorage.set({'remember_form_id': form_id}); //$('#use_form').val()
    }
}


function success() {
    $('.create_contact button.btn-primary').parent().removeClass('alert-info').addClass("alert-success").find('#info').html("<strong>Success!</strong>");
    setTimeout(function () {
        clearForm();
    }, 2000);
}