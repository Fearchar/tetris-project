// #### Constructors ####

class Block {
  constructor(homeIndex, possibleRotations) {
    this.homeIndex = homeIndex
    this.rotationIndex = 0
    this.rotations = possibleRotations
  }
  get indexesOccupied() {
    return this.calculateBlockIndexes(this.rotationIndex, this.homeIndex)
  }
  calculateBlockIndexes(rotationIndex, homeIndex) {
    return this.rotations[rotationIndex].map(index => index + homeIndex)
  }
  updateHome(direction) {
    let newHomeIndex = this.homeIndex
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
  canBlockMove(boardSquares, direction, index) {
    if (
      (index >= 0 &&
      boardSquares[index].classList.contains('locked')) ||
      (checkIfMovingIntoWall(direction, index))
    ) return true
    else return false
  }
  asLowAsCanGo(boardSquares) {
    return this
      .indexesOccupied
      .some(index => {
        const nextLineIndex = index + width
        if (nextLineIndex > boardSquares.length - 1) {
          return true
        } else if (nextLineIndex >= 0 && boardSquares[nextLineIndex].classList.contains('locked')) {
          return true
        }
      })
  }
  copyBlock(block) {
    return new (blockConstructors.find(constructor => block instanceof constructor))()
  }
  generateProjection(block) {
    const projectionBlock = this.copyBlock(block)
    projectionBlock.homeIndex = block.homeIndex
    projectionBlock.rotationIndex = block.rotationIndex
    projectionBlock.styleClass = 'board-square'
    return projectionBlock
  }
  projectDrop(boardSquares, block) {
    const projectionBlock = this.generateProjection(block)
    for (let i = 0; i < height - 1 && !projectionBlock.asLowAsCanGo(boardSquares); i ++) {
      projectionBlock.move(boardSquares, projectionBlock, 'down', false, true)
    }
    clearBlocks(boardSquares, 'has-projection')
    projectionBlock.indexesOccupied.forEach(index => {
      if (index >= 0) boardSquares[index].classList.add('has-projection', projectionBlock.projectionStyleClass)
    })
  }
  move(boardSquares, block, direction, clear=true, calledByDropP=false) {
    const newHomeIndex = this.newHomeIfCanMove(boardSquares, block, direction)
    if (newHomeIndex) {
      if (clear) clearBlocks(boardSquares, 'has-active-block')
      block.homeIndex = newHomeIndex
      block.indexesOccupied.forEach(index => {
        if (index >= 0 && !calledByDropP) {
          boardSquares[index].classList.add('has-active-block', block.styleClass)
        }
      })
    }
    if (!calledByDropP) this.projectDrop(boardSquares, block)
  }
  newHomeIfCanMove(boardSquares, block, direction) {
    const potentialHomeIndex = this.updateHome(direction)
    const indexesToOccupy = this.calculateBlockIndexes(block.rotationIndex, potentialHomeIndex)
    return !indexesToOccupy.some(index => {
      return this.canBlockMove(boardSquares, direction, index)
    }) ? potentialHomeIndex : false
  }
  rotatingIntoWall(indexesToOccupy) {
    let atLeftWall
    let atRightWall
    for (const squareIndex of indexesToOccupy) {
      if (squareIndex % width === 0) {
        atLeftWall = squareIndex
      } else if (squareIndex % width === width - 1) {
        atRightWall = squareIndex
      }
    }
    return !atLeftWall || !atRightWall
  }
  correctPlacement(block, direction, amount=1) {
    if (direction === 'right') {
      return block.homeIndex + amount
    } else if (direction === 'left') {
      return block.homeIndex - amount
    }
  }
  wallRotationCorrections(block, indexesToOccupy, newRotationIndex) {
    let newHomeIndex = block.homeIndex
    if (!this.rotatingIntoWall(indexesToOccupy)) {
      if (!(block instanceof IBlock)) {
        if (block.homeIndex % width === 0) {
          newHomeIndex = this.correctPlacement(block, 'right')
        } else {
          newHomeIndex = this.correctPlacement(block, 'left')
        }
      } else {
        if (newRotationIndex === 2 && block.homeIndex % width === 0) {
          newHomeIndex = this.correctPlacement(block, 'right')
        } else if (newRotationIndex === 2) {
          newHomeIndex = this.correctPlacement(block, 'left', 2)
        } else if (newRotationIndex === 0 && block.homeIndex % width === width - 1) {
          newHomeIndex = this.correctPlacement(block, 'right', 2)
        } else {
          newHomeIndex = this.correctPlacement(block, 'left')
        }
        indexesToOccupy = this.calculateBlockIndexes(newRotationIndex, newHomeIndex)
      }
    }
    return {newHomeIndex: newHomeIndex, indexesToOccupy: indexesToOccupy}
  }
  canBlockRotate(boardSquares, indexesToOccupy) {
    for (const index of indexesToOccupy) {
      if (
        index >= boardSquares.length  ||
        (index >= 0 &&
        boardSquares[index].classList.contains('locked'))
      ) {
        return false
      }
    }
    return true
  }
  newPositionIfCanRotate(boardSquares, block) {
    const newRotationIndex = (block.rotationIndex + 1) % 4
    let indexesToOccupy = this.calculateBlockIndexes(newRotationIndex, block.homeIndex)
    let newHomeIndex = block.homeIndex
    const corrections = this.wallRotationCorrections(block, indexesToOccupy, newRotationIndex)
    newHomeIndex = corrections.newHomeIndex
    indexesToOccupy = corrections.indexesToOccupy
    if (!this.canBlockRotate(boardSquares, indexesToOccupy)) return false
    block.homeIndex = newHomeIndex
    this.move(boardSquares, block)
    clearBlocks(boardSquares, 'has-active-block')
    block.rotationIndex = newRotationIndex
    return true
  }
  rotate(boardSquares) {
    if (this.newPositionIfCanRotate(boardSquares, this)) {
      this.indexesOccupied.forEach(index => {
        if (index >= 0) boardSquares[index].classList.add('has-active-block', this.styleClass)
      })
    }
    this.projectDrop(boardSquares, this)
  }
}

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
  rotate(boardSquares) {
    this.projectDrop(boardSquares, this)
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

/// #### Global Variables ####

const width = 10
const height = 20
let dropInterval = null
let activeBlock = null
let shuffledBlocks = []
let score = 0
let linesCleared = 0
let level = 1
const levelsAtLines = [1, 5, 10, 15, 25, 35, 50, 70, 100]
const blockConstructors = [TBlock, IBlock, JBlock, LBlock, SBlock, ZBlock, OBlock]

// #### Global Functions ###

function buildBoard(boardSelector) {
  const boardSquares = []
  for (var i = 0; i < width * height; i++) {
    const square = document.createElement('div')
    square.className = 'board-square'
    boardSelector.appendChild(square)
    boardSquares.push(square)
  }
  return boardSquares
}

function clearBlocks(squares, blockStyleClass){
  squares.forEach(square => {
    if (
      blockStyleClass === 'has-active-block' &&
      square.classList.contains('has-active-block')
    ) square.className = 'board-square'
    else if (
      blockStyleClass === 'has-active-block' &&
      square.classList.contains('has-projection')
    ) {
      square.classList.remove(
        'has-projection',
        'i-projection',
        'j-projection',
        'l-projection',
        'o-projection',
        's-projection',
        't-projection',
        'z-projection'
      )
    } else if (
      blockStyleClass === 'next-display-square'
    ) {
      square.className = 'next-display-square'
    }
  })
}

// !!! ### Bringing into Block class below ###

function checkIfMovingIntoWall(direction, squareIndex) {
  if (
    (squareIndex + width) % width === width - 1 && direction === 'left' ||
    squareIndex % width === 0 && direction === 'right'
  ) {
    return true
  }
  return false
}

function shuffleBlocks(blockConstructors) {
  const blockSequence = blockConstructors.slice(0)
  let currentIndex = blockSequence.length
  let temporaryValue
  let randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = blockSequence[currentIndex]
    blockSequence[currentIndex] = blockSequence[randomIndex]
    blockSequence[randomIndex] = temporaryValue
  }
  return blockSequence
}

function queueBlocks(queuedBlocks) {
  queuedBlocks.forEach((queueBoard, i) => {
    queueBoard.forEach(square => {
      square.className = 'next-display-square'
    })
    const block = new shuffledBlocks[i](5, 4)
    block.indexesOccupied.forEach(index => {
      queueBoard[index].classList.add(block.styleClass)
    })
  })
}

function generateBlock(queuedBlocks, homeIndex) {
  if (shuffledBlocks.length <= 3) {
    shuffledBlocks = [...shuffledBlocks, ...shuffleBlocks(blockConstructors)]
  }
  const nextBlock = shuffledBlocks.shift()
  queueBlocks(queuedBlocks)
  return new nextBlock(homeIndex)
}

function checkForCompleteLines(boardSquares) {
  const linesToRemove = []
  const numberOfLines = boardSquares.length / width
  for (var i = numberOfLines - 1; i >= 0; i--) {
    if(boardSquares.slice(i * width, (i * width) + width).every(square => {
      return square.classList.contains('locked')
    })) linesToRemove.push(i)
  }
  return linesToRemove[0] ? linesToRemove : false
}

function dropLockedLines(boardSquares, removedLines) {
  removedLines.forEach((line, i) => {
    for (let j = ((line + i) * width) - 1 ; j >= 0; j--) {
      const square = boardSquares[j]
      const newSquare = boardSquares[j + width]
      newSquare.className = square.className
      square.className = 'board-square'
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {

  // #### DOM Dependant Variables ####

  const board = document.querySelector('.game-board')
  const boardSquares = buildBoard(board)
  const scoreDisplay = document.querySelector('#score-display')
  const levelDisplay = document.querySelector('#level-display')
  const linesClearedDisplay = document.querySelector('#lines-cleared-display')
  const nextLevelDisplay = document.querySelector('#next-level-display')
  const startResetButton = document.querySelector('#start-reset')
  const gameOverDisplay = document.querySelector('#game-over-display')
  const gameOverScoreDisplay = document.querySelector('#game-over-score-display')
  const gameOverLevelDisplay = document.querySelector('#game-over-level-display')
  const gameOverLinesClearedDisplay = document.querySelector('#game-over-lines-cleared-display')
  const playAgainButton = document.querySelector('#play-again')
  const queuedBlocks = [
    Array.from(document.querySelectorAll('.queued-board:nth-child(1) div')),
    Array.from(document.querySelectorAll('.queued-board:nth-child(2) div')),
    Array.from(document.querySelectorAll('.queued-board:nth-child(3) div'))
  ]

  // #### DOM Dependant Functions ####

  function levelUp(currentLevel) {
    clearInterval(dropInterval)
    dropInterval = setInterval(dropBlock, 500 - (currentLevel * 60))
    return currentLevel + 1
  }

  function clearFullLines(boardSquares, block) {
    const linesToRemove = checkForCompleteLines(boardSquares)
    if (linesToRemove) {
      linesToRemove.forEach(line => {
        for (var i = 0; i < width; i++) {
          boardSquares[(line * width) + i].className = 'board-square'
        }
      })
      dropLockedLines(boardSquares, linesToRemove)
      block.move(boardSquares, block)
    }
    return linesToRemove.length
  }

  function checkForGameOver(block) {
    if(block.indexesOccupied.some(index => index < 0)) {
      return true
    }
    return false
  }

  function lockBlock(block) {
    block.indexesOccupied.forEach(index => {
      boardSquares[index].classList.remove('has-active-block')
      boardSquares[index].classList.add('locked', this.styleClass)
      boardSquares[index].setAttribute('data-style-class', this.styleClass)
    })
  }

  function startBlockFall(boardSquares) {
    activeBlock = generateBlock(queuedBlocks, width / 2)
    if(activeBlock instanceof IBlock) {
      activeBlock.homeInext - width
      activeBlock.move(boardSquares, activeBlock, 'left')
    }
    activeBlock.move(boardSquares, activeBlock)
  }

  function scoreLines(lines) {
    score += 10 * lines
    scoreDisplay.textContent = score
    linesCleared += lines
    linesClearedDisplay.textContent = linesCleared
    if (linesCleared >= levelsAtLines[level] && level < 9) {
      level = levelUp(level)
      levelDisplay.textContent = level
    }
    nextLevelDisplay.textContent = levelsAtLines[level] - linesCleared || '∞'
  }

  function dropBlock() {
    if (activeBlock.asLowAsCanGo(boardSquares, activeBlock)) {
      if (checkForGameOver(activeBlock)) {
        gameOver()
      } else {
        lockBlock(activeBlock)
        const numberOfClearedLines = clearFullLines(boardSquares, activeBlock)
        if (numberOfClearedLines > 0) scoreLines(numberOfClearedLines)
        startBlockFall(boardSquares)
      }
    } else {
      activeBlock.move(boardSquares, activeBlock, 'down')
    }
  }
  function fastDropBlock() {
    score ++
    scoreDisplay.textContent = score
    dropBlock()
  }
  function endGame() {
    activeBlock = null
    shuffledBlocks = []
    clearInterval(dropInterval)
    boardSquares.forEach(square => {
      square.className = 'board-square'
    })
    clearBlocks([...queuedBlocks[0], ...queuedBlocks[1], ...queuedBlocks[2]], 'next-display-square')
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
      startBlockFall(boardSquares)
      score = 0
      scoreDisplay.textContent = 0
      dropInterval = setInterval(dropBlock, 500)
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

  function handleKeyInput(e) {
    if(activeBlock) {
      switch(e.keyCode) {
        case 37:
          activeBlock.move(boardSquares, activeBlock, 'left')
          break
        case 39:
          activeBlock.move(boardSquares, activeBlock, 'right')
          break
        case 40:
          fastDropBlock()
          break
        case 38:
          activeBlock.rotate(boardSquares)
          break
      }
    }
  }

  // #### Event Listeners ####

  startResetButton.addEventListener('click', toggleStartReset)
  playAgainButton.addEventListener('click', startGame)
  document.addEventListener('keydown', handleKeyInput)
})
