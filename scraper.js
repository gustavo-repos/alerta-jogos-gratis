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
        console.log('Dados recebidos:', data); // Adicione este log para depuração
        const { window } = new JSDOM(data);
        resolve(window.document);
      });
    }).on('error', (err) => {
      reject(`Erro na requisição: ${err.message}`);
    });
  });
}

async function getData(hostname ,endpoint) {
  const options = {
    hostname: hostname,
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
        console.log(result)
      });
    });

    req.on('error', (error) => {
      console.error('Erro na solicitação:', error);
      reject(error);
    });
  });
}

module.exports = { makeRequest, getData };

