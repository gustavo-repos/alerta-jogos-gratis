function timeToSeconds (hour, minutes, seconds = 0) {
    return (hour * 3600) + (minutes * 60) + (seconds * 1)
}

function getFirstInterval (hour, minutes, seconds = 0) {
    var firstInterval;
    var data = new Date()
    var hourSetted = timeToSeconds(hour, minutes, seconds);
    data = (data.getHours() * 3600) + (data.getMinutes() * 60) + (data.getSeconds() * 1)
    // console.log(`Data: ${data}, Hora pretendida: ${hourSetted}`)
    if (data <= hourSetted) {
        //console.log(`a hora digitada é depois (ou agora)`)
        firstInterval = hourSetted - data
    } else {
        //console.log(`a hora digitada é antes`)
        firstInterval = (86400 + hourSetted) - data
    }

    //console.log(`Próxima atualização em: ${firstInterval}s`)
    return firstInterval

}

module.exports = { getFirstInterval };
