export function createImage(url, cb) {
    var image = new Image();
    image.onload = function () {
        cb(image);
    };
    image.src = url;
}
var resizeAreaId = 'imageupload-resize-area';
function getResizeArea() {
    var resizeArea = document.getElementById(resizeAreaId);
    if (!resizeArea) {
        resizeArea = document.createElement('canvas');
        resizeArea.id = resizeAreaId;
        resizeArea.style.display = 'none';
        document.body.appendChild(resizeArea);
    }
    return resizeArea;
}
export function resizeImage(origImage, _a) {
    var _b = _a === void 0 ? {} : _a, resizeHeight = _b.resizeHeight, resizeWidth = _b.resizeWidth, _c = _b.resizeQuality, resizeQuality = _c === void 0 ? 0.7 : _c, _d = _b.resizeType, resizeType = _d === void 0 ? 'image/jpeg' : _d, _e = _b.resizeMode, resizeMode = _e === void 0 ? 'fill' : _e;
    var canvas = getResizeArea();
    var height = origImage.height;
    var width = origImage.width;
    var offsetX = 0;
    var offsetY = 0;
    if (resizeMode === 'fill') {
        // calculate the width and height, constraining the proportions
        if (width / height > resizeWidth / resizeHeight) {
            width = Math.round(height * resizeWidth / resizeHeight);
        }
        else {
            height = Math.round(width * resizeHeight / resizeWidth);
        }
        canvas.width = resizeWidth <= width ? resizeWidth : width;
        canvas.height = resizeHeight <= height ? resizeHeight : height;
        offsetX = origImage.width / 2 - width / 2;
        offsetY = origImage.height / 2 - height / 2;
        //draw image on canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(origImage, offsetX, offsetY, width, height, 0, 0, canvas.width, canvas.height);
    }
    else if (resizeMode === 'fit') {
        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > resizeWidth) {
                height = Math.round(height *= resizeWidth / width);
                width = resizeWidth;
            }
        }
        else {
            if (height > resizeHeight) {
                width = Math.round(width *= resizeHeight / height);
                height = resizeHeight;
            }
        }
        canvas.width = width;
        canvas.height = height;
        //draw image on canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(origImage, 0, 0, width, height);
    }
    else {
        throw new Error('Unknown resizeMode: ' + resizeMode);
    }
    // get the data from canvas as 70% jpg (or specified type).
    return canvas.toDataURL(resizeType, resizeQuality);
}
