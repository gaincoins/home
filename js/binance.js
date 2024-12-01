


//VARIABLES DE CHECK GENERAL
let chkNotificarBinance = 0
let chkNotifiBtc = 0

//
let interval24hr
let interval24hrTemp
let interval24hrBtc
let dataBtcBinance
let precio24hrBinanceTempNotif = (_tempMinuto, _segConsultaApi, _cantidadAgrupadaCalcular, _agruparPorcentajeMin) => {
    let idTemp = 0
    let hora
    let responseData
    let loStCripto = null
    let precioBtc = []
    clearInterval(interval24hrTemp)
    clearInterval(interval24hr)
    clearInterval(interval24hrBtc)

    interval24hrTemp = setInterval(() => { idTemp++; }, 1000 * 60 * _tempMinuto)
    interval24hrBtc = setInterval(() => {
        let ultBtc = precioBtc.length - 1
        let calculoBtc = []
        if (ultBtc != -1) {
            if (precioBtc[ultBtc] != (dataBtcBinance.lastPrice * 1)) {
                calculoBtc.push(((((dataBtcBinance.lastPrice * 1) - precioBtc[ultBtc])) * 100 / precioBtc[ultBtc]))
                if (ultBtc > 0) {
                    calculoBtc.push(((((precioBtc[ultBtc]) - precioBtc[ultBtc - 1])) * 100 / precioBtc[ultBtc - 1]))
                    if ((ultBtc > 0 && calculoBtc[0] > 0 && calculoBtc[1] < 0) || (ultBtc > 0 && calculoBtc[0] < 0 && calculoBtc[1] > 0)) precioBtc = [];
                }
                if (precioBtc.length >= 3) {
                    // VALIDAR SI DEBEMOS NOTIFICAR
                    if (chkNotifiBtc == 1) {
                        let html = `Precio Actual: ${dataBtcBinance.lastPrice * 1}\nPrecio Apertura: ${dataBtcBinance.openPrice * 1}\nPrecio Alto: ${dataBtcBinance.highPrice * 1}\n24hrs: ${dataBtcBinance.priceChangePercent}%`
                        showNotificationBtc(`Tendencia a ${calculoBtc[1] > 0 ? 'subida' : 'caida'} de BTC`, html, calculoBtc[1])
                    }
                document.querySelector('#listaBtcNotifi').insertAdjacentHTML('beforeend', `<tr style="color:${calculoBtc[1] > 0 ? '#26c487' : '#ff4a49'}!important">
                <td>${new Date(dataBtcBinance.closeTime).toLocaleString()}</td>
                <td>${dataBtcBinance.lastPrice * 1}</td>
                <td>${dataBtcBinance.priceChangePercent}</td>
                <td>${dataBtcBinance.priceChange*1}</td>
                <td>${(((dataBtcBinance.lastPrice*1) - precioBtc[0])*100/precioBtc[0]).toFixed(2)}</td>
                </tr>`); 

                }
                precioBtc.push(dataBtcBinance.lastPrice * 1)
            }
        } else {
            precioBtc.push(dataBtcBinance.lastPrice * 1)
        }


    }, 1000 * 60 * 1)
    interval24hr = setInterval(async () => {
        let respSegc = window.performance.now()
        responseData = await xhr(`https://api.binance.com/api/v1/ticker/24hr`, 'GET', {}, 'json', {})
        apiResponseTime(respSegc, '#timeApi')

        hora = getDateTime('h')
        dataBtcBinance = responseData.find(d => d.symbol == 'BTCUSDT')
        for (const i in responseData) {
            if (responseData[i].symbol.includes('USDT')) {
                loStCripto = localStorage.getItem(responseData[i].symbol)
                loStCripto = JSON.parse(loStCripto)
                if (loStCripto == null) {
                    //localStorage.setItem(responseData[i].symbol, JSON.stringify(responseData[i]))
                    localStorageBinanceCriptoNew(responseData[i])
                } else {
                    if (loStCripto.alzaPrecio !== undefined) {
                        responseData[i].hora = hora
                        responseData[i].idTemp = idTemp
                        responseData[i].procentaje = responseData[i].priceChangePercent
                        precioAlcistaBinanceSegundo(responseData[i], loStCripto, _cantidadAgrupadaCalcular, _agruparPorcentajeMin)
                    }
                }

            }
        }

    }, 1000 * _segConsultaApi)

}

