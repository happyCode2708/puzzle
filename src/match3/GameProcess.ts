import { AsyncQueue } from '../utils/asyncUtils';
import { PuzzlingBoard } from './PuzzlingBoard';
import { poolCtor } from '../utils/pool';
import {
  match3GetMatches,
  match3GetEmptyPositions,
  match3ApplyGravity,
  match3FillUp,
  match3GetPieceType,
  match3GridToString,
} from './Match3Utility';
import {
  getChangesInPositionToApplyGravity,
  fillToEmptySpaceOnPieceGrid,
  match3GetRandomType,
} from './Utils';
import { earthquake } from '../utils/animation';
import { GameScreen } from '../screens/GameScreen';
import { GameEffects } from '../ui/GameEffects.ts';

/**
 * Sort out the gameplay progression on the board after a player action, clearing matches
 * then filling up empty spaces. The process is organised in 'process rounds' that will keep
 * going until there are no new matches neither empty spaces left in the grid.
 *
 * The process round steps are sequenced in a queue of async functions to keep things simple,
 * in a way each step can be awaited/delayed as needed acording to what makes sense to the game flow.
 */
export class GameProcess {
  /** The Match3 instance */
  private puzzlingBoard: PuzzlingBoard;
  /** Tells if it is currently processing or not */
  private processing = false;
  /** The subsequent process round, resets when process starts */
  private round = 0;
  /** The list of queued actions that the grid processing will take */
  private queue: AsyncQueue;

  constructor(puzzlingBoard: PuzzlingBoard) {
    this.puzzlingBoard = puzzlingBoard;
    this.queue = new AsyncQueue();
  }

  /** Check if is processing */
  public isProcessing() {
    return this.processing;
  }

  /** Get current process round */
  public getProcessRound() {
    return this.round;
  }

  /** Interrupt processing and cleanup process queue */
  public reset() {
    this.processing = false;
    this.round = 0;
    this.queue.clear();
  }

  /** Pause processing */
  public pause() {
    this.queue.pause();
  }

  /** Resume processing */
  public resume() {
    this.queue.resume();
  }

  /** Start processing the grid until there are no new matches or empty spaces left */
  public async start() {
    if (this.processing || !this.puzzlingBoard.isPlaying()) return;
    this.processing = true;
    this.round = 0;
    this.puzzlingBoard.onProcessStart?.();
    console.log('[Match3] ======= PROCESSING START ==========');
    this.runProcessRound();
  }

  /** Clear process query and stop processing the grid */
  public async stopProcess() {
    if (!this.processing) return;
    this.processing = false;
    this.queue.clear();
    console.log('[Match3] Sequence rounds:', this.round);
    console.log(
      '[Match3] Board pieces:',
      this.puzzlingBoard.board.pieces.length
    );
    console.log(
      '[Match3] Grid:\n' +
        match3GridToString(this.puzzlingBoard.board.pieceGrid)
    );
    console.log('[Match3] ======= PROCESSING COMPLETE =======');
    this.puzzlingBoard.onProcessComplete?.();
    this.puzzlingBoard.continueInteractChildren();
  }

  private onStartProcess() {
    this.puzzlingBoard.stopInteractChildren();
    this.puzzlingBoard.game.puzzlingBoardOnMatched(this.round);
  }

  /**
   * Sequence of logical steps to evolve the board, added to the async queue. Each step can
   * be awaited/delayed as needed in oder to create a nice gameplay progress flow.
   */
  private async runProcessRound() {
    this.queue.add(async () => {
      this.onStartProcess();
    });

    // Step #1 - Bump sequence number and update stats with new matches found
    this.queue.add(async () => {
      this.round += 1;
      console.log(`[Match3] -- SEQUENCE ROUND #${this.round} START`);
      this.updateStats();
    });

    // Step #2 - Process and clear all special matches
    // this.queue.add(async () => {
    //   await this.processSpecialMatches();
    // });

    // Step #3 - Process and clear remaining common matches
    this.queue.add(async () => {
      await this.processRegularMatches();
    });

    // Step #4 - Move down remaining pieces in the grid if there are empty spaces in their columns
    this.queue.add(async () => {
      //   No await here, to make it run simultaneously with grid refill
      await this.applyGravity();
    });

    // Step #5 - Create new pieces that falls from the to to fill up remaining empty spaces
    this.queue.add(async () => {
      await this.refillGrid();
    });

    // Step #6 - Finish up this sequence roundqueudsa and check if it needs a re-run, otherwise stop processing
    this.queue.add(async () => {
      console.log(`[Match3] -- SEQUENCE ROUND #${this.round} FINISH`);
      this.processCheckpoint();
    });

    // this.queue.add(async () => {
    //   // console.log(`ga[Match3] -- SEQUENCE ROUND #${this.round} FINISH`);
    //   // this.processCheckpoint();
    //   this.stop();
    // });
  }

