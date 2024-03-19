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
    const pdfFilePath = path.join(__dirname, 'meu_arquivo.pdf');

    // Comando para abrir o Chromium em modo headless e acessar a página desejada
    const openChromiumCommand = `/usr/bin/chromium-browser --headless --disable-gpu https://store.epicgames.com/pt-BR/`;

    // Executa o comando para abrir o Chromium em modo headless
    await runCommand(openChromiumCommand);

    console.log('Chromium aberto em modo headless.');

    // Comando para extrair texto do PDF e mostrar no console
    //const showPdfContentCommand = `pdfgrep "" ${pdfFilePath}`;
    //const pdfContent = await runCommand(showPdfContentCommand);

    //console.log('Conteúdo do PDF:');
    //console.log(pdfContent);

  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
};

//main();

module.exports = { main }