$(function () {
    $('.journey').each(function () {
        var el = $(this);
        var default_journey = 0;
        chrome.storage.local.get("default_journey", function (data) {
            default_journey = data.default_journey;
        });

        getJourneys(function (journeys) {
            for (var i = 0; i < journeys.length; i++) {
                if (journeys[i].id != 67) {
                    el.append("<option value='" + journeys[i].id + "' " + ((default_journey == journeys[i].id) ? "selected " : "") + " >" + journeys[i].journey + "</option>");
                }
            }
        });

    });
});

function getJourneys(callback) {
    $.ajax({
        url: 'http://common.tritoncode.com/script/simplecontact/getjourneys.php',
        method: 'get',
        data: {
        }
    })
            .done(function (data) {
                data = $.parseJSON(data);
                callback(data.data);
            });
}

function startJourney(journey, u_id, callback) {
    $.ajax({
        url: 'http://common.tritoncode.com/script/simplecontact/startonjourney.php',
        method: 'get',
        data: {
            journey: journey,
            u_id: u_id
        }
    })
            .done(function (data) {
                data = $.parseJSON(data);
                callback(data.data);
            });
}

function getJourneysForContact(id, callback) {
    $.ajax({
        url: 'http://common.tritoncode.com/script/simplecontact/getStartedJourneys.php',
        method: 'get',
        data: {
            u_id: id
        }
    })
            .done(function (data) {
                data = $.parseJSON(data);
                callback(data.data);
            });

}

function showContact(id, info) {
    $('body').removeClass("create_contact");
    $('body').removeClass("search_contact");
    $('body').addClass("view_contact");
    if (info != null) {

    }
    getJourneysForContact(id, function (data) {
        for (var key in data) {
            var row = $("<tr></tr>");
            row.append("<td>" + data[key].name + "</td>");
            $('div.view_contact .journeys').append(row);
        }
    });
}