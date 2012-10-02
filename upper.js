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
        var height = detection_canvas.height = canvas.height = video.height;

        var detection_context = detection_canvas.getContext('2d');
        var context = canvas.getContext('2d');
        var videoUrl = createObjectURL(stream);
        video.src = videoUrl;
        video.autoplay = true;

        var sin = Math.sin(10 / 180 * Math.PI);
        var cos = Math.cos(10 / 180 * Math.PI);
        requestAnimationFrame(function render() {
            detection_context.drawImage(video, 0, 0, width, height);
            var data1 = detection_context.getImageData(0, 0, width, height);
            var data2 = detection_context.getImageData(0, 0, width, height);
            var data1data = data1.data, data2data = data2.data;
            var comp = ccv.detect_objects({
                canvas :ccv.grayscale(detection_canvas),
                cascade : cascade,
                interval : 5,
                min_neighbors : 1 });
            var i, scale = 1, e, a;
            var x, y, dx, dy, offset, doffset;
            var w, h, cx, cy;
            var left, right, top, bottom;
            detection_context.lineWidth = 2;
            detection_context.strokeStyle = 'rgba(230,87,0,0.8)';
            /* draw detected area */
            for (i = 0; i < comp.length; i++) {
                detection_context.beginPath();
                e = comp[i];
                detection_context.arc((e.x + e.width * 0.5) * scale, (e.y + e.height * 0.5) * scale,
                        (e.width + e.height) * 0.25 * scale * 1.2, 0, Math.PI * 2);
                detection_context.stroke();

                //copy face image
                a = 0.7;
                w = e.width * 1.5;
                h = e.height * 1.5;
                left = (e.x - e.width*0.25) | 0; right = (e.x + e.width*1.25) | 0;
                top = (e.y - e.height*0.25) | 0; bottom = (e.y + e.height*1.25) | 0;
                cx = (left+right)>>1;
                cy = (top+bottom)>>1;
                for(y = top; y <= bottom; ++y) {
                    for(x = left; x <= right; ++x) {
                        a = ((x-cx)*(x-cx)/(w*w) + (y-cy)*(y-cy)/(h*h)) * 4;
                        a = (1-a) * 0.5;
                        if(a > 1) a = 1;
                        if(a <= 0) continue;
                        dx = x + (e.width>>2);
                        dy = y;
                        if(dx < 0 || dx >= width || dy < 0 || dy >= height) continue;
                        offset = (y * width + x) * 4;
                        doffset = (dy * width + dx) * 4;
                        data2data[doffset] = data2data[doffset] * (1-a) + data1data[offset] * a;
                        data2data[doffset + 1] = data2data[doffset + 1] * (1-a) + data1data[offset + 1] * a;
                        data2data[doffset + 2] = data2data[doffset + 2] * (1-a) + data1data[offset + 2] * a;
                    }
                }
            }
            context.putImageData(data2, 0, 0);
            requestAnimationFrame(render);
        });
    }

    function error() {
        alert('なんかエラー！');
    }
}, false);