async function precioAlcistaBinanceSegundo(_data, dataDb, _cantidadAgrupadaCalcular, _agruparPorcentajeMin) {
    let _alzaPrecio = dataDb.alzaPrecio
    _alzaPrecio == undefined ? [] : _alzaPrecio

    if (_alzaPrecio.length == 0) {
        _alzaPrecio.push(
            {
                hora: _data.hora,
                idTemp: _data.idTemp,
                precio: _data.lastPrice,
                priceChangePercent: _data.priceChangePercent,
                procentaAlza: 0
            })
        dataDb.alzaPrecio = _alzaPrecio

        //actualizar dblocal
        localStorage.setItem(_data.symbol, JSON.stringify(dataDb))
    } else {
        let ultimoRegistro = _alzaPrecio.length - 1
        let procentaAlzaValor = ((((_data.lastPrice * 1) - (_alzaPrecio[ultimoRegistro].precio * 1)) * 100) / (_alzaPrecio[ultimoRegistro].precio * 1)).toFixed(4)

        if (_alzaPrecio[ultimoRegistro].idTemp == _data.idTemp && procentaAlzaValor > _agruparPorcentajeMin && ultimoRegistro < _cantidadAgrupadaCalcular) {
            _alzaPrecio.push(
                {
                    hora: _data.hora,
                    idTemp: _data.idTemp,
                    precio: _data.lastPrice,
                    priceChangePercent: _data.priceChangePercent,
                    procentaAlza: procentaAlzaValor
                }
            )
            dataDb.alzaPrecio = _alzaPrecio

            // Consultar si desea que se le notifique 
            if (_alzaPrecio.length == _cantidadAgrupadaCalcular) {

                // Ver si esta seleccionado para enviar notificación
                if (chkNotificarBinance == 1) {
                    let body = `Cripto: ${dataDb.symbol.replace('USDT', '')} - 24h%: ${_data.priceChangePercent * 1}`
                    let j = 1
                    while (j < _alzaPrecio.length) {
                        body += `\n Hra: ${_alzaPrecio[j].hora} - Precio: ${_alzaPrecio[j].precio * 1} (${_alzaPrecio[j].procentaAlza * 1}%)`
                        j++
                    }
                    body += '\n'
                    showNotification(
                        `24h - ${dataBtcBinance.symbol.replace('USDT', '')} : ${dataBtcBinance.lastPrice * 1} (${dataBtcBinance.priceChangePercent}%) 🠗 ${dataBtcBinance.lowPrice * 1} - 🠕 ${dataBtcBinance.highPrice * 1}`
                        , body);
                }
                dataDb.alzaPrecio = []
                //Listar en html
                document.querySelector('#listaNotifi').insertAdjacentHTML('beforeend', `<tr style="color:#26c487!important">
                <td>${_data.symbol.replace('USDT', '')} - ${_data.idTemp}</td>
                <td>${_data.hora}</td>
                <td>${_data.lastPrice * 1}</td>
                <td>${_data.priceChangePercent}</td>
                <td>${_alzaPrecio.reduce((a, b) => (a + b.procentaAlza * 1), 0).toFixed(2)}</td>
                <td>${_data.priceChange * 1}</td>
                </tr>`);
            }
            //actualizar dblocal
            localStorage.setItem(_data.symbol, JSON.stringify(dataDb))
        }

        if (_alzaPrecio[ultimoRegistro].idTemp !== _data.idTemp) {
            dataDb.alzaPrecio = []
            localStorage.setItem(_data.symbol, JSON.stringify(dataDb))
        }

    }

}

