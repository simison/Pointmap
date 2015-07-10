var loginStatus;

function statusChangeCallback(response) {

    if (response.status === 'connected') {
        loginStatus = true;
        testAPI();
    }
}

function checkLoginState(data) {
    if (data) {
        if ($("#reportBox").is(":visible")) {
            $(".login").fadeTo(200, 0, function() {
                $(".login").hide();

                $('#reportForm').show();
                $('form').show();
                $(".formWrap").fadeTo(500, 1);
            });
        } else {
            $(".login").fadeTo(200, 0, function() {
                $(".login").hide();
                $(".add").css("text-align", "left");
                $('#open [style]').removeAttr('style');
                $('.formWrap').show();
                $("#form").fadeTo(500, 1);
            });
            $('#open').width("100%").height("100%");
        }
    }

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

}

window.fbAsyncInit = function() {
    FB.init({
        appId: '1598855627050031',
        cookie: true,
        xfbml: true,
        version: 'v2.3'
    });

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
    checkLoginState();

};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() {
    loginStatus = true;
    FB.api('/me', function(response) {
        //console.log(response);
        $(".email").val(response["email"]);
        $(".user_id").val(response["id"]);
        $(".loggedinUser").text(response["name"]);
    });
}

function fbLogout() {
    FB.logout(function(response) {
        loginStatus = false;
        $(".login").hide();
        $("#loading").hide();
        $(".formWrap").fadeTo(300, 0, function() {

            $(".login").fadeTo(300, 1);
            $("#loading").hide();
            $("form").hide();
        });
    });
}

function fb_login() {
    FB.login(function(response) {
        if (response.authResponse) {
            
            checkLoginState(true);
            testAPI();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, {
        scope: 'email'
    });
}