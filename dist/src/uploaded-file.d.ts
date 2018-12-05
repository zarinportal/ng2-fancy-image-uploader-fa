export declare class UploadedFile {
    id: string;
    status: number;
    statusText: string;
    progress: number;
    originalName: string;
    size: number;
    response: string;
    done: boolean;
    error: boolean;
    abort: boolean;
    constructor(id: string, originalName: string, size: number);
    setError(): void;
    setAbort(): void;
    onFinished(status: number, statusText: string, response: string): void;
}
