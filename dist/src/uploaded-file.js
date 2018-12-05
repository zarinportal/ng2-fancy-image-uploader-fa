var UploadedFile = (function () {
    function UploadedFile(id, originalName, size) {
        this.id = id;
        this.originalName = originalName;
        this.size = size;
        this.progress = 0;
        this.done = false;
        this.error = false;
        this.abort = false;
    }
    UploadedFile.prototype.setError = function () {
        this.error = true;
        this.done = true;
    };
    UploadedFile.prototype.setAbort = function () {
        this.abort = true;
        this.done = true;
    };
    UploadedFile.prototype.onFinished = function (status, statusText, response) {
        this.status = status;
        this.statusText = statusText;
        this.response = response;
        this.done = true;
    };
    return UploadedFile;
}());
export { UploadedFile };
