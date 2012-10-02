window.addEventListener('load', function() {

    // ブラウザ間の差異吸収
    // from http://web-utage.com/sample/dragonball_super_saiyan/
    var requestAnimationFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                setTimeout(callback, 1000 / 60);
            };
    })();
    var getUserMedia = function(t, onsuccess, onerror) {
        if (navigator.getUserMedia) {
            return navigator.getUserMedia(t, onsuccess, onerror);
        } else if (navigator.webkitGetUserMedia) {
            return navigator.webkitGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.mozGetUserMedia) {
            return navigator.mozGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.msGetUserMedia) {
            return navigator.msGetUserMedia(t, onsuccess, onerror);
        } else {
            onerror(new Error("No getUserMedia implementation found."));
        }
        return undefined;
    };
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL || window.oURL;
    var createObjectURL = URL.createObjectURL;

    getUserMedia(
        {video: true},
        success, error
    );

    function success(stream) {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var videoUrl = createObjectURL(stream);
        var video = document.getElementById('video');
        video.src = videoUrl;
        video.autoplay = true;
        requestAnimationFrame(function render() {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(render);
        });
    }

    function error() {
        alert('なんかエラー！');
    }
}, false);
