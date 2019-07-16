// !!! render / paint block function

const width = 10
const height = 20
let dropInterval = null
let activeBlock = null
let shuffledBlocks = []
let score = 0
let linesCleared = 0
let level = 1
const levelsAtLines = [1, 5, 10, 15, 25, 35, 50, 70, 100]

function buildBoard(boardSelector) {
  const boardSquares = []
  for (var i = 0; i < width * height; i++) {
    const square = document.createElement('div')
    square.className = 'board-square'
    //!!! square.textContent = i
    boardSelector.appendChild(square)
    boardSquares.push(square)
  }
  return boardSquares
}

function clearBlocks(squares){
  squares.forEach(square => {
    if (square.classList.contains('has-active-block')) square.className = 'board-square'
  })
}

function checkIfMovingIntoWall(direction, squareIndex) {
  // !!! Change squareIndex name
  if ((squareIndex + width) % width === width - 1 && direction === 'left') {
    return true
  } else if (squareIndex % width === 0 && direction === 'right') {
    return true
  }
  return false
}

//!! If classes get moved up to the top this may need to moved
function calculateBlockIndexes(block, rotationIndex, homeIndex) {
  return block.rotations[rotationIndex].map(index => index + homeIndex)
}

// !!! Change updateHome name to something to do with moving
function updateHome(direction, block) {
  let newHomeIndex = block.homeIndex
  switch(direction) {
    case 'left':
      newHomeIndex -= 1
      break
    case 'right':
      newHomeIndex += 1
      break
    case 'up':
      newHomeIndex -= width
      break
    case 'down':
      newHomeIndex += width
      break
    default:
      newHomeIndex
  }
  return newHomeIndex
}

function canBlockMove(boardSquares, direction, index) {
  if (
    (index >= 0 &&
    boardSquares[index].classList.contains('locked')) ||
    (checkIfMovingIntoWall(direction, index))
  ) return true
  else return false
}

// !!! This clear = true stuff, and projection block stuff is janky!
function move(boardSquares, block, direction, clear=true, calledByDropP=false) {
  const newHomeIndex = newHomeIfCanMove(boardSquares, block, direction)
  if (newHomeIndex) {
    if (clear) clearBlocks(boardSquares)
    block.homeIndex = newHomeIndex
    block.indexesOccupied.forEach(index => {
      if (index >= 0 && !calledByDropP) {
        boardSquares[index].classList.add('has-active-block', block.styleClass)
      }
    })
  }
  if (!calledByDropP) block.projectDrop()
}

// !!! Update and move are doing awfully similar things. Intergrate somehow?
// !!! everything relating to the checks for movement and walls are super dodgey. Firstly they need to happen repeatedly. Secondly they won't work for anything other than walls (so not the blocks at the bottom), thirdly I've added this really dodgey  boolean to move to ignore the checkIfMovingIntoWall. I need a major restructure / rethink
//!!! Change name
function correctPlacement(block, direction, amount=1) {
  if (direction === 'right') {
    return block.homeIndex + amount
  } else if (direction === 'left') {
    return block.homeIndex - amount
  }
}

function newHomeIfCanMove(boardSquares, block, direction) {
  // !!! Also bring the logic that stops it from going through the bottom into here maybe?
  const potentialHomeIndex = updateHome(direction, block)
  const indexesToOccupy =  calculateBlockIndexes(block, block.rotationIndex, potentialHomeIndex)
  return !indexesToOccupy.some(index => {
    return canBlockMove(boardSquares, direction, index)
  }) ? potentialHomeIndex : false
}

function rotatingIntoWall(indexesToOccupy) {
  let atLeftWall
  let atRightWall
  // ### Checking if in wall
  for (const squareIndex of indexesToOccupy) {
    if (squareIndex % width === 0) {
      atLeftWall = squareIndex
    } else if (squareIndex % width === width - 1) {
      atRightWall = squareIndex
    }
  }
  return !atLeftWall || !atRightWall
}

