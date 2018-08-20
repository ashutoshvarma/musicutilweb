function log(...args) {
    if (window.console && window.console.log) {
        console.log(...args);
    }
}

$.fn.log = function (...args) {
    log(this, ...args);
    return this;
}

function asyncAjaxJSON(payload, target, method, before, complete, sucess, error, metaData) {
    log('AJAX[%s] request to %s with payload %o', method, target, payload);
    $.ajax({
        url: target,
        type: method,
        data: JSON.stringify(payload),
        dataType: "json",
        contentType: "application/json",
        beforeSend: before(metaData),
        complete: complete(metaData),

        success: function (data) {
            sucess(data, metaData)
        },

        error: function (jqXHR, textStatus, errorThrown) {
            error(textStatus, errorThrown, metaData, jqXHR)
        }

    });
}


function toggleDOM(id, toggle, front = false) {
    var elem = $("#" + id);
    elem.css({ 'display': toggle ? 'block' : 'none' }).log('Toggle:', toggle);
    if (front == true) {
        elem.css({ 'z-index': toggle ? '1' : '-1' }).log('z-index:', toggle);
    }
}


function spinners(toggle, spinId) {
    // var spinner = $("#" + spinId);
    // spinner.css({ 'display': toggle ? 'block' : 'none' });
    // spinner.css({ 'z-index': toggle ? '1' : '-1' }).log('Toggle:', toggle);
    toggleDOM(spinId, toggle, true)
}


function errors(toggle, errorId, errorName = "Error", errorBody = "An unknown error occured", errorNameId = "search-error-small", errorBodyId = "search-error-p") {
    var error = $("#" + errorId);
    var errorNametag = error.find("#" + errorNameId);
    var errorBodytag = error.find("#" + errorBodyId);

    errorNametag.html(errorName);
    errorBodytag.html(errorBody);

    // error.css({ 'display': toggle ? 'block' : 'none' });
    // error.css({ 'z-index': toggle ? '1' : '-1' }).log('Toggle:', toggle);
    toggleDOM(errorId, toggle)
}



function beforeAjaxJson(metaData) {
    log('beforAjaxJson with metaData: %o', metaData);

    toggleDOM(metaData.parentId, false)

    spinners(true, metaData.spinnerId);
    errors(false, metaData.errorId);
}

function onErrorAjaxJson(textStatus, errorThrown, metaData, jqXHR) {
    log('onErrorAjaxJson with metaData: %o', metaData);

    try {
        errorJSON = JSON.parse(jqXHR.responseText);
        errors(true, metaData.errorId, errorJSON.error, errorJSON.message);
    } catch (err) {
        errors(true, metaData.errorId);
    }

    spinners(false, metaData.spinnerId);
    toggleDOM(metaData.parentId, true)

}

function afterAjaxJson(metaData) {
    log('afterAjaxJson with metaData: %o', metaData);

}


function enableCollapseListener() {
    $(".collapse[search]").on('show.bs.collapse', function () {

        var collapse_id = $(this).attr("id");
        var item_id = collapse_id.substring(0, collapse_id.length - 8);

        var spinner_id = item_id + "spinner";
        var error_id = item_id + "error";
        var itembody_id = collapse_id + "body";


        var item_headlink_id = item_id + "headlink";

        var searchItem = $("#" + item_id);



        var metaData = {
            spinnerId: spinner_id,
            itemId: item_id,
            parentId: itembody_id,
            errorId: error_id
        };

        if (searchItem.attr("status") != "complete") {
            asyncDownloadJson(searchItem.attr("source"), beforeAjaxJson, afterAjaxJson, sucessDownloadJson, onErrorAjaxJson, metaData);
        }


    });

}



function asyncSearch(q, max, before, after, sucess, error, metaData) {
    var data = {
        query: q,
        source: "default",
        html: 'yes',
        max: max
    };

    log("asyncSearch with payload:%o and metaData:%o", data, metaData);

    asyncAjaxJSON(data, "api/search", 'POST', before, after, sucess, error, metaData);
}


function sucessSearchJson(data, metaData) {
    spinners(false, metaData.spinnerId);
    errors(false, metaData.errorId);
    
    toggleDOM(metaData.parentId, true)


    var parentId = $("#" + metaData.parentId);
    parentId.html(data.data);
    enableCollapseListener();
}





//Download methods
function asyncDownloadJson(song_url, before, after, sucess, error, metaData) {
    var query = {
        source: "default",
        url: song_url,
    };
    asyncAjaxJSON(query, "api/download", 'POST', before, after, sucess, error, metaData);
}

function getDownloadButtonCol(name, id) {
    return '<div class="col d_flex mb-1 mx-1"><button class="btn btn-warning" type="button" id="' + id + '">' + name + '</button></div>';
}

function sucessDownloadJson(data, metaData) {

    spinners(false, metaData.spinnerId);
    errors(false, metaData.errorId);

    var itembody = $("#" + metaData.parentId);
    var item = $("#" + metaData.itemId);

    $.each(data, function (index, element) {
        var buttonId = metaData.itemId + "button" + index;
        var buttonCol_html = getDownloadButtonCol(element.quality, buttonId);

        itembody.append(buttonCol_html);

        var button = $("#" + buttonId);
        button.click(function () {
            window.location.href = element.url;
        });
    });

    item.attr("status", "complete");
}






$("#search-btn").click(function () {
    metaData = {
        spinnerId: "search-spinner",
        errorId: "search-error",
        searchBoxId: "search-box",
        parentId: "search-container"
    };
    var searchBox = $("#search-box");
    //alert(searchBox.val())

    asyncSearch(searchBox.val(), 10, beforeAjaxJson, afterAjaxJson, sucessSearchJson, onErrorAjaxJson, metaData);

});