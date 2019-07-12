const width = 10
const height = 20
let dropInterval = null
let activeBlock = null

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

  // !!! Consider adding boardSquares to the parameters for the block class so that it can increase in purity and move up out of the dom to it's rightful place near the top of the code.
  class Block {
    constructor(homeIndex, possibleRotations) {
      this.homeIndex = homeIndex
      this.rotationIndex = 0
      this.rotations = possibleRotations
    }
    // !!! Consider name change
    // !!! Should include calculation of where the bits are
    get indexesOccupied() {
      return this.rotations[this.rotationIndex].map(index => index + this.homeIndex)
    }
    clearBlock() {
      // !!! Change index name
      this.indexesOccupied.forEach(index => {
        // !!! Consider making next line pure re boardSquares
        // !!! The next line is VERY similar to something in move. Bring it out of both?
        if (index >= 0) boardSquares[index].classList.remove('has-active-block', this.styleClass)
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
        default:
          this.homeIndex
      }
    }
    /// !!! How similar is this to checkIfInWall and vice versa ???
    checkCanMove(direction) {
      // !!! Change index name
      for (const index of this.indexesOccupied) {
        if (index % width === 0 && direction === 'left') {
          return false
        } else if (index % width === width - 1 && direction === 'right') {
          return false
        }
      }
      return true
    }
    // !!! This isShifting stuff is a poor patchup join. Needs a fix
    move(direction, isShifting) {
      if (this.checkCanMove(direction ) || isShifting) {
        this.clearBlock()
        this.updateHome(direction)
        /// !!! Consider changeing position name
        this.indexesOccupied.forEach(index => {
          if (index >= 0) {
            boardSquares[index].classList.add('has-active-block', this.styleClass)
          }
        })
      }
    }
    // !!! Update and move are doing awfully similar things. Intergrate somehow?
    // !!! everything relating to the checks for movement and walls are super dodgey. Firstly they need to happen repeatedly. Secondly they won't work for anything other than walls (so not the blocks at the bottom), thirdly I've added this really dodgey isShifting boolean to move to ignore the checkCanMove. I need a major restructure / rethink
    checkIfInWall() {
      let atLeftWall
      let atRightWall
      for (const index of this.indexesOccupied) {
        if (index % width === 0) {
          atLeftWall = index
        } else if (index % width === width - 1) {
          atRightWall = index
        }
      }
      if (!atLeftWall || !atRightWall) {
        return false
      } else if (this.homeIndex % width === 0) {
        return 'inLeftWall'
      } else {
        return 'inRightWall'
      }
    }
    // !!! Might want to make it so that the blocks check if they can rotate before rotating, rather than going through the motions and adjusting
    rotate() {
      this.clearBlock()
      this.rotationIndex = (this.rotationIndex + 1) % 4
      this.indexesOccupied.forEach(index => {
        boardSquares[index].classList.add('has-active-block', this.styleClass)
      })
      if (this.checkIfInWall() === 'inLeftWall') {
        this.move('right', true)
      } else if (this.checkIfInWall() === 'inRightWall') {
        this.move('left', true)
      }
    }
  }

  // !!! Alphabetise
  // !!! swap minus widths with units so it goes X Y not Y X

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
      this.styleClass = 'i-square'
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
      this.styleClass = 'j-square'
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
      this.styleClass = 'l-square'
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
      this.styleClass = 'o-square'
    }
    rotate() {
      return false
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
      this.styleClass = 's-square'
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
      this.styleClass = 't-square'
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
      this.styleClass = 'z-square'
    }
  }

  const blockPrototypes = [TBlock, IBlock, JBlock, LBlock, SBlock, ZBlock, OBlock]

  function generateBlock() {
    const randomIndex = Math.floor(Math.random() * blockPrototypes.length)
    return new blockPrototypes[randomIndex](5)
  }

  function lockBlock() {
    activeBlock.indexesOccupied.forEach(index => {
      // !!! I don't think has active block is doing anything
      boardSquares[index].classList.remove('has-active-block')
      boardSquares[index].classList.add('locked', activeBlock.styleClass)
    })
    activeBlock = null
  }

  function dropBlocks() {
    if (!activeBlock) {
      activeBlock = generateBlock(width / 2)
      activeBlock.move()

    } else if (
      activeBlock
        .indexesOccupied
        .some(index => {
          const nextLineIndex = index + width
          return nextLineIndex > boardSquares.length ||
            boardSquares[nextLineIndex].classList.contains('locked')
        })
    ) {
      lockBlock()
    } else {
      activeBlock.move('down')
    }
  }

  // !!! ----------- Testing Junk -----------
  dropInterval = setInterval(dropBlocks ,200)
  // const z = new ZBlock(14)
  // const t = new TBlock(46)
  // const l = new LBlock(74)
  // const o = new OBlock(106)
  // const i = new IBlock(134)
  // const j = new JBlock(154)
  // const s = new SBlock(174)

  // addEventListener('keydown', (e) => {
  //   if (e.keyCode === 37) {
  //     z.move('left')
  //     t.move('left')
  //     l.move('left')
  //     i.move('left')
  //     o.move('left')
  //     j.move('left')
  //     s.move('left')
  //   } else if (e.keyCode === 39) {
  //     z.move('right')
  //     t.move('right')
  //     l.move('right')
  //     i.move('right')
  //     o.move('right')
  //     j.move('right')
  //     s.move('right')
  //   } else if (e.keyCode === 40) {
  //     z.move('down')
  //     t.move('down')
  //     l.move('down')
  //     i.move('down')
  //     o.move('down')
  //     j.move('down')
  //     s.move('down')
  //   } else if (e.keyCode === 38) {
  //     z.rotate()
  //     t.rotate()
  //     l.rotate()
  //     i.rotate()
  //     o.rotate()
  //     j.rotate()
  //     s.rotate()
  //   }
  // })
})
