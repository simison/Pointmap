var loginStatus;
var click;

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        loginStatus = true;
        if (!click) {
            $('#loadingMap').fadeTo(300, 0, function() {
                $("body").css("background-color", "#fcf7f5");
                $('#loadingMap').hide();
                $('#formWrap').fadeTo(300, 1);
                $('#next').show();
                $('.footerWrap').show();
            });
        }
        testAPI();
    } else if (response.status === 'not_authorized') {
        $('#loadingMap').fadeTo(300, 0, function() {
            $("body").css("background-color", "#fcf7f5");
            $('#loadingMap').hide();
            $('.login').fadeTo(300, 1);
            $('.footerWrap').hide();
        });
    } else {
        $('#loadingMap').fadeTo(300, 0, function() {
            $('#loadingMap').hide();
            $("body").css("background-color", "#fcf7f5");
            $('.login').fadeTo(300, 1);
            $('.footerWrap').hide();
        });

    }
}

function checkLoginState(data) {
    if (data) click = data;
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

}

function testAPI() {
    loginStatus = true;
    $('.login').fadeTo(300, 0, function() {
        $("body").css("background-color", "#fcf7f5");
        $('.login').hide();
        $('#formWrap').fadeTo(300, 1);
        $('#next').show();
        $('.footerWrap').show();
    });
    resize();
    FB.api('/me', function(response) {
        $("#email").val(response["email"]);
        $(".user_id").val(response["id"]);
        $(".loggedinUser").text(response["name"]);
    });
}

function fb_login() {
    $('.loading').hide();
    FB.login(function(response) {

        if (response.authResponse) {
            checkLoginState(true);

        } else {
            console.log('User cancelled login or did not fully authorize.');

        }
    }, {
        scope: 'email'
    });
}

function fbLogout() {
    FB.logout(function(response) {
        loginStatus = false;
        location.assign("");
    });
}