  /** Update gameplay stats with new matches found in the grid */
  private async updateStats() {
    const matches = match3GetMatches(this.puzzlingBoard.board.pieceGrid);
    if (!matches.length) return;
    console.log('[Match3] Update stats');
    // const matchData = { matches, combo: this.getProcessRound() };
    // this.puzzlingBoard.stats.registerMatch(matchData);
    // this.puzzlingBoard.onMatch?.(matchData);
  }

  /** Sort out special matches in the grid */
  private async processSpecialMatches() {
    console.log('[Match3] Process special matches');
    await this.puzzlingBoard.special.process();
  }

  /** Clear all matches in the grid */
  private async processRegularMatches() {
    console.log('[Match3] Process regular matches');
    const matches = match3GetMatches(this.puzzlingBoard.board.pieceGrid);
    const animPromises = [];
    for (const match of matches) {
      animPromises.push(this.puzzlingBoard.board.popPieces(match));
    }
    await Promise.all(animPromises);
  }

  private async applyGravity() {
    const animatePromises = [];
    const positionChangedArray = getChangesInPositionToApplyGravity(
      this.puzzlingBoard
    );

    for (const positionChange of positionChangedArray) {
      const [from, to] = positionChange;
      const piece = this.puzzlingBoard.board.getPieceByPosition(from);
      if (!piece) continue;
      piece.row = to.row;
      piece.column = to.column;
      const newPosition =
        this.puzzlingBoard.board.getViewPositionByGridPosition(to);
      animatePromises.push(() => piece.animateFall(newPosition));
    }

    await Promise.all(animatePromises.map((run) => run()));
  }

  /** Check the grid if there are empty spaces and/or matches remaining, and run another process round if needed */
  private async processCheckpoint() {
    // Check if there are any remaining matches or empty spots
    const newMatches = match3GetMatches(this.puzzlingBoard.board.pieceGrid);
    const emptySpaces = match3GetEmptyPositions(
      this.puzzlingBoard.board.pieceGrid
    );
    console.log('[Match3] Checkpoint - New matches:', newMatches.length);
    console.log('[Match3] Checkpoint - Empty spaces:', emptySpaces.length);
    if (newMatches.length || emptySpaces.length) {
      console.log('[Match3] Checkpoint - Another sequence run is needed');
      // Run it again if there are any new matches or empty spaces in the grid
      this.runProcessRound();
    } else {
      console.log('[Match3] Checkpoint - Nothing left to do, all good');
      // Otherwise, finish the grid processing
      this.stopProcess();
    }
  }
  /** Fill up empty spaces in the grid with new pieces falling from the top */
  private async refillGrid() {
    const newPieces = fillToEmptySpaceOnPieceGrid(
      this.puzzlingBoard.board.pieceGrid,
      this.puzzlingBoard.board.commonTypes,
      this.puzzlingBoard.board.specialTypes
    );
    const animPromises = [];
    const piecesPerColumn: Record<number, number> = {};

    for (const position of newPieces) {
      const pieceType = match3GetPieceType(
        this.puzzlingBoard.board.pieceGrid,
        position
      );

      const piece = this.puzzlingBoard.board.createPiece(position, pieceType);

      // Count pieces per column so new pieces can be stacked up accordingly
      if (!piecesPerColumn[piece.column]) {
        piecesPerColumn[piece.column] = 0;
      }
      piecesPerColumn[piece.column] += 1;

      const x = piece.x;
      const y = piece.y;
      const columnCount = piecesPerColumn[piece.column];

      piece.y = -columnCount * this.puzzlingBoard.config.tileSize;
      animPromises.push(() => piece.animateFall({ x, y }));
    }

    await Promise.all(animPromises.map((ani) => ani()));
  }
}
