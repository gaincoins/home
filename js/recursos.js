//new FormData(form)
let getJsonFormData = (e) => {
    const data = {};
    e.forEach((value, key) => (data[key] = value));
    return data
}
// _formato: f,h,fh
let getDateTime = (_formato) => {
    const hoy = new Date()
    switch (_formato) {
        case 'f':
            return `${hoy.getFullYear()}-${(hoy.getMonth() + 1) < 10 ? '0' + (hoy.getMonth() + 1) : (hoy.getMonth() + 1)}-${hoy.getDate() < 10 ? '0' + hoy.getDate() : hoy.getDate()}`
            break;
        case 'h':
            return `${hoy.getHours() < 10 ? '0' + hoy.getHours() : hoy.getHours()}:${hoy.getMinutes() < 10 ? '0' + hoy.getMinutes() : hoy.getMinutes()}:${hoy.getSeconds() < 10 ? '0' + hoy.getSeconds() : hoy.getSeconds()}`
            break;
        case 'm':
            return hoy.getMinutes()
            break;
        case 's':
            return hoy.getSeconds()
            break;
        case 'fh':
            return `${hoy.getFullYear()}-${(hoy.getMonth() + 1) < 10 ? '0' + (hoy.getMonth() + 1) : (hoy.getMonth() + 1)}-${hoy.getDate() < 10 ? '0' + hoy.getDate() : hoy.getDate()} ${hoy.getHours() < 10 ? '0' + hoy.getHours() : hoy.getHours()}:${hoy.getMinutes() < 10 ? '0' + hoy.getMinutes() : hoy.getMinutes()}:${hoy.getSeconds() < 10 ? '0' + hoy.getSeconds() : hoy.getSeconds()}`
            break;
        default:
            return null
            break;
    }

}
// adiciona los minutos que deseas a la hora actual
let getDateTimeAdd = (_hora, _minuto, _segundo) => {
    let hoy = new Date()
    let result = {}
    result.horaActual = `${hoy.getHours() < 10 ? '0' + hoy.getHours() : hoy.getHours()}:${hoy.getMinutes() < 10 ? '0' + hoy.getMinutes() : hoy.getMinutes()}:${hoy.getSeconds() < 10 ? '0' + hoy.getSeconds() : hoy.getSeconds()}`,
        hoy.setHours(hoy.getHours() + _hora)
    hoy.setMinutes(hoy.getMinutes() + _minuto)
    hoy.setSeconds(hoy.getSeconds() + _segundo)
    result.horaTemp = `${hoy.getHours() < 10 ? '0' + hoy.getHours() : hoy.getHours()}:${hoy.getMinutes() < 10 ? '0' + hoy.getMinutes() : hoy.getMinutes()}:${hoy.getSeconds() < 10 ? '0' + hoy.getSeconds() : hoy.getSeconds()}`
    return result
}


let relogio
let tiempoProgreso = {
    tiempo: 0,
    iniciar(tagValue) {
        relogio = setInterval(() => {
            this.tiempo++
            document.querySelector(`#${tagValue}`).innerHTML = `Tiempo ejecución ${this.tiempo}ms`
        }, 100)
    },
    parar() {
        clearInterval(relogio)
        this.tiempo = 0
    }
}

//ORDENAMIENTO DE LAS TABLAS SEGUN LA COLUMNA 
const getCellValue = (tableRow, columnIndex) => tableRow.children[columnIndex].innerText || tableRow.children[columnIndex].textContent;
const comparer = (idx, asc) => (r1, r2) => ((el1, el2) =>
    el1 !== '' && el2 !== '' && !isNaN(el1) && !isNaN(el2) ? el1 - el2 : el1.toString().localeCompare(el2)
)(getCellValue(asc ? r1 : r2, idx), getCellValue(asc ? r2 : r1, idx));

document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
    const table = th.closest('table');
    Array.from(table.querySelectorAll('tbody tr:nth-child(n+1)'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
        .forEach((tr) => { table.querySelector('tbody').appendChild(tr) });
})));

// función de tiempo de respuesta del servidor de api
function apiResponseTime(_inicioMilseg,_tag){
    let time=window.performance.now() - _inicioMilseg;
    document.querySelector(_tag).innerHTML=`<spm style="position:absolute;height:15px;width:100%;background:${time>=2000?'rgba(255,74,73,0.5)':'rgb(38,196,135,0.5)' };top:0;color:#ffffff;text-align:center;">
    ${numberLocaleString(time,2)}ms
    </spm>`;
} 

//FORMATO DE NUMEROS Y DECIMALES
function numberLocaleString(_valor,_numDecimales){
    return (_valor).toLocaleString('en-US',{minimumFractionDigits: _numDecimales, maximumFractionDigits: _numDecimales})
}