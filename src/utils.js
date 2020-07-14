export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem.textContent;
    elem = document.getElementById('USER_ID');
    const userId = elem.textContent;
    elem = document.getElementById('USER_THUMBNAIL');
    const imageData = elem.textContent;

    return {
        name: userName,
        id: userId,
        imageData: imageData
    }
}

export function getHost() {
    const elem = document.getElementById('HOST');
    return elem.textContent;
}

export function getProtocol() {
    const elem = document.getElementById('PROTOCOL');
    return elem.textContent;
}