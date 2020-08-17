export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem.textContent;
    elem = document.getElementById('USER_ACCOUNT_NAME');
    const accountName = elem.textContent;
    elem = document.getElementById('USER_ID');
    const userID = elem.textContent;
    elem = document.getElementById('USER_THUMBNAIL');
    const imageData = elem.textContent;

    return {
        name: userName,
        account_name: accountName,
        userID:  userID,
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