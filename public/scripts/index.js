var list = document.getElementById("list");
var textArea = document.getElementById("text-area");
var content;

const displayGames = () => {
    for (var i = 0; i < content.length; i++) {
        var listItem = document.createElement('tr');
        listItem.innerHTML = `
            <td>${content[i].site}</td>
            <td>${content[i].title}</td>`;
        list.appendChild(listItem);
    }
}

const displayLog = () => {
    for (var i = 0; i < content.length; i++) {
        for (var j = 0; j < content[i].log.length; j++) {
            textArea.innerHTML += `${content[i].log[j]}\n`;
        }
        textArea.innerHTML += `\n`;
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
            });
    });
}

async function fetchLog() {
    fetch("/log", {
        method: 'GET'
    })
    .then(response => {
        response.json()
            .then(data => {
                content = data.log;
                displayLog();
            });
    });
}

fetchGamesData();
fetchLog();
