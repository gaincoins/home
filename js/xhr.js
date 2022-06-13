async function xhr(_url, _metodo, _data, responseType, ..._options) {

    let response

    if (_metodo == 'GET') {
        let url = new URL(_url)
        Object.keys(_data).forEach(key => url.searchParams.append(key, _data[key]))

        response =  await fetch(url, _options)
        .catch(e=>{
            console.log('Error fetch',e)
        })
    }
    else {
        console.log('pendiente pos, put, ...')
    }

    if (response.ok) {
        switch (responseType) {
            case 'json':
                return await response.json();
                break;
            case 'blob':
                return await response.blob();
                break;
            case 'arrayBuffer':
                return await response.arrayBuffer();
                break;
            default:
                return await response.text();
                break;
        }
    } else {
        return await response.text();
    }
}