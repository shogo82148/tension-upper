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
        var video = document.getElementById('video');
        var detection_canvas = document.getElementById('detection_canvas');
        var canvas = document.getElementById('canvas');

        var width = detection_canvas.width = canvas.width = video.width;
        var heght = detection_canvas.height = canvas.height = video.height;

        var detection_context = detection_canvas.getContext('2d');
        var context = canvas.getContext('2d');
        var videoUrl = createObjectURL(stream);
        video.src = videoUrl;
        video.autoplay = true;

        requestAnimationFrame(function render() {
            detection_context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            var comp = ccv.detect_objects({
                canvas :ccv.grayscale(detection_canvas),
                cascade : cascade,
                interval : 5,
                min_neighbors : 1 });
            var i, scale = 1;
            detection_context.lineWidth = 2;
            detection_context.strokeStyle = 'rgba(230,87,0,0.8)';
            /* draw detected area */
            for (i = 0; i < comp.length; i++) {
                detection_context.beginPath();
                detection_context.arc((comp[i].x + comp[i].width * 0.5) * scale, (comp[i].y + comp[i].height * 0.5) * scale,
                        (comp[i].width + comp[i].height) * 0.25 * scale * 1.2, 0, Math.PI * 2);
                detection_context.stroke();
            }
            requestAnimationFrame(render);
        });
    }

    function error() {
        alert('なんかエラー！');
    }
}, false);
