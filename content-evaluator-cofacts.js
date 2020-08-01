function cofactsGetURLEvaluationPromise(url) {
    return new Promise((resolve) => {
        resolve({
            icon:iconQuestionmark,
            unicodeSymbol:"❔",
            imageUrl: URL_QUESTIONMARK_IMAGE,
            alt:"not found",
            text:`the Cofacts backend is not yet implemented.`,
            site:getSiteFromUrl(url)
        });
    });
}
