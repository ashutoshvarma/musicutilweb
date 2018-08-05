$.fn.hasAttr = function (name) {
    return typeof attr !== typeof undefined && attr !== false;
};




function asyncDownloadJson(download_url, before, after, sucess, error, metaData) {
    var query = {
        source: "chiasenhac_vn",
        url: download_url
    };

    $.ajax({
        url: "download/",
        type: "POST",
        data: JSON.stringify(query),
        dataType: "json",
        contentType: "application/json",
        beforeSend: before(metaData),
        complete: after(metaData),

        success: function (data) {
            sucess(data, metaData)
        },

        error: function (textStatus, errorThrown) {
            error(textStatus, errorThrown, metaData)
        }

    });

}



function getDownloadButtonCol(name, id) {
    return '<div class="col d_flex mb-1 mx-1"><button class="btn btn-warning" type="button" id="' + id + '">' + name + '</button></div>';
    
}



function beforeDownloadJson(metaData) {
    var spinner = $("#" + metaData.spinnerId);
    var error = $("#" + metaData.errorId);

    error.css({ 'opacity': 0 });
    spinner.css({ 'opacity': 1 });
}

function onErrorDownloadJson(textStatus, errorThrown, metaData) {
    var error = $("#" + metaData.errorId);
    var spinner = $("#" + metaData.spinnerId);

    error.find("small").text = textStatus;
    error.find("p").text = errorThrown;

    error.css({ 'opacity': 1 });
    spinner.css({ 'opacity': 0 });

}

function afterDownloadJson(metaData) {
    var spinner = $("#" + metaData.spinnerId);
    var error = $("#" + metaData.errorId);

    spinner.css({ 'opacity': 0 });
    error.css({ 'opacity': 0 });
}

function sucessDownloadJson(data, metaData) {

    var itembody = $("#" + metaData.itembodyId);
    var item = $("#" + metaData.itemId);

    $.each(data, function (index, element) {
        var buttonId = metaData.itemId + "button" + index ;
        var buttonCol_html = getDownloadButtonCol(element.quality, buttonId) ;

        itembody.append(buttonCol_html);

        var button = $("#" + buttonId) ;
        button.click(function () {
            window.location.href = element.url;
        });
    });

    item.attr("status", "complete");
}




$(".collapse[search]").on('show.bs.collapse', function () {

    var collapse_id = $(this).attr("id");
    var spinner_id = collapse_id + "spinner";
    var error_id = collapse_id + "error";
    var itembody_id = collapse_id + "body";

    var item_id = collapse_id.substring(0, collapse_id.length - 8);
    var item_headlink_id = item_id + "headlink";

    var searchItem = $("#" + item_id);


    var metaData = {
        spinnerId: spinner_id,
        itemId: item_id,
        itembodyId: itembody_id,
        errorId: error_id
    };

    if (searchItem.attr("status") != "complete") {
        asyncDownloadJson(searchItem.attr("source"), beforeDownloadJson, afterDownloadJson, sucessDownloadJson, onErrorDownloadJson, metaData);
    }


})

