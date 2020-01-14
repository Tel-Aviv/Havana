export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem.textContent;
    elem = document.getElementById('USER_ID');
    const userId = elem.textContent;

    return {
        name: userName,
        id: userId,
    }
}

export function getHost() {
    const elem = document.getElementById('HOST');
    return elem.textContent;
}