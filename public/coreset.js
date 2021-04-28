let coreset = {};



coreset.post = (url) => {
    return new Promise(async resolve => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                resolve(this.response)
            }
        };
        request.open("POST", url, true);
        request.send(null);
    })
}

coreset.getExt = (url) => {
    return url.split('.').pop();
}

coreset.importCss = (url) => {
    return new Promise(resolve => {
        let link = document.createElement("link")

        link.href = url;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';
        link.onload = () => {
            resolve(link)
        }
        link.onerror = () => {
            resolve(link)
        }

        document.getElementsByTagName('head')[0].appendChild(link);

    })
}

coreset.importJs = (url) => {
    return new Promise(resolve => {
        let script = document.createElement("script")

        script.src = url;
        script.onload = () => {
            resolve(script)
        }
        script.onerror = () => {
            resolve(script)
        }

        document.getElementsByTagName('head')[0].appendChild(script);

    })
}

coreset.add = async (lib = "") => {
    return new Promise(async resolve => {
        let data = JSON.parse(await coreset.post(`https://coreset.herokuapp.com/${lib}`));

        for (let i = 0; i < data.length; i++) {
            let url = data[i];
            if (coreset.getExt(url) == "css") {
                await coreset.importCss(url)
            } else if (coreset.getExt(url) == "js") {
                await coreset.importJs(url)
            }
        }

        resolve()
    })
}
