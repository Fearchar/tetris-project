const width = 10
const height = 20

function buildBoard(boardSelector) {
  for (var i = 0; i < width * height; i++) {
    boardSelector.innerHTML += `<div class="board-square">${i}</div>`
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('#board')
  /// !!! Change buildBoard() so it doesn't have to go here
  buildBoard(board)
  const boardSquares = document.querySelectorAll('.board-square')


  /// !!! ----- Working Here -----

  class block {
    constructor(homeIndex, possibleRotations) {
      this.homeIndex = homeIndex
      this.rotationIndex = 0
      this.rotations = possibleRotations
      this.color = '#'
    }
    // !!! Consider name change
    // !!! Should include calculation of where the bits are
    get currentRotation() {
      return this.rotations[this.rotationIndex]
    }
    clearLastMove() {
      // !!! Change blocksquare name
      this.currentRotation.forEach(blockSquare => {
        // !!! Consider making next line pure re boardSquares
        boardSquares[blockSquare + this.homeIndex].classList.remove('.has-active-block')
      })
    }
    updateHome(direction) {
      // switch(direction) {
      //   case left:
      //     this.index -= 1
      //     break
      //   case up:
      //     this.index -= width
      //     break
      //   case left:
      //     this.index += 1
      //     break
      //   case right:
      //     this.index += width
      //     break
      // }
    }
    move(direction) {
      this.clearLastMove()
      /// !!! Consider changeing position name
      this.currentRotation.forEach(position => {
        boardSquares[this.homeIndex + position].classList.add('has-active-block')
      })
    }
  }

  class tBlock extends block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-4, -1, 0, +1],
          [-4, 0, +1, +4],
          [-1, 0, +1, +4],
          [-4, -1, 0, +4]
        ]
      )
    }
  }
})
