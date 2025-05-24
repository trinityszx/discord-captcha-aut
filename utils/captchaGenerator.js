// utils/captchaGenerator.js

const { createCanvas } = require('canvas');

function gerarCaptchaTexto() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem letras que confundem
  let texto = '';
  for (let i = 0; i < 5; i++) {
    texto += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return texto;
}

function gerarImagemCaptcha(texto) {
  const canvas = createCanvas(300, 100);
  const ctx = canvas.getContext('2d');

  // Fundo
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto
  ctx.font = 'bold 48px Sans';
  ctx.fillStyle = '#333';
  ctx.fillText(texto, 50, 65);

  // Linhas de ruído
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 300, Math.random() * 100);
    ctx.lineTo(Math.random() * 300, Math.random() * 100);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
  }

  return canvas.toBuffer();
}

module.exports = {
  gerarCaptchaTexto,
  gerarImagemCaptcha,
};
