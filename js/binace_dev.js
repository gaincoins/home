// Variables de configuración de notificaciones
let chkNotificarBinance = 0;
let chkNotifiBtc = 0;

// Intervalos y datos
let intervalBtc;
let intervalApi;
let dataBtcBinance;
let precioBtc = [];

// Inicia los intervalos de consulta y notificación
const iniciarMonitoreo = (_tempMinuto, _segConsultaApi, _cantidadAgrupadaCalcular, _agruparPorcentajeMin) => {
    resetIntervalos();
    intervalBtc = setInterval(() => monitorBtc(_cantidadAgrupadaCalcular), _tempMinuto * 1000 * 60);
    intervalApi = setInterval(() => consultarApi(_cantidadAgrupadaCalcular, _agruparPorcentajeMin), _segConsultaApi * 1000);
};

// Reinicia los intervalos para evitar superposiciones
const resetIntervalos = () => {
    clearInterval(intervalBtc);
    clearInterval(intervalApi);
};

// Monitoriza cambios de tendencia en BTC
const monitorBtc = (_cantidadAgrupadaCalcular) => {
    const ultimoPrecio = precioBtc.at(-1);
    const nuevoPrecio = dataBtcBinance?.lastPrice;

    if (ultimoPrecio && nuevoPrecio && ultimoPrecio !== nuevoPrecio) {
        const porcentajeCambio = calcularCambioPorcentual(nuevoPrecio, ultimoPrecio);
        if (chkNotifiBtc && precioBtc.length >= _cantidadAgrupadaCalcular) {
            mostrarNotificacionBtc(porcentajeCambio);
        }
        actualizarTablaBtc(nuevoPrecio, porcentajeCambio);
        precioBtc.push(nuevoPrecio);
    }
};

// Consulta la API de Binance y almacena los datos relevantes
const consultarApi = async (_cantidadAgrupadaCalcular, _agruparPorcentajeMin) => {
    const responseData = await obtenerDatosApi('https://api.binance.com/api/v1/ticker/24hr');
    dataBtcBinance = responseData.find(d => d.symbol === 'BTCUSDT');
    responseData.forEach(data => procesarCriptomoneda(data, _cantidadAgrupadaCalcular, _agruparPorcentajeMin));
};

// Calcula el cambio porcentual entre dos precios
const calcularCambioPorcentual = (nuevo, anterior) => (((nuevo - anterior) / anterior) * 100).toFixed(2);

// Procesa los datos de cada criptomoneda
const procesarCriptomoneda = (data, _cantidadAgrupadaCalcular, _agruparPorcentajeMin) => {
    const storedData = obtenerLocalStorage(data.symbol);
    if (!storedData) guardarCriptoNueva(data);
    else if (storedData.alzaPrecio) verificarAlzaPrecio(data, storedData, _cantidadAgrupadaCalcular, _agruparPorcentajeMin);
};

// Verifica si hay una tendencia alcista y notifica si es necesario
const verificarAlzaPrecio = (data, storedData, _cantidadAgrupadaCalcular, _agruparPorcentajeMin) => {
    const alzaPrecio = storedData.alzaPrecio || [];
    const ultimoPrecio = alzaPrecio.at(-1)?.precio || 0;
    const cambioPorcentual = calcularCambioPorcentual(data.lastPrice, ultimoPrecio);

    if (cambioPorcentual > _agruparPorcentajeMin && alzaPrecio.length < _cantidadAgrupadaCalcular) {
        alzaPrecio.push({ hora: getDateTime('h'), precio: data.lastPrice, cambioPorcentual });
        storedData.alzaPrecio = alzaPrecio;
        actualizarLocalStorage(data.symbol, storedData);

        if (alzaPrecio.length === _cantidadAgrupadaCalcular && chkNotificarBinance) {
            mostrarNotificacionBinance(data, alzaPrecio);
            alzaPrecio.length = 0;  // Reset de alzaPrecio
        }
        actualizarTablaNotificacion(data, cambioPorcentual);
    }
};

// Muestra una notificación de BTC
const mostrarNotificacionBtc = (porcentajeCambio) => {
    const tendencia = porcentajeCambio > 0 ? 'subida' : 'caída';
    const mensaje = `Tendencia a ${tendencia} de BTC\nPrecio Actual: ${dataBtcBinance.lastPrice}`;
    showNotificationBtc(`BTC ${tendencia}`, mensaje, porcentajeCambio);
};

// Muestra una notificación de alza en Binance
const mostrarNotificacionBinance = (data, alzaPrecio) => {
    let body = `Cripto: ${data.symbol.replace('USDT', '')} - 24h%: ${data.priceChangePercent}\n`;
    alzaPrecio.forEach(item => body += `Hora: ${item.hora} - Precio: ${item.precio} (${item.cambioPorcentual}%)\n`);
    showNotification(`24h - ${data.symbol}`, body);
};

// Guarda una nueva criptomoneda en el almacenamiento local
const guardarCriptoNueva = (data) => {
    data.alzaPrecio = [];
    actualizarLocalStorage(data.symbol, data);
    mostrarNotificacionNuevaCripto(data);
};

// Muestra notificación de nueva criptomoneda
const mostrarNotificacionNuevaCripto = (data) => {
    const mensaje = `Nueva Cripto [${data.symbol.replace('USDT', '')}] Precio Actual: ${data.lastPrice}`;
    showNotification(`NUEVA CRIPTO: ${data.symbol}`, mensaje);
};

// Función genérica para obtener datos de la API
const obtenerDatosApi = async (url) => {
    const inicio = window.performance.now();
    const response = await xhr(url, 'GET', {}, 'json', {});
    apiResponseTime(inicio, '#timeApi');
    return response;
};

// Utilidades de almacenamiento en localStorage
const obtenerLocalStorage = (key) => JSON.parse(localStorage.getItem(key));
const actualizarLocalStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Actualiza las tablas de notificaciones
const actualizarTablaBtc = (precio, porcentajeCambio) => {
    const color = porcentajeCambio > 0 ? '#26c487' : '#ff4a49';
    document.querySelector('#listaBtcNotifi').insertAdjacentHTML('beforeend', `
        <tr style="color:${color}!important">
            <td>${new Date(dataBtcBinance.closeTime).toLocaleString()}</td>
            <td>${precio}</td>
            <td>${dataBtcBinance.priceChangePercent}</td>
            <td>${dataBtcBinance.priceChange}</td>
            <td>${porcentajeCambio}</td>
        </tr>`);
};

const actualizarTablaNotificacion = (data, cambioPorcentual) => {
    document.querySelector('#listaNotifi').insertAdjacentHTML('beforeend', `
        <tr style="color:#26c487!important">
            <td>${data.symbol.replace('USDT', '')}</td>
            <td>${getDateTime('h')}</td>
            <td>${data.lastPrice}</td>
            <td>${data.priceChangePercent}</td>
            <td>${cambioPorcentual}</td>
            <td>${data.priceChange}</td>
        </tr>`);
};

// Eventos de interfaz de usuario
document.querySelector('#frmNotificacionBinance').addEventListener('submit', evt => {
    evt.preventDefault();
    const form = getJsonFormData(new FormData(evt.target));
    iniciarMonitoreo(form.txtTemporalidad, form.txtConsultaSeg, form.txtCantidaAgrupada, form.txtPorcentajeMin);
});

// Controles de notificación
document.querySelector('#chkNotificarBinance').addEventListener('change', e => chkNotificarBinance = e.target.checked ? 1 : 0);
document.querySelector('#chkNotifiBtc').addEventListener('change', e => chkNotifiBtc = e.target.checked ? 1 : 0);
