import { Observable } from 'rxjs/Observable';
import { UploadedFile } from './uploaded-file';
import { FileUploaderOptions, CropOptions } from './interfaces';
export declare class FileUploader {
    private _fileProgress$;
    constructor();
    readonly fileProgress$: Observable<UploadedFile>;
    uploadFile(file: File, options: FileUploaderOptions, cropOptions?: CropOptions): string;
    getFile(url: string, options: {
        authToken?: string;
        authTokenPrefix?: string;
    }): Observable<File>;
    private setDefaults(options);
    private isSuccessCode(status);
    private generateRandomIndex();
}
