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

  class Block {
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
        boardSquares[blockSquare + this.homeIndex].classList.remove('has-active-block')
      })
    }
    // !!! Change updateHome name to something to do with moving
    updateHome(direction) {
      switch(direction) {
        case 'left':
          this.homeIndex -= 1
          break
        case 'right':
          this.homeIndex += 1
          break
        case 'up':
          this.homeIndex -= width
          break
        case 'down':
          this.homeIndex += width
          break
      }
    }
    move(direction) {
      this.clearLastMove()
      this.updateHome(direction)
      /// !!! Consider changeing position name
      this.currentRotation.forEach(position => {
        boardSquares[this.homeIndex + position].classList.add('has-active-block')
      })
    }
    // !!! Update and move are doing awfully similar things. Intergrate somehow?
    rotate() {
      this.clearLastMove()
      this.rotationIndex = (this.rotationIndex + 1) % 4
      this.currentRotation.forEach(position => {
        boardSquares[this.homeIndex + position].classList.add('has-active-block')
      })
    }
  }

  class TBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width, -1, 0, +1],
          [-width, 0, +1, +width],
          [-1, 0, +1, +width],
          [-width, -1, 0, +width]
        ]
      )
    }
  }

  class IBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-1, 0, +1, +2],
          [-width*2, -width, 0, +width],
          [-width-1, -width, -width+1, -width+2],
          [-width*2+1, -width+1, +1, +width+1]
        ]
      )
    }
  }

  class JBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width-1, -1, 0, +1],
          [-width, -width+1, 0, +width],
          [-1, 0, +1, +width+1],
          [-width, 0, +width-1, +width]
        ]
      )
    }
  }

  class LBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width+1, -1, 0, +1],
          [-width, 0, +width, +width+1],
          [-1, 0, +1, +width-1],
          [-width-1, -width, 0, width]
        ]
      )
    }
  }

  class SBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width, -width+1, -1, 0],
          [-width, 0, +1, +width+1],
          [0, +1, +width-1, +width],
          [-width-1, -1, 0, +width]
        ]
      )
    }
  }

  class ZBlock extends Block {
    constructor(homeIndex) {
      super(
        homeIndex,
        [
          [-width-1, -width, 0, +1],
          [-width+1, 0, +1, +width],
          [-1, 0, +width, +width+1],
          [-width, -1, 0, +width-1]
        ]
      )
    }
  }

  class OBlock extends Block {
    constructor(homeIndex) {
      super(homeIndex)
    }
    rotate() {
      return false
    }
  }

  const a = new ZBlock(44)

  addEventListener('keydown', (e) => {
    if (e.keyCode === 37) {
      a.move('left')
    } else if (e.keyCode === 39) {
      a.move('right')
    } else if (e.keyCode === 40) {
      a.move('down')
    } else if (e.keyCode === 38) {
      a.rotate()
    }
  })
})
