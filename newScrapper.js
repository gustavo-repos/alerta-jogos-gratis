const { exec } = require('child_process');
const path = require('path');

const runCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const main = async () => {
  try {
    // Caminho para o arquivo PDF a ser salvo no diretório atual do script
    const pdfFilePath = path.join(__dirname, 'elements.pdf');

    // Comando para abrir o Chromium em modo headless e acessar a página desejada
    const openChromiumCommand = `/snap/bin/chromium --headless --disable-gpu --print-to-pdf=${pdfFilePath} https://store.epicgames.com/pt-BR/`;

    // Executa o comando para abrir o Chromium em modo headless
    await runCommand(openChromiumCommand);

    console.log('Chromium aberto em modo headless.');

    console.log(`Arquivo PDF salvo em: ${pdfFilePath}`);

  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
};


module.exports = { main }
