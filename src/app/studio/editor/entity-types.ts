export enum WeChatWorkerStatus {
    idle = 'idle',
    download = 'download',
    imageClassification = 'imageClassification',
    sanitization = 'sanitization',
    translation = 'translation',
    savingImages = 'savingImages',
    creatingPost = 'creatingPost'
}

export enum AlignEntityResponse {
    success = 'success',
    insufficientApprovals = 'insufficientApprovals',
    notFound = 'notFound'
}
