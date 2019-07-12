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
    get indexsOccupied() {
      return this.rotations[this.rotationIndex].map(index => index + this.homeIndex)
    }
    clearLastMove() {
      // !!! Change index name
      this.indexsOccupied.forEach(index => {
        // !!! Consider making next line pure re boardSquares
        boardSquares[index].classList.remove('has-active-block')
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
    checkCanMove(direction) {
      // !!! Change index name
      for (const index of this.indexsOccupied) {
        if (index % width === 0 && direction === 'left') {
          return false
        } else if (index % width === width - 1 && direction === 'right') {
          return false
        }
      }
      return true
    }
    move(direction) {
      if (this.checkCanMove(direction)) {
        this.clearLastMove()
        this.updateHome(direction)
        /// !!! Consider changeing position name
        this.indexsOccupied.forEach(index => {
          boardSquares[index].classList.add('has-active-block')
        })
      }
    }
    // !!! Update and move are doing awfully similar things. Intergrate somehow?
    rotate() {
      this.clearLastMove()
      this.rotationIndex = (this.rotationIndex + 1) % 4
      this.indexsOccupied.forEach(index => {
        boardSquares[index].classList.add('has-active-block')
      })
    }
  }

  // !!! swap minus widths with units so it goes X Y not Y X
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
      super(
        homeIndex,
        [
          [-width-1, -width, -1, 0]
        ]
      )
    }
    rotate() {
      return false
    }
  }

  const z = new ZBlock(44)
  const t = new TBlock(14)
  const l = new LBlock(65)
  const o = new OBlock(95)

  addEventListener('keydown', (e) => {
    if (e.keyCode === 37) {
      z.move('left')
      t.move('left')
      l.move('left')
      o.move('left')
    } else if (e.keyCode === 39) {
      z.move('right')
      t.move('right')
      l.move('right')
      o.move('right')
    } else if (e.keyCode === 40) {
      z.move('down')
      t.move('down')
      l.move('down')
      o.move('down')
    } else if (e.keyCode === 38) {
      z.rotate()
      t.rotate()
      l.rotate()
      o.rotate()
    }
  })
})
