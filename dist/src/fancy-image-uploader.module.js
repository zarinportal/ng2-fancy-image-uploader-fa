import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FancyImageUploaderComponent } from './fancy-image-uploader.component';
import { FileUploader } from './file-uploader';
var FancyImageUploaderModule = (function () {
    function FancyImageUploaderModule() {
    }
    FancyImageUploaderModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    providers: [FileUploader],
                    declarations: [FancyImageUploaderComponent],
                    exports: [FancyImageUploaderComponent]
                },] },
    ];
    /** @nocollapse */
    FancyImageUploaderModule.ctorParameters = function () { return []; };
    return FancyImageUploaderModule;
}());
export { FancyImageUploaderModule };
