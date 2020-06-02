const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto-js");
const fs = require("fs");
const fetch = require("node-fetch");

const myToken = "cb2c0266ad1ab412ff60e79bd7925d9cbd66c9d0";
const urlApi = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${myToken}`;

const apiSolution = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${myToken}`;


async function findToken() {
  try {

    const tokenJson = await axios.get(urlApi); 

    return tokenJson.data;

  } catch (error) {
    console.warn("Token não encontrado");
  }
}


function decifrar(casas, cifrado) {
  let fraseDecifrado = "";

  for (let i in cifrado) { 

    let letras = cifrado[i].toLowerCase(); 

    if ([" ", ",", "."].indexOf(letras) >= 0) { 

      fraseDecifrado += letras;

    }
    else {
      let nextLetras = letras.charCodeAt(0) - casas;
      nextLetras = nextLetras < 97 ? 122 - (96 - nextLetras) : nextLetras;
      fraseDecifrado += String.fromCharCode(nextLetras);
    }

  }

  return fraseDecifrado;
}


async function writeFile() {
  const { numero_casas, token, cifrado } = await findToken();

  const decifrado = decifrar(numero_casas, cifrado);

  const hash = crypto.SHA1(decifrado);
  const resumo_criptografico = crypto.enc.Hex.stringify(hash);


  const answer = {
    numero_casas,
    token,
    cifrado,
    decifrado,
    resumo_criptografico
  };

  fs.writeFileSync("answer.json", JSON.stringify(answer));

}

writeFile();
submit();

async function submit() {

  const formData = new FormData();

  formData.append("answer", fs.createReadStream("./answer.json"));

  const headerPost = { headers: { "Content-Type": "multipart/form-data" } };

  await fetch(apiSolution, { method: 'POST', body: formData }, headerPost)
    .then(function (response) {
      console.log('Upload successful!  Server responded with:', response);
    })
    .catch(function (error) {
      console.log(error);
    });
}