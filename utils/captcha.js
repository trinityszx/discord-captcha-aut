const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');



function generateRandomText(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

function createCaptchaImage() {
  const width = 400;
  const height = 150;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Texto aleatório (4 letras maiúsculas)
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const text = Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

  // Fonte grande e legível
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#000000';

  // Centraliza o texto
  const textWidth = ctx.measureText(text).width;
  const x = (width - textWidth) / 2;
  const y = height / 2 + 20;
  ctx.fillText(text, x, y);

  // Ruído leve para segurança
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = `rgba(0,0,0,0.1)`;
    ctx.stroke();
  }

  return { buffer: canvas.toBuffer(), text };
}

function createCaptchaOptions(correctText) {
  const options = [correctText];
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (options.length < 5) {
    let fake = '';
    for (let i = 0; i < correctText.length; i++) {
      fake += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    if (!options.includes(fake)) {
      options.push(fake.toUpperCase());
    }
  }

  return shuffleArray(options);
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

module.exports = {
  createCaptchaImage,
  createCaptchaOptions,
};
