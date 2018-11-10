import { Component, ViewChild, ElementRef, Renderer, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { createImage, resizeImage } from './utils';
import { FileUploader } from './file-uploader';
import 'rxjs/add/operator/filter';
import * as Cropper from 'cropperjs';
import { cssTemplate, htmlTemplate } from './template';
export var Status;
(function (Status) {
    Status[Status["NotSelected"] = 0] = "NotSelected";
    Status[Status["Selected"] = 1] = "Selected";
    Status[Status["Uploading"] = 2] = "Uploading";
    Status[Status["Loading"] = 3] = "Loading";
    Status[Status["Loaded"] = 4] = "Loaded";
    Status[Status["Error"] = 5] = "Error";
})(Status || (Status = {}));
var FancyImageUploaderComponent = (function () {
    function FancyImageUploaderComponent(renderer, uploader, changeDetector) {
        this.renderer = renderer;
        this.uploader = uploader;
        this.changeDetector = changeDetector;
        this.statusEnum = Status;
        this._status = Status.NotSelected;
        this.thumbnailWidth = 150;
        this.thumbnailHeight = 150;
        this.propagateChange = function (_) { };
        this.cropper = undefined;
        this.onUpload = new EventEmitter();
        this.onStatusChange = new EventEmitter();
    }
    Object.defineProperty(FancyImageUploaderComponent.prototype, "imageThumbnail", {
        get: function () {
            return this._imageThumbnail;
        },
        set: function (value) {
            this._imageThumbnail = value;
            this.propagateChange(this._imageThumbnail);
            if (value !== undefined) {
                this.status = Status.Selected;
            }
            else {
                this.status = Status.NotSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FancyImageUploaderComponent.prototype, "errorMessage", {
        get: function () {
            return this._errorMessage;
        },
        set: function (value) {
            this._errorMessage = value;
            if (value) {
                this.status = Status.Error;
            }
            else {
                this.status = Status.NotSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FancyImageUploaderComponent.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (value) {
            this._status = value;
            this.onStatusChange.emit(value);
        },
        enumerable: true,
        configurable: true
    });
    FancyImageUploaderComponent.prototype.writeValue = function (value) {
        if (value) {
            this.loadAndResize(value);
        }
        else {
            this._imageThumbnail = undefined;
            this.status = Status.NotSelected;
        }
    };
    FancyImageUploaderComponent.prototype.registerOnChange = function (fn) {
        this.propagateChange = fn;
    };
    FancyImageUploaderComponent.prototype.registerOnTouched = function () { };
    FancyImageUploaderComponent.prototype.ngOnInit = function () {
        if (this.options) {
            if (this.options.thumbnailWidth) {
                this.thumbnailWidth = this.options.thumbnailWidth;
            }
            if (this.options.thumbnailHeight) {
                this.thumbnailHeight = this.options.thumbnailHeight;
            }
            if (this.options.resizeOnLoad === undefined) {
                this.options.resizeOnLoad = true;
            }
            if (this.options.autoUpload === undefined) {
                this.options.autoUpload = true;
            }
            if (this.options.cropEnabled === undefined) {
                this.options.cropEnabled = false;
            }
            if (this.options.autoUpload && this.options.cropEnabled) {
                throw new Error('autoUpload and cropEnabled cannot be enabled simultaneously');
            }
        }
    };
    FancyImageUploaderComponent.prototype.ngAfterViewChecked = function () {
        if (this.options && this.options.cropEnabled && this.imageElement && this.fileToUpload && !this.cropper) {
            this.cropper = new Cropper(this.imageElement.nativeElement, {
                viewMode: 1,
                aspectRatio: this.options.cropAspectRatio ? this.options.cropAspectRatio : null
            });
        }
    };
    FancyImageUploaderComponent.prototype.ngOnDestroy = function () {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    };
    FancyImageUploaderComponent.prototype.loadAndResize = function (url) {
        var _this = this;
        this.status = Status.Loading;
        this.uploader.getFile(url, this.options).subscribe(function (file) {
            if (_this.options.resizeOnLoad) {
                // thumbnail
                var result = {
                    file: file,
                    url: URL.createObjectURL(file)
                };
                _this.resize(result).then(function (r) {
                    _this._imageThumbnail = r.resized.dataURL;
                    _this.status = Status.Loaded;
                });
            }
            else {
                var result = {
                    file: null,
                    url: null
                };
                _this.fileToDataURL(file, result).then(function (r) {
                    _this._imageThumbnail = r.dataURL;
                    _this.status = Status.Loaded;
                });
            }
        }, function (error) {
            _this.errorMessage = error || 'Error while getting an image';
        });
    };
    FancyImageUploaderComponent.prototype.onImageClicked = function () {
        this.renderer.invokeElementMethod(this.fileInputElement.nativeElement, 'click');
    };
    FancyImageUploaderComponent.prototype.onFileChanged = function () {
        var file = this.fileInputElement.nativeElement.files[0];
        if (!file)
            return;
        this.validateAndUpload(file);
    };
    FancyImageUploaderComponent.prototype.validateAndUpload = function (file) {
        var _this = this;
        this.propagateChange(null);
        if (this.options && this.options.allowedImageTypes) {
            if (!this.options.allowedImageTypes.some(function (allowedType) { return file.type === allowedType; })) {
                this.errorMessage = 'Only these image types are allowed: ' + this.options.allowedImageTypes.join(', ');
                return;
            }
        }
        if (this.options && this.options.maxImageSize) {
            if (file.size > this.options.maxImageSize * 1024 * 1024) {
                this.errorMessage = "Image must not be larger than " + this.options.maxImageSize + " MB";
                return;
            }
        }
        this.fileToUpload = file;
        if (this.options && this.options.autoUpload) {
            this.upload();
        }
        // thumbnail
        var result = {
            file: file,
            url: URL.createObjectURL(file)
        };
        this.resize(result).then(function (r) {
            _this._imageThumbnail = r.resized.dataURL;
            _this.origImageWidth = r.width;
            _this.orgiImageHeight = r.height;
            if (_this.options && !_this.options.autoUpload) {
                _this.status = Status.Selected;
            }
        });
    };
    FancyImageUploaderComponent.prototype.upload = function () {
        var _this = this;
        this.progress = 0;
        this.status = Status.Uploading;
        var cropOptions = undefined;
        if (this.cropper) {
            var scale = this.origImageWidth / this.cropper.getImageData().naturalWidth;
            var cropData = this.cropper.getData();
            cropOptions = {
                x: Math.round(cropData.x * scale),
                y: Math.round(cropData.y * scale),
                width: Math.round(cropData.width * scale),
                height: Math.round(cropData.height * scale)
            };
        }
        var id = this.uploader.uploadFile(this.fileToUpload, this.options, cropOptions);
        // file progress
        var sub = this.uploader.fileProgress$.filter(function (file) { return file.id === id; }).subscribe(function (file) {
            _this.progress = file.progress;
            if (file.error) {
                if (file.status || file.statusText) {
                    _this.errorMessage = file.status + ": " + file.statusText;
                }
                else {
                    _this.errorMessage = 'Error while uploading';
                }
                // on some upload errors change detection does not work, so we are forcing manually
                // on some upload errors change detection does not work, so we are forcing manually
                _this.changeDetector.detectChanges();
            }
            if (file.done) {
                // notify that value was changed only when image was uploaded and no error
                if (!file.error) {
                    _this.propagateChange(_this._imageThumbnail);
                    _this.status = Status.Selected;
                    _this.fileToUpload = undefined;
                }
                _this.onUpload.emit(file);
                sub.unsubscribe();
            }
        });
    };
    FancyImageUploaderComponent.prototype.removeImage = function () {
        this.fileInputElement.nativeElement.value = null;
        this.imageThumbnail = undefined;
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    };
    FancyImageUploaderComponent.prototype.dismissError = function () {
        this.errorMessage = undefined;
        this.removeImage();
    };
    FancyImageUploaderComponent.prototype.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer || !e.dataTransfer.files.length) {
            return;
        }
        this.validateAndUpload(e.dataTransfer.files[0]);
        this.updateDragOverlayStyles(false);
    };
    FancyImageUploaderComponent.prototype.dragenter = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    FancyImageUploaderComponent.prototype.dragover = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.updateDragOverlayStyles(true);
    };
    FancyImageUploaderComponent.prototype.dragleave = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.updateDragOverlayStyles(false);
    };
    FancyImageUploaderComponent.prototype.updateDragOverlayStyles = function (isDragOver) {
        // TODO: find a way that does not trigger dragleave when displaying overlay
        // if (isDragOver) {
        //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'block');
        // } else {
        //  this.renderer.setElementStyle(this.dragOverlayElement.nativeElement, 'display', 'none');
        // }
    };
    FancyImageUploaderComponent.prototype.resize = function (result) {
        var _this = this;
        var resizeOptions = {
            resizeHeight: this.thumbnailHeight,
            resizeWidth: this.thumbnailWidth,
            resizeType: result.file.type,
            resizeMode: this.options.thumbnailResizeMode
        };
        return new Promise(function (resolve) {
            createImage(result.url, function (image) {
                var dataUrl = resizeImage(image, resizeOptions);
                result.width = image.width;
                result.height = image.height;
                result.resized = {
                    dataURL: dataUrl,
                    type: _this.getType(dataUrl)
                };
                resolve(result);
            });
        });
    };
    FancyImageUploaderComponent.prototype.getType = function (dataUrl) {
        return dataUrl.match(/:(.+\/.+;)/)[1];
    };
    FancyImageUploaderComponent.prototype.fileToDataURL = function (file, result) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function (e) {
                result.dataURL = reader.result;
                resolve(result);
            };
            reader.readAsDataURL(file);
        });
    };
    FancyImageUploaderComponent.decorators = [
        { type: Component, args: [{
                    selector: 'fancy-image-uploader',
                    template: htmlTemplate,
                    styles: [cssTemplate],
                    host: {
                        '[style.width]': 'thumbnailWidth + "px"',
                        '[style.height]': 'thumbnailHeight + "px"',
                        '(drop)': 'drop($event)',
                        '(dragenter)': 'dragenter($event)',
                        '(dragover)': 'dragover($event)',
                        '(dragleave)': 'dragleave($event)',
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(function () { return FancyImageUploaderComponent; }),
                            multi: true
                        }
                    ]
                },] },
    ];
    /** @nocollapse */
    FancyImageUploaderComponent.ctorParameters = function () { return [
        { type: Renderer, },
        { type: FileUploader, },
        { type: ChangeDetectorRef, },
    ]; };
    FancyImageUploaderComponent.propDecorators = {
        "imageElement": [{ type: ViewChild, args: ['imageElement',] },],
        "fileInputElement": [{ type: ViewChild, args: ['fileInput',] },],
        "dragOverlayElement": [{ type: ViewChild, args: ['dragOverlay',] },],
        "options": [{ type: Input },],
        "onUpload": [{ type: Output },],
        "onStatusChange": [{ type: Output },],
    };
    return FancyImageUploaderComponent;
}());
export { FancyImageUploaderComponent };
