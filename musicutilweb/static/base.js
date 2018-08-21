//Logging functions
function log(...args) {
    if (window.console && window.console.log) {
        console.log(...args);
    }
}

$.fn.log = function (...args) {
    log(this, ...args);
    return this;
}

//DOM manuplating functions
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


function errors(toggle, errorId, errorNameId = "search-error-name", errorBodyId = "search-error-body", errorName = "Error", errorBody = "An unknown error occured") {
    var error = $("#" + errorId);
    var errorNametag = error.find("#" + errorNameId);
    var errorBodytag = error.find("#" + errorBodyId);

    errorNametag.html(errorName);
    errorBodytag.html(errorBody);

    // error.css({ 'display': toggle ? 'block' : 'none' });
    // error.css({ 'z-index': toggle ? '1' : '-1' }).log('Toggle:', toggle);
    toggleDOM(errorId, toggle)
}



//Ajax Handling functions
function asyncAjaxJSON(payload, target, method, before, complete, sucess, error, metaData) {
    log('AJAX[%s] request to %s with payload %o and metaData %o', method, target, payload, metaData);
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
        errors(true, metaData.errorId, metaData.errorNameId, metaData.errorBodyId, errorJSON.error, errorJSON.message);
    } catch (err) {
        errors(true, metaData.errorId, metaData.errorNameId, metaData.errorBodyId);
    }

    spinners(false, metaData.spinnerId);
    toggleDOM(metaData.parentId, true)

}

function afterAjaxJson(metaData) {
    log('afterAjaxJson with metaData: %o', metaData);

}


function enableCollapseListener() {
    log("Collapse Lister Enabled.")
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

            errorId: error_id,
            errorNameId: error_id + "-name",
            errorBodyId: error_id + "-body",
        };

        if (searchItem.attr("status") != "complete") {
            asyncDownloadJson(searchItem.attr("source"), beforeAjaxJson, afterAjaxJson, sucessDownloadJson, onErrorAjaxJson, metaData);
        }


    });

}


function enableModalListener() {
    log('Modal Listener enabled')

    $('[data-target="#song-modal"]').click(function () {
        log('SongInfo Modal data-toggle clicked.')

        var idPrefix = "info-btn";

        itemId = this.id.substring(0, this.id.length - idPrefix.length);
        item = $('#' + itemId);



        metaData = {
            url: item.attr('source'),
            artist: $("#" + itemId + "artist").innerHTML,
            song: $("#" + itemId + "song").innerHTML,

            errorId: "song-modal-body-error",
            errorNameId: "song-modal-body-error-name",
            errorBodyId: "song-modal-body-error-body",

            spinnerId: "song-modal-body-spinner",

            searchBoxId: "search-box",
            parentId: "song-modal-body-content",

            albumTagId: "song-modal-body-content-album",
            yearTagId: "song-modal-body-content-year",
            lyricsBoxId: "song-modal-body-content-lyrics",

            songTagId: "song-modal-header-song",
            artistTagId: "song-modal-header-artist"
        };

        clearSongModal(metaData);

        $("#" + metaData.songTagId).html(metaData.song);
        $("#" + metaData.artistTagId).html(metaData.artist);
        $("#song-modal-footer-link").attr('href', metaData.url);

        ayncSongInfo(beforeAjaxJson, afterAjaxJson, sucessSongInfoJSON, onErrorAjaxJson, metaData);

    });
}



function asyncSearch(q, max, before, after, sucess, error, metaData) {
    var data = {
        query: q,
        source: "default",
        html: 'yes',
        max: max
    };

    asyncAjaxJSON(data, "api/search", 'POST', before, after, sucess, error, metaData);
}


function sucessSearchJson(data, metaData) {

    log("sucessSearchJson with recieved data:%o and metaData:%o", data, metaData)

    spinners(false, metaData.spinnerId);
    errors(false, metaData.errorId);

    toggleDOM(metaData.parentId, true)


    var parentId = $("#" + metaData.parentId);
    parentId.html(data.data);
    enableCollapseListener();
    enableModalListener();
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

    log("sucessDownloadJson with recieved data:%o and metaData:%o", data, metaData)

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


function ayncSongInfo(before, after, sucess, error, metaData) {
    payload = {
        url: metaData.url,
        source: "default",
    }
    asyncAjaxJSON(payload, "api/song", 'POST', before, after, sucess, error, metaData);
}

function sucessSongInfoJSON(data, metaData) {
    log("sucessSongInfoJSON with recieved data:%o and metaData:%o", data, metaData)


    $("#" + metaData.albumTagId).html(data.album);
    $("#" + metaData.yearTagId).html(data.year);

    $("#" + metaData.songTagId).html(data.name);
    $("#" + metaData.artistTagId).html(data.artist);

    var lyricsTag = $("#" + metaData.lyricsBoxId);

    data.lyrics.forEach(function (item, index, array) {
        lyricsTag.append(item + "\n");
    });



    spinners(false, metaData.spinnerId);
    errors(false, metaData.errorId);

    toggleDOM(metaData.parentId, true);

}

function clearSongModal(metaData) {
    nil = ""
    $("#" + metaData.albumTagId).html(nil);
    $("#" + metaData.yearTagId).html(nil);
    $("#" + metaData.lyricsBoxId).html(nil);
    $("#" + metaData.songTagId).html(nil);
    $("#" + metaData.artistTagId).html(nil);

    $("#song-modal-footer-link").attr('href', "#");
}





$("#search-btn").click(function () {
    log("'search-btn' clicked.")

    metaData = {
        spinnerId: "search-spinner",

        errorId: "search-error",
        errorNameId: "search-error-name",
        errorBodyId: "search-error-body",

        searchBoxId: "search-box",
        parentId: "search-container"
    };
    var searchBox = $("#search-box");

    asyncSearch(searchBox.val(), 10, beforeAjaxJson, afterAjaxJson, sucessSearchJson, onErrorAjaxJson, metaData);

});