document.addEventListener('DOMContentLoaded', () => {
  // !!! Reorganise dom consts by order on the page
  const board = document.querySelector('#board')
  const boardSquares = buildBoard(board)
  const scoreDisplay = document.querySelector('#score-display')
  const levelDisplay = document.querySelector('#level-display')
  const linesClearedDisplay = document.querySelector('#lines-cleared-display')
  const nextLevelDisplay = document.querySelector('#next-level-display')
  const startResetButton = document.querySelector('#start-reset')
  const start = document.querySelector('#start-reset')
  const gameOverDisplay = document.querySelector('#game-over-display')
  const gameOverScoreDisplay = document.querySelector('#game-over-score-display')
  const gameOverLevelDisplay = document.querySelector('#game-over-level-display')
  const gameOverLinesClearedDisplay = document.querySelector('#game-over-lines-cleared-display')
  const playAgainButton = document.querySelector('#play-again')
  // !!! change name once these are being built automatically
  const queuedBlocks = [document.querySelectorAll('.queued-block:nth-child(1) div'), document.querySelectorAll('.queued-block:nth-child(2) div'), document.querySelectorAll('.queued-block:nth-child(3) div')]


  // !!! Consider adding boardSquares to the parameters for the block class so that it can increase in purity and move up out of the dom to it's rightful place near the top of the code.
  class Block {
    constructor(homeIndex, possibleRotations, isProjection=false) {
      this.homeIndex = homeIndex
      this.rotationIndex = 0
      this.rotations = possibleRotations
      this.isPorjection = isProjection
    }
    get indexesOccupied() {
      return calculateBlockIndexes(this, this.rotationIndex, this.homeIndex)
    }

    // !!! Change name
    // So much refactoring needed
    newPositionIfCanRotate() {
      const newRotationIndex = (this.rotationIndex + 1) % 4
      let indexesToOccupy = calculateBlockIndexes(this, newRotationIndex, this.homeIndex)
      let newHomeIndex = this.homeIndex
      if (!rotatingIntoWall(indexesToOccupy)) {
        if (!(this instanceof IBlock)) {
          if (this.homeIndex % width === 0) {
            newHomeIndex = correctPlacement(this, 'right')
          } else {
            newHomeIndex = correctPlacement(this, 'left')
          }
        } else {
          if (newRotationIndex === 2 && this.homeIndex % width === 0) {
            newHomeIndex = correctPlacement(this, 'right')
          } else if (newRotationIndex === 2) {
            newHomeIndex = correctPlacement(this, 'left', 2)
          } else if (newRotationIndex === 0 && this.homeIndex % width === width - 1) {
            newHomeIndex = correctPlacement(this, 'right', 2)
          } else {
            newHomeIndex = correctPlacement(this, 'left')
          }
          indexesToOccupy = this.rotations[newRotationIndex].map(index => index + newHomeIndex)
        }
      }
      // ### Checking if rotating into locked block
      for (const index of indexesToOccupy) {
        // !!! Can be replaced by a terniary?
        if (
          index >= boardSquares.length  ||
          (
            index >= 0 &&
            boardSquares[index].classList.contains('locked')
          )
        ) {
          return false
        }
      }
      this.homeIndex = newHomeIndex
      move(boardSquares, this)
      clearBlocks(boardSquares)
      this.rotationIndex = newRotationIndex
      return true
    }
    // !!! Might want to make it so that the blocks check if they can rotate before rotating, rather than going through the motions and adjusting
    rotate() {
      if (this.newPositionIfCanRotate()) {
        // !!! If the below stays as it is you can have a function that just paints the block where ever it is and use it on this and move (and correctPlacement? If that still exists)
        this.indexesOccupied.forEach(index => {
          if (index >= 0) boardSquares[index].classList.add('has-active-block', this.styleClass)
        })
      }
      this.projectDrop()
    }
    projectDrop() {
      let projectionBlock = null
      if (this instanceof IBlock) {
        projectionBlock = new IBlock()
      } else if (this instanceof JBlock) {
        projectionBlock = new JBlock()
      } else if (this instanceof LBlock) {
        projectionBlock = new LBlock()
      } else if (this instanceof OBlock) {
        projectionBlock = new OBlock()
      } else if (this instanceof SBlock) {
        projectionBlock = new SBlock()
      } else if (this instanceof TBlock) {
        projectionBlock = new TBlock()
      } else if (this instanceof ZBlock) {
        projectionBlock = new ZBlock()
      }
      // isProjection might be pointless
      projectionBlock.isProjection = true
      projectionBlock.homeIndex = this.homeIndex
      projectionBlock.rotationIndex = this.rotationIndex
      projectionBlock.styleClass = 'board-square'
      for (let i = 0; i < height - 1 && !asLowAsCanGo(projectionBlock); i ++) {
        move(boardSquares, projectionBlock, 'down', false, true)
      }
      // make below part of clear or something like that. Can we just include this in the normal clear and get rid of this clear true / false stuff in clear?
      boardSquares.forEach(square => {
        square.classList.remove(
          'project',
          'i-projection',
          'j-projection',
          'l-projection',
          'o-projection',
          's-projection',
          't-projection',
          'z-projection'
        )
      })
      projectionBlock.indexesOccupied.forEach(index => {
        //!!! Change project CSS class to has-projection
        if (index > 0) boardSquares[index].classList.add('project', projectionBlock.projectionStyleClass)
      })
    }
  }

  // !!! swap minus widths with units so it goes X Y not Y X

  class IBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-1, 0, +1, +2],
          [-boardWidth*2, -boardWidth, 0, +boardWidth],
          [-boardWidth-1, -boardWidth, -boardWidth+1, -boardWidth+2],
          [-boardWidth*2+1, -boardWidth+1, +1, +boardWidth+1]
        ]
      )
      this.styleClass = 'i-square'
      this.projectionStyleClass = 'i-projection'
    }
  }

  class JBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth-1, -1, 0, +1],
          [-boardWidth, -boardWidth+1, 0, +boardWidth],
          [-1, 0, +1, +boardWidth+1],
          [-boardWidth, 0, +boardWidth-1, +boardWidth]
        ]
      )
      this.styleClass = 'j-square'
      this.projectionStyleClass = 'j-projection'
    }
  }

  class LBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth+1, -1, 0, +1],
          [-boardWidth, 0, +boardWidth, +boardWidth+1],
          [-1, 0, +1, +boardWidth-1],
          [-boardWidth-1, -boardWidth, 0, boardWidth]
        ]
      )
      this.styleClass = 'l-square'
      this.projectionStyleClass = 'l-projection'
    }
  }

  class OBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth-1, -boardWidth, -1, 0]
        ]
      )
      this.styleClass = 'o-square'
      this.projectionStyleClass = 'o-projection'
    }
    rotate() {
      this.projectDrop()
    }
  }

  class SBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth, -boardWidth+1, -1, 0],
          [-boardWidth, 0, +1, +boardWidth+1],
          [0, +1, +boardWidth-1, +boardWidth],
          [-boardWidth-1, -1, 0, +boardWidth]
        ]
      )
      this.styleClass = 's-square'
      this.projectionStyleClass = 's-projection'
    }
  }

  class TBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth, -1, 0, +1],
          [-boardWidth, 0, +1, +boardWidth],
          [-1, 0, +1, +boardWidth],
          [-boardWidth, -1, 0, +boardWidth]
        ]
      )
      this.styleClass = 't-square'
      this.projectionStyleClass = 't-projection'
    }
  }

  class ZBlock extends Block {
    constructor(homeIndex, boardWidth=width) {
      super(
        homeIndex,
        [
          [-boardWidth-1, -boardWidth, 0, +1],
          [-boardWidth+1, 0, +1, +boardWidth],
          [-1, 0, +boardWidth, +boardWidth+1],
          [-boardWidth, -1, 0, +boardWidth-1]
        ]
      )
      this.styleClass = 'z-square'
      this.projectionStyleClass = 'z-projection'
    }
  }

  const blockPrototypes = [TBlock, IBlock, JBlock, LBlock, SBlock, ZBlock, OBlock]

  function shuffleBlocks() {
    const blockSequence = blockPrototypes.slice(0)
    let currentIndex = blockSequence.length
    let temporaryValue
    let randomIndex
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = blockSequence[currentIndex]
      blockSequence[currentIndex] = blockSequence[randomIndex]
      blockSequence[randomIndex] = temporaryValue
    }
    return blockSequence
  }

  // !!! Change name
  function queueBlocks() {
    // !! change board pram name?
    queuedBlocks.forEach((board, i) => {
      board.forEach(square => {
        square.className = 'next-display-square'
      })
      const block = new shuffledBlocks[i](5, 4)
      block.indexesOccupied.forEach(index => {
        board[index].classList.add(block.styleClass)
      })
    })
    console.log((new blockPrototypes[0]).rotations[0])
  }

  function generateBlock() {
    if (shuffledBlocks.length <= 3) {
      shuffledBlocks = shuffledBlocks.concat(shuffleBlocks())
    }
    const nextBlock = shuffledBlocks.shift()
    queueBlocks()
    // !!! nextThreeDisplay.textContent =
    //   `${shuffledBlocks[0].name},
    //   ${shuffledBlocks[1].name},
    //   ${shuffledBlocks[2].name}`
    return new nextBlock(width / 2)
  }

  function checkForCompleteLines() {
    const linesToRemove = []
    const numberOfLines = boardSquares.length / width
    for (var i = numberOfLines - 1; i >= 0; i--) {
      if(boardSquares.slice(i * width, (i * width) + width).every(square => {
        return square.classList.contains('locked')
      })) linesToRemove.push(i)
    }
    return linesToRemove[0] ? linesToRemove : false
  }

  function dropLockedLines(removedLines) {
    removedLines.forEach((line, i) => {
      for (let j = ((line + i) * width) - 1 ; j >= 0; j--) {
        const square = boardSquares[j]
        const newSquare = boardSquares[j + width]
        newSquare.className = square.className
        square.className = 'board-square'
      }
    })
  }

  function levelUp(currentLevel) {
    clearInterval(dropInterval)
    console.log(500 - (currentLevel * 60))
    dropInterval = setInterval(dropBlocks, 500 - (currentLevel * 60))
    return currentLevel + 1
  }

  function clearFullLines() {
    const linesToRemove = checkForCompleteLines()
    if (linesToRemove) {
      linesToRemove.forEach(line => {
        for (var i = 0; i < width; i++) {
          boardSquares[(line * width) + i].className = 'board-square'
        }
        score += 10
        scoreDisplay.textContent = score
        linesCleared ++
        linesClearedDisplay.textContent = linesCleared
        if (linesCleared === levelsAtLines[level] && level < 9) {
          level = levelUp(level)
          levelDisplay.textContent = level
        }
        nextLevelDisplay.textContent = levelsAtLines[level] - linesCleared || '∞'
      })
      dropLockedLines(linesToRemove)
      move(boardSquares, activeBlock)
    }
  }

  function checkForGameOver() {
    if(activeBlock.indexesOccupied.some(index => index < 0)) {
      return true
    }
    return false
  }

  function lockBlock(block) {
    if(checkForGameOver()) {
      gameOver()
    } else {
      block.indexesOccupied.forEach(index => {
        boardSquares[index].classList.remove('has-active-block')
        boardSquares[index].classList.add('locked', this.styleClass)
        boardSquares[index].setAttribute('data-style-class', this.styleClass)
      })
      // !!! The need to use active block here is possibly another argument to bring these functions out fo the blocks
      activeBlock = generateBlock(width / 2)
      // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned
      if(activeBlock instanceof IBlock) {
        activeBlock.homeInext - width
      }
      move(boardSquares, activeBlock)
    }
  }
  /// !!! Turn conditional logic into it's own function
  // !!! Change Name
  function asLowAsCanGo(block) {
    return block
      .indexesOccupied
      .some(index => {
        const nextLineIndex = index + width
        if (nextLineIndex > boardSquares.length - 1) {
          return true
        } else if (nextLineIndex >= 0 && boardSquares[nextLineIndex].classList.contains('locked'))
          return true
      })
  }
  function dropBlocks() {
    if (asLowAsCanGo(activeBlock)) {
      lockBlock(activeBlock)
      clearFullLines()
    } else {
      move(boardSquares, activeBlock, 'down')
    }
  }
  function fastDropBlock() {
    score ++
    scoreDisplay.textContent = score
    dropBlocks()
  }
  function endGame() {
    activeBlock = null
    clearInterval(dropInterval)
    boardSquares.forEach(square => {
      square.className = 'board-square'
    })
  }

  function gameOver() {
    endGame()
    gameOverDisplay.style.display = ''
    gameOverScoreDisplay.textContent = score
    gameOverLevelDisplay.textContent = level
    gameOverLinesClearedDisplay.textContent = linesCleared
  }

  function startGame() {
    if(!activeBlock) {
      activeBlock = generateBlock(width / 2)
      // !!! This is only ness becuase you've chosen the starting co-ords for it's rotations unwisely. It's probably best to cylce them so that 2 is 0. This will require you to change the logic on the rotation blocking function. Be Warned
      if(activeBlock instanceof IBlock) {
        activeBlock.homeInext - width
      }
      score = 0
      scoreDisplay.textContent = 0
      dropInterval = setInterval(dropBlocks, 500)
      level = 1
      levelDisplay.textContent = level
      linesCleared = 0
      linesClearedDisplay.textContent = linesCleared
      nextLevelDisplay.textContent = 5
      gameOverDisplay.style.display = 'none'
    }
  }

  function toggleStartReset() {
    if (gameOverDisplay.style.display === 'none') {
      if (startResetButton.textContent === 'Start') {
        startGame()
        startResetButton.textContent = 'Reset'
      } else {
        endGame()
        startResetButton.textContent = 'Start'
      }
    }
  }

  startResetButton.addEventListener('click', toggleStartReset)
  playAgainButton.addEventListener('click', startGame)
  document.addEventListener('keydown', (e) => {
    if(activeBlock) {
      switch(e.keyCode) {
        case 37:
          move(boardSquares, activeBlock, 'left')
          break
        case 39:
          move(boardSquares, activeBlock, 'right')
          break
        case 40:
          fastDropBlock()
          break
        case 38:
          activeBlock.rotate()
          break
      }
    }
  })
})
