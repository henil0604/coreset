let axios = require("axios");
let data = require("../data.json");
let handler = {};


handler.getAllUris = (data = null) => {
    data = data == null ? require("../data.json").paths : data;
    let Uris = [];

    for (let i = 0; i < Object.keys(data).length; i++) {
        let key = Object.keys(data)[i];
        let value = data[key];

        if (typeof value == "object") {
            Uris.push(...handler.getAllUris(value))
        } else if (typeof value == "string") {
            Uris.push(value)
        }
    }

    return Uris;
}

handler.postRequest = (url, data = {}, req = null, internal = true) => {
    return new Promise(resolve => {
        if (internal) {
            url = `${req.protocol}://${req.get("host")}${url}`
        }

        axios
            .post(url, data)
            .then(res => {
                resolve(res)
            })
            .catch(error => {
                resolve(error)
            })
    })
}

handler.getRequest = (url, data = {}, req = null, internal = true) => {
    return new Promise(resolve => {
        if (internal) {
            url = `${req.protocol}://${req.get("host")}${url}`
        }

        axios
            .get(url, data)
            .then(res => {
                resolve(res)
            })
            .catch(error => {
                resolve(error)
            })
    })
}

handler.getExt = (url) => {
    return url.split('.').pop();
}

handler.postHandler = async (req, res, next) => {

    let url = req.url;
    let URIs = [];
    let doNotSendUris = [
        '/handler.js'
    ]

    if (url == "/") {
        URIs = handler.getAllUris()
    } else {
        url = url.replace(/\//g, "");
        for (let i = 0; i < Object.keys(data.paths).length; i++) {
            let key = Object.keys(data.paths)[i];
            let value = data.paths[key];
            if (key == url) {
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        let v = value[i];
                        if (typeof v == "string") {
                            let match = v.match(/{(.*)}/)
                            if (match != null) {
                                v = (await handler.postRequest(`/${match[1]}`, {}, req, true)).data;
                            }
                            value[i] = v;
                        }

                        if (Array.isArray(value[i])) {
                            URIs.push(...value[i])
                        } else {
                            URIs.push(value[i])
                        }
                    }
                } else {
                    let match = value.match(/{(.*)}/)
                    if (match != null) {
                        value = (await handler.postRequest(`/${match[1]}`, {}, req, true))[0];
                    }
                    URIs.push(value)
                }
                break;
            }
        }
    }

    for (let i = 0; i < URIs.length; i++) {
        let uri = URIs[i];
        if (uri[0] == "/") {
            uri = `${req.protocol}://${req.get("host")}${uri}`
        }
        URIs[i] = uri
    }

    if (doNotSendUris.indexOf(url) == -1) {
        res.send(URIs)
        next()
    }
}

handler.getHandler = async (req, res, next) => {
    let url = req.url;

    let URIs = (await handler.postRequest(`${url}`, {}, req, true)).data;
    let toSend = ``;

    for (let i = 0; i < URIs.length; i++) {
        let url = URIs[i];
        if (handler.getExt(url) == "css") {
            toSend += `
                <link rel="stylesheet" href="${url}">
            `
        } else if (handler.getExt(url) == "js") {
            toSend += `
                <script src="${url}"></script>
            `
        }
    }

    res.send(toSend)

}


handler.middleware = async function (req, res, next) {
    data = require("../data.json");

    if (req.method.toLowerCase() == "get") {
        handler.getHandler(req, res, next);
    } else if (req.method.toLowerCase() == "post") {
        handler.postHandler(req, res, next);
    }

}













module.exports = handler.middleware