var votes;

function vote(id, callback) {
    var voteUrl = 'http://128.199.45.65/positions/{id}/vote.jsonp';
    if (!localStorage.getItem(id)) {
        localStorage.setItem(id, "true");
        voteUrl = voteUrl.replace("{id}", id);
        $.when($.ajax({
            url: voteUrl,
            type: 'GET',
            dataType: "jsonp",
            crossDomain: true,
            async: 'false',
        })).then(function(data) {
            var votes = data;
            $('#votes').text(data);
            $('#voteImg').attr("src", "img/up.png").unwrap().css("opacity",".3").load(function() {
                $(this).show();
            });

            if (typeof(callback) == 'function') {
                callback(votes);
            }
            return votes
        });
    }
}