//Alertar si ahi nueva moneda
let localStorageBinanceCriptoNew = (_data) => {

    showNotification(`NUEVA CRIPTO [${_data.symbol.replace('USDT', '')}] - ${getDateTime('fh')}`,
        `Precio [ Act: ${_data.lastPrice * 1} - Apr: ${_data.openPrice * 1} ]\nPrecio [ Baj: ${_data.lowPrice * 1} - Alt: ${_data.highPrice * 1}]\nCambio Pre: ${_data.priceChange * 1} - (${_data.priceChangePercent * 1}%)\nVolumne: ${(_data.volume * 1).toLocaleString('es')}`);

    _data.alzaPrecio = []
    // Guardar en el listado de criptomonedas
    localStorage.setItem(_data.symbol, JSON.stringify(_data));

    //Guardar como temporal
    let nuevaCripto = JSON.parse(localStorage.getItem('nuevaCripto'))
    nuevaCripto = nuevaCripto == null ? [] : nuevaCripto
    nuevaCripto.push(_data)
    localStorage.setItem('nuevaCripto', JSON.stringify(nuevaCripto));
}


document.querySelector('#frmNotificacionBinance').addEventListener('submit', async (evt) => {
    evt.preventDefault();
    let data = getJsonFormData(new FormData(evt.target))
    precio24hrBinanceTempNotif(data.txtTemporalidad * 1, data.txtConsultaSeg * 1, data.txtCantidaAgrupada * 1, data.txtPorcentajeMin * 1)

})

document.querySelector('#btnListaNuevaCripto').addEventListener('click', e => {
    e.preventDefault()
    let dataNuevaCripto = JSON.parse(localStorage.getItem('nuevaCripto'))
    let html = ''
    for (const v of dataNuevaCripto) {
        html += `<tr>
        <td>${v.symbol.replace('USDT', '')}</td>
        <td>${new Date(v.openTime).toLocaleString()}</td>
        <td>${(v.openPrice * 1).toFixed(2)}</td>
        <td>${v.lastPrice * 1}</td>
        <td>${v.lowPrice * 1}</td>
        <td>${v.highPrice * 1}</td>
        <td>${v.priceChangePercent * 1}</td>
        <td>${numberLocaleString((v.volume * 1), 0)}</td>
        </tr>`
    }
    document.querySelector('#listaNuevaCripto').innerHTML = html
})

document.querySelector('#chkNotificarBinance').addEventListener('change', e => {
    chkNotificarBinance = e.target.checked == true ? 1 : 0
})
document.querySelector('#chkNotifiBtc').addEventListener('change', e => {
    chkNotifiBtc = e.target.checked == true ? 1 : 0
})

document.querySelector('#btnLimpiarBtc').addEventListener('click', e => {
    document.querySelector('#listaBtcNotifi').innerHTML = ''
})


document.querySelector('#btnLimpiarNotifiBinance').addEventListener('click', e => {
    document.querySelector('#listaNotifi').innerHTML = ''
})

document.querySelector('#btnLimpiarNuevaCripto').addEventListener('click', e => {
    document.querySelector('#listaNuevaCripto').innerHTML = ''
    localStorage.nuevaCripto = '[]'
})

window.addEventListener('load', async e => {
    chkNotificarBinance = e.target.checked == true ? 1 : 0
    chkNotifiBtc = e.target.checked == true ? 1 : 0
    if (localStorage.getItem('BTCUSDT') == null) {
        const responseData = await xhr(`https://api.binance.com/api/v1/ticker/24hr`, 'GET', {}, 'json', {})
        console.log(responseData)
        for (const i in responseData) {
            if (responseData[i].symbol.includes('USDT')) {
                responseData[i].alzaPrecio = []
                // Guardar en el listado de criptomonedas
                localStorage.setItem(responseData[i].symbol, JSON.stringify(responseData[i]));

            }
        }

    }
    if (localStorage.getItem('nuevaCripto') == null) {
        localStorage.setItem('nuevaCripto', "[]");
    }
})


