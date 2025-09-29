export enum WeChatWorkerStatus {
    idle,
    download,
    imageClassification,
    sanitization,
    translation,
    savingImages,
    creatingPost
}

export enum AlignPostResponse {
    success,
    insufficientApprovals,
    notFound
}
