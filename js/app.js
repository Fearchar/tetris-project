const width = 10
const height = 20

document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('#board')
  for (var i = 0; i < width * height; i++) {
    board.innerHTML += `<div class="square">${i}</div>`
  }
})
