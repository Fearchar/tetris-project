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
        boardSquares[index].classList.remove('has-active-block', this.color)
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
    /// !!! How similar is this to checkIfInWall and vice versa ???
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
          boardSquares[index].classList.add('has-active-block', this.color)
        })
      }
    }
    // !!! Update and move are doing awfully similar things. Intergrate somehow?
    checkIfInWall() {
      let atLeftWall
      let atRightWall
      for (const index of this.indexsOccupied) {
        if (index % width === 0) {
          atLeftWall = index
        } else if (index % width === width - 1) {
          atRightWall = index
        }
      }
      if (!atLeftWall && !atRightWall) {
        return false
      } else if (atLeftWall < atRightWall) {
        return 'inLeftWall'
      } else {
        return 'inRightWall'
      }
    }
    // !!! Might want to make it so that the blocks check if they can rotate before rotating, rather than going through the motions and adjusting
    rotate() {
      this.clearLastMove()
      this.rotationIndex = (this.rotationIndex + 1) % 4
      this.indexsOccupied.forEach(index => {
        boardSquares[index].classList.add('has-active-block', this.color)
      })
      if (this.checkIfInWall() === 'inLeftWall') {
        this.move('right')
      } else if (this.checkIfInWall() === 'inRightWall') {
        this.move('left')
      }
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
      this.color = 'red'
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
      this.color = 'green'
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
      this.color = 'blue'
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
      this.color = 'purple'
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

  const z = new ZBlock(14)
  const t = new TBlock(46)
  const l = new LBlock(74)
  const o = new OBlock(106)
  const i = new IBlock(134)
  const j = new JBlock(154)
  const s = new SBlock(174)

  addEventListener('keydown', (e) => {
    if (e.keyCode === 37) {
      z.move('left')
      t.move('left')
      l.move('left')
      i.move('left')
      o.move('left')
      j.move('left')
      s.move('left')
    } else if (e.keyCode === 39) {
      z.move('right')
      t.move('right')
      l.move('right')
      i.move('right')
      o.move('right')
      j.move('right')
      s.move('right')
    } else if (e.keyCode === 40) {
      z.move('down')
      t.move('down')
      l.move('down')
      i.move('down')
      o.move('down')
      j.move('down')
      s.move('down')
    } else if (e.keyCode === 38) {
      z.rotate()
      t.rotate()
      l.rotate()
      i.rotate()
      o.rotate()
      j.rotate()
      s.rotate()
    }
  })
})
