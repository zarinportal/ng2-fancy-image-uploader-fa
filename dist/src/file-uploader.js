import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { UploadedFile } from './uploaded-file';
var FileUploader = (function () {
    function FileUploader() {
        this._fileProgress$ = new Subject();
    }
    Object.defineProperty(FileUploader.prototype, "fileProgress$", {
        get: function () {
            return this._fileProgress$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    FileUploader.prototype.uploadFile = function (file, options, cropOptions) {
        var _this = this;
        this.setDefaults(options);
        var xhr = new XMLHttpRequest();
        var form = new FormData();
        form.append(options.fieldName, file, file.name);
        if (cropOptions) {
            form.append('X', cropOptions.x.toString());
            form.append('Y', cropOptions.y.toString());
            form.append('Width', cropOptions.width.toString());
            form.append('Height', cropOptions.height.toString());
        }
        var uploadingFile = new UploadedFile(this.generateRandomIndex(), file.name, file.size);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var percent = Math.round(e.loaded / e.total * 100);
                uploadingFile.progress = percent;
                _this._fileProgress$.next(uploadingFile);
            }
        };
        xhr.upload.onabort = function (e) {
            uploadingFile.setAbort();
            _this._fileProgress$.next(uploadingFile);
        };
        xhr.upload.onerror = function (e) {
            uploadingFile.setError();
            _this._fileProgress$.next(uploadingFile);
        };
        xhr.onload = function () {
            var success = _this.isSuccessCode(xhr.status);
            if (!success) {
                uploadingFile.setError();
            }
            uploadingFile.onFinished(xhr.status, xhr.statusText, xhr.response);
            _this._fileProgress$.next(uploadingFile);
        };
        xhr.open(options.httpMethod, options.uploadUrl, true);
        xhr.withCredentials = options.withCredentials;
        if (options.customHeaders) {
            Object.keys(options.customHeaders).forEach(function (key) {
                xhr.setRequestHeader(key, options.customHeaders[key]);
            });
        }
        if (options.authToken) {
            xhr.setRequestHeader("Authorization", options.authTokenPrefix + " " + options.authToken);
        }
        xhr.send(form);
        return uploadingFile.id;
    };
    FileUploader.prototype.getFile = function (url, options) {
        var _this = this;
        return Observable.create(function (observer) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = function () {
                var success = _this.isSuccessCode(xhr.status);
                if (!success) {
                    observer.error(xhr.status);
                    observer.complete();
                }
                else {
                    var contentType = xhr.getResponseHeader('Content-Type');
                    var blob = new File([xhr.response], 'filename', { type: contentType });
                    if (blob.size > 0) {
                        observer.next(blob);
                        observer.complete();
                    }
                    else {
                        observer.error('No image');
                        observer.complete();
                    }
                }
            };
            xhr.onerror = function (e) {
                observer.error(xhr.status);
                observer.complete();
            };
            if (options.authToken) {
                xhr.setRequestHeader("Authorization", options.authTokenPrefix + " " + options.authToken);
            }
            xhr.send();
        });
    };
    FileUploader.prototype.setDefaults = function (options) {
        options.withCredentials = options.withCredentials || false;
        options.httpMethod = options.httpMethod || 'POST';
        options.authTokenPrefix = options.authTokenPrefix || 'Bearer';
        options.fieldName = options.fieldName || 'file';
    };
    FileUploader.prototype.isSuccessCode = function (status) {
        return (status >= 200 && status < 300) || status === 304;
    };
    FileUploader.prototype.generateRandomIndex = function () {
        return Math.random().toString(36).substring(7);
    };
    FileUploader.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    FileUploader.ctorParameters = function () { return []; };
    return FileUploader;
}());
export { FileUploader };
