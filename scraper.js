const https = require('https');
const { JSDOM } = require('jsdom');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const { window } = new JSDOM(data);
        resolve(window.document);
      });
    }).on('error', (err) => {
      reject(`Erro na requisição: ${err.message}`);
    });
  });
}

async function getData(phrase, endpoint) {
  const options = {
    hostname: 'www.gog.com',
    port: 443,
    path: endpoint,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.get(options, (res) => {
      let result = ''
      res.on('data', (data) => {
        result += data.toString()
      });
      res.on('end', () => {
        result = result.replace(/\s{2,}/g, ' ').trim()
        var start = result.indexOf(phrase)
        var newstring = result.substring(start+phrase.length, result.length)
        var end = newstring.indexOf('}')
        resolve(newstring.substring(0, end-1));
      });
    });

    req.on('error', (error) => {
      console.error('Erro na solicitação:', error);
      reject(error);
    });
  });
}

// async function fetchGameData(phrase, endpoint) {
//   try {
//     const data = await getData(phrase, endpoint);
//     //console.log(data);
//   } catch (error) {
//     console.error('Erro:', error);
//   }
// }

//fetchGameData('"Processor:","description":"', '/en/game/betrayer');

module.exports = { makeRequest, getData };

