function filterElementsWithLinks(textElements, linkElements, textElementToParent, linkElementToParent) {
    // Find the parents of each link element.
    // These may be in the textElements list, in which case we want to search by link rather than by text.
    let parentsOfLinkElements = linkElements.map(linkElementToParent);

    // We only want to keep the text elements that don't contain a link
    let textElementsWithoutLink = textElements.filter(e => !parentsOfLinkElements.includes(textElementToParent(e)));

    return linkElements.concat(textElementsWithoutLink);
}
