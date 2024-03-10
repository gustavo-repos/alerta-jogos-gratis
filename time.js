function timeToSeconds (hour, minutes, seconds = 0) {
    return (hour * 3600) + (minutes * 60) + (seconds * 1)
}

function getFirstInterval (hour, minutes, seconds = 0) {
    var firstInterval;
    var data = new Date()
    var hourSetted = timeToSeconds(hour, minutes, seconds);
    data = (data.getHours() * 3600) + (data.getMinutes() * 60) + (data.getSeconds() * 1)
    if (data <= hourSetted) {
        //a hora digitada é depois (ou agora)
        firstInterval = hourSetted - data
    } else {
        //a hora digitada é antes
        firstInterval = (86400 + hourSetted) - data
    }

    return firstInterval

}

module.exports = { getFirstInterval };
