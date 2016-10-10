M3.form = function (options) {
    this.el = null;
    this.submit_button = null;
    this.url = options.url;
    this.id = options.id;
    this.el = options.el;
    this.onSuccess = function () {};
    this.onSubmit = function () {};
    this.onFail = function () {};
    this.onError = function() {};
    this.submit_button = $("<input type='submit' id='btn-create-contact-form' class='btn btn-primary' value='Submit' />");
    var form = this;
        
    function init(options) {

        
        $.ajax({
            url: options.url + options.id,
            dataType: 'json',
        })
                .done(function (objData) {
                    form.el.empty();
//                    console.log(objData);
                    form.el.prepend("<h1><span>" + objData.response.objForm.form + "</span></h1>");
                    var form_el = buildForm(objData);
                    form.submit_button.attr("id", options.id + "_submit_button");
                    form.submit_button.on("click", onSubmit);
                    form.el.append(form_el);

                    form.el.append(form.submit_button);

                    options.callback(form);
                    return form;
                })
                .fail(function () {
                    console.log(form);
                    form.el.html('An error has occurred, please try again later');
                    return false;
                });
    }
    ;
    this.fillForm = function (scraper) {
        var objStorage = chrome.storage.local;
        //check if request has been saved already
        objStorage.get('request_key', function (result) {
            var objKey = result;
            if (typeof objKey != 'undefined') {
                if (typeof objKey.request_key == 'undefined') {
                    authenticateApplication(function () {});
                }
            }
        });
        for (var key in scraper.details) {
            if (scraper.details[key] != "") {
                form.submit_button.addClass("pulse-button");
                $('#' + key).val(scraper.details[key]);
            }
        }
    }
    ;
    function buildForm(objData) {

        //check if errors were encountered
        if (objData.error == 1) {
            alert(objData.response);
            return false;
        }//end if

        //confirm form data has been received
        if (typeof objData.response.objForm == "undefined") {
            alert("Form could not retrieved");
            return false;
        }//end if

        //start building the form
        var form = $("<form></form>")
                .attr("id", this.id)
                .attr("method", "post");
        var table = $("<table></table>");
        //do form elements
        var i = 0;
        var row = $("<tr></tr>");
        $.each(objData.response.objForm.objFormElements, function (name, objElement) {
            i++;
            var form_element = buildElement(objElement);
            if (form_element != false) {
                row.append($("<td></td>").append(form_element));
            }
            if ((i % 2) == 0) {
                table.append(row);
                row = $("<tr></tr>");
            }
        });
        form.append(table);
        return form;
    }
    ;
    function buildElement(objElement) {
        switch (objElement.type)
        {
            default:
                var element = $("<input />", {"type": objElement.type});
                if (objElement.type == "checkbox" && objElement.value == "1")
                {
                    element.attr("checked", true);
                }
                break;
            case "submit":
                //ignore submit buttons
                element = false;
                break;
            case "radio":
                var element = $("<div></div>");
                if (typeof objElement.options.value_options != "undefined")
                {
                    $.each(objElement.options.value_options, function (key, value) {
                        var e = $("<input />", {type: "radio", value: key, text: value, name: objElement.name});
                        //append option to select
                        e.appendTo(element);
                    });
                }//end if
                break;
            case "select":
                var element = $("<select></select>");
                //add options
                if (typeof objElement.options.empty_option != "undefined")
                {
                    element.append($("<option></option>", {value: '', text: objElement.options.empty_option}));
                }//end if
                if (typeof objElement.options.value_options != "undefined")
                {
                    $.each(objElement.options.value_options, function (key, value) {
                        var e = $("<option></option>", {value: key, text: value});
                        //check if value matched set value received
                        if (value == objElement.value)
                        {
                            e.attr("selected", true);
                        }//end if

                        //append option to select
                        e.appendTo(element);
                    });
                }//end if
                break;
            case "textarea":
                var element = $("<textarea></textarea>");
                break;
        }//end switch

        if (element == false)
        {
            return element;
        }//end if

        //set element attributes
        $.each(objElement.attributes, function (key, value) {
            element.attr(key, value);
        });
        element.attr('required', 'required');
        //create label
        var label = $("<label></label>", {text: objElement.label});
        //create container
        var container = $("<div></div>", {id: "form_element_" + objElement.name});//.attr("class", "form_element_collection form_element_" + objElement.type);
        //add element to label
//            element.appendTo(label);
        //add label to container
        
        element.addClass("form-control");
        container.append(element);
        container.append(label);
        return container;
    }
    ;
    function processSubmit() {

        $.ajax({
            url: form.url + form.id,
            type: 'post',
            data: form.el.find('form').serialize()
        })
                .done(function (data) {
                    if ((data.error == 1) || (data.submit_errors != null && Object.keys(data.response.objForm.submit_errors).length > 0)) {

                        form.onError(data);
                
                    } else {

                        form.onSuccess();

                    }
                    //deal with form errors if any etc...
                    console.log(data);
                })
                .fail(function () {
                    form.onError({response: {submit_errors: "AJAX request failed."}});
//                    console.log('A failure occured, data could not be sent');
                });
        //print form data
//    console.log(jQuery("#" + form_id).serialize());
        return false;
    }
    ;
    function onSubmit(e) {
        e.preventDefault();
        processSubmit();
        form.onSubmit();
    }
    ;

    this.resetForm = function () {
        form.el.find('input').val('');
        form.resetSubmit();
    };
    this.resetSubmit = function() {
        form.submit_button.removeAttr('disabled');
    }

    init(options);
    return form;
};