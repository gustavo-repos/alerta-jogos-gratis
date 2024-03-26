var list = document.getElementById("list");
var textArea = document.getElementById("text-area");

const displayGames = () => {

    for (var i = 0; i < content.length; i++) {

        var listItem = document.createElement('tr');
        

        listItem.innerHTML = `

            <td>${content[i].site}</td>
            <td>${content[i].title}</td>`

        list.appendChild(listItem);

    }

}

const displayLog = () => {

    //console.log(log)
    //textArea.innerHTML = log.log

    for (var i = 0; i < log.length; i++) {

        var logItem = document.createElement('span');
        

        logItem.innerHTML = `
            ${log[i].log}
        `

            textArea.appendChild(logItem);

    }

    textArea.scrollTop = textArea.scrollHeight;
    
    

}

const fetchGamesData = () => {

    fetch("/games", {

        method: 'GET'  
    
    })
    .then(response => {
        response.json()
            .then(data => {
                content = data.games;
                displayGames();
            })
    })

}

async function fetchLog() {

    //console.log( (await fetch('log.txt')).text() );


    fetch("/log", {

        method: 'GET'  
    
    })
    .then(response => {
        response.json()
            .then(data => {
                log = data.log;
                displayLog();
            })
    })
}

fetchGamesData();
fetchLog();
