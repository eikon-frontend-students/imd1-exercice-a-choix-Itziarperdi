const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const difficultyButtons = document.querySelectorAll(".difficulty button");

let grid = Array(9).fill(null);
let currentPlayer = "X";
let difficulty = "easy"; // par défaut

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Initialisation du plateau
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }
}

// Gestion du clic joueur
function handleClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (grid[index] || checkWinner()) return;

  makeMove(index, "X");

  const winner = checkWinner();
  if (winner) return endGame(winner);

  // IA joue automatiquement après joueur
  setTimeout(() => {
    const aiIndex = getBestMove();
    if (aiIndex !== null) {
      makeMove(aiIndex, "O");
      const result = checkWinner();
      if (result) return endGame(result);
    }
  }, 300);
}

// Exécute un coup
function makeMove(index, player) {
  grid[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  if (cell) {
    cell.textContent = player;
    cell.classList.add("taken");
  }
  currentPlayer = player === "X" ? "O" : "X";
}

// Vérifie vainqueur
function checkWinner() {
  for (const [a, b, c] of winningCombinations) {
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }
  return grid.includes(null) ? null : "Egalité";
}

function launchConfetti() {
  const heart = confetti.shapeFromPath({
    path: "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z",
    matrix: [
      0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666,
      -5.533333333333333,
    ],
  });

  confetti({
    scalar: 2,
    spread: 180,
    particleCount: 30,
    origin: { y: -0.1 },
    startVelocity: -35,
    shapes: [heart],
    colors: ["#f93963", "#a10864", "#ee0b93"],
  });
}

// Lance les confettis si victoire
// Affiche le résultat
function endGame(result) {
  if (result === "X") {
    launchConfetti();
    statusText.textContent = "Vous avez gagné ! 🎉";
  } else if (result === "Egalité") {
    statusText.textContent = "Match nul !";
  } else {
    statusText.textContent = `${result.toLowerCase()} a gagné !`;
  }
}

// Reset du jeu
function resetGame() {
  grid = Array(9).fill(null);
  currentPlayer = "X";
  statusText.textContent = "x commence !";
  createBoard();
}

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.difficulty;

    // Mise à jour visuelle des boutons
    difficultyButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    resetGame();
  });
});

// IA : retourne meilleur coup selon difficulté
function getBestMove() {
  const emptyIndices = grid
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);

  if (difficulty === "easy") {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (difficulty === "medium") {
    // Gagne si possible
    for (let i of emptyIndices) {
      const temp = [...grid];
      temp[i] = "O";
      if (checkWinnerSimulated(temp) === "O") return i;
    }
    // Bloque X
    for (let i of emptyIndices) {
      const temp = [...grid];
      temp[i] = "X";
      if (checkWinnerSimulated(temp) === "X") return i;
    }
    // Sinon aléatoire
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Difficile : minimax
  const best = minimax(grid, "O");
  return best.index;
}

// Simule un gagnant
function checkWinnerSimulated(state) {
  for (const [a, b, c] of winningCombinations) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return state[a];
    }
  }
  return state.includes(null) ? null : "Egalité";
}

// Minimax pour difficulté "difficile"
function minimax(newGrid, player) {
  const empty = newGrid
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);

  const winner = checkWinnerSimulated(newGrid);
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (winner === "Egalité") return { score: 0 };

  const moves = [];

  for (let i of empty) {
    const move = { index: i };
    newGrid[i] = player;

    const result = minimax(newGrid, player === "O" ? "X" : "O");
    move.score = result.score;

    newGrid[i] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Init
resetBtn.addEventListener("click", resetGame);
createBoard();
