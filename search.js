var current_request = null;

M3.search = {
    current_request: null,
    init: function (el) {
        el.on('input', function () {
            var input = $(this).val();
            if (!input) { //if input is empty
                $('body').addClass('create_contact');
                $('body').removeClass('search_contact');
            } else {
                $('body').removeClass('create_contact');
                $('body').addClass('search_contact');
                this.search(input, function (data) {
                    $('div.search_contact table').empty();
                    if (input != "") {
                        var first = true;
                        for (var key in data) {
                            var row = $("<tr></tr>");
                            if (first) {
                                row.addClass("selected");
                                first = false;
                            }
                            row.on("click", function () {
                                showContact(data[key].id, data[key]);
                            });
                            $('div.search_contact table').append(row.append("<td><strong>" + data[key].fname + " " + data[key].sname + "</strong><br>" + data[key].company_name + "</td>")
                                    .append("<td>" + data[key].comm_destinations_email + "</td>"));
                        }
                    }
                });
            }
        });
    },
    search: function (keyword, callback) {
        if (keyword == "") {
            return {};
        }

        if (this.current_request != null) {
            this.current_request.abort();
        }

        this.current_request = $.ajax({
            url: 'http://common.tritoncode.com/script/simplecontact/search.php',
            method: 'get',
            data: {
                keyword: keyword
            }
        })
                .done(function (data) {
                    data = $.parseJSON(data);
                    callback(data.data);
                    this.current_request = null;
                });
    }
};


$(".search_contact").on("mouseover", "tr", function () {
    $('.search_contact tr').removeClass("selected");
    $(this).addClass("selected");

});