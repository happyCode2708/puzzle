import { PuzzlingBoard } from './PuzzlingBoard';
import { Match3Piece } from './Match3Piece';
import {
  Match3Position,
  match3GetPieceType,
  match3CloneGrid,
  match3SwapPieces,
  match3GetMatches,
} from './Match3Utility';

import * as _ from 'lodash';

/** Interface for actions configuration */
interface Match3ActionsConfig {
  freeMoves: boolean;
}

/**
 * These are the actions player can take: move pieces (swap) or tap if they are special.
 * Action effects happens instantly, and the game will deal with whatever state the grid ends up with.
 */
export class Match3Actions {
  /** The match3 instance */
  public puzzlingBoard: PuzzlingBoard;

  /** Free all moves, meaning that they will always be valid regardles of matching results */
  public freeMoves = false;

  constructor(puzzlingBoard: PuzzlingBoard) {
    this.puzzlingBoard = puzzlingBoard;
  }

  /**
   * Set up actions with given configuration
   * @param config Actions config params
   */
  public setup(config: Match3ActionsConfig) {
    this.freeMoves = config.freeMoves;
  }

  /**
   * Basic move action that swap two pieces in the grid. Can be disallowed and reverted if
   * the move does not involve special pieces neither create any new matches, unless free moves
   * is enabled.
   * @param from The origin grid position of the move
   * @param to The destination grid position of the move
   */
  public async actionMove(from: Match3Position, to: Match3Position) {
    if (!this.puzzlingBoard.isPlaying()) return;

    // Check if there are pieces on each of the 2 positions, and if they are not locked
    const pieceA = this.puzzlingBoard.board.getPieceByPosition(from);
    const pieceB = this.puzzlingBoard.board.getPieceByPosition(to);

    if (!pieceA || !pieceB || pieceA.isLock() || pieceB.isLock()) return;

    // Check the grid types currently involved in the move
    const typeA = this.puzzlingBoard.board.getTypeByPosition(from);
    const typeB = this.puzzlingBoard.board.getTypeByPosition(to);

    if (!typeA || !typeB) return;

    // Execute the pieces swap - might be reverted if invalid
    await this.swapPieces(pieceA, pieceB);
    // this.match3.process.start();
  }

  /**
   * Tap action only allowed for special pieces, triggering their effects in place
   * @param position The grid position of the action
   */
  public async actionTap(position: Match3Position) {
    if (!this.puzzlingBoard.isPlaying()) return;

    // Check the piece and type in the touched grid position
    const piece = this.puzzlingBoard.board.getPieceByPosition(position);
    const type = this.puzzlingBoard.board.getTypeByPosition(position);
    if (!piece || !this.puzzlingBoard.special.isSpecial(type) || piece.isLock())
      return;

    // Execute the tap action, popping the piece out which will trigger its special effects
    await this.puzzlingBoard.board.popPiece(piece);
    this.puzzlingBoard.process.start();
  }

  /** Check if a move from origin to destination is valid */
  private validateMove(from: Match3Position, to: Match3Position) {
    // If free moves is on, all moves are valid
    if (this.freeMoves) return true;
    //? remove old stupid code
    // const type = match3GetPieceType(this.match3.board.pieceGrid, from);

    const type = this.puzzlingBoard.board.getTypeByPosition(from);
    const specialFrom = this.puzzlingBoard.special.isSpecial(type);
    const specialTo = this.puzzlingBoard.special.isSpecial(
      match3GetPieceType(this.puzzlingBoard.board.pieceGrid, to)
    );

    // Always allow move that either or both are special pieces
    if (specialFrom || specialTo) return true;

    // Clone current grid so we can manipulate it safely
    const tempGrid = _.cloneDeep(this.puzzlingBoard.board.pieceGrid);

    // Swap pieces in the temporary cloned grid

    const typeA = this.puzzlingBoard.board.getTypeByPosition(from);
    const typeB = this.puzzlingBoard.board.getTypeByPosition(to);

    if (typeA !== undefined && typeB !== undefined) {
      tempGrid[from.row][from.column] = typeB;
      tempGrid[to.row][to.column] = typeA;
      //   this.puzzlingBoard.board.setTypeByPosition(from, typeB);
      //   this.puzzlingBoard.board.setTypeByPosition(to, typeA);
    }

    // Get all matches created by this move in the temporary grid
    const newMatches = match3GetMatches(tempGrid, [from, to]);

    // Only validate moves that creates new matches
    return newMatches.length >= 1;
  }

  /** Attempt to swap two pieces positions in the board, and revert the movement if disallowed */
  private async swapPieces(pieceA: Match3Piece, pieceB: Match3Piece) {
    // Get grid positions from pieces
    const positionA = pieceA.getRowCol();
    const positionB = pieceB.getRowCol();
    console.log('[Match3] Swap', positionA, positionB);

    // Find out view positions based on grid positions
    const viewPositionA =
      this.puzzlingBoard.board.getViewPositionByGridPosition(positionA);
    const viewPositionB =
      this.puzzlingBoard.board.getViewPositionByGridPosition(positionB);

    // Validate move if that creates any matches or if free moves is enabled
    const valid = this.validateMove(positionA, positionB);

    // Fire the callback, even if the move is invalid
    this.puzzlingBoard.onMove?.({
      from: positionA,
      to: positionB,
      valid,
    });

    // this.puzzlingBoard.stopInteractChildren();
    await Promise.all([
      pieceA.animateMove({
        to: { x: viewPositionB.x, y: viewPositionB.y },
        newGridPosition: positionB,
      }),
      pieceB.animateMove({
        to: { x: viewPositionA.x, y: viewPositionA.y },
        newGridPosition: positionA,
      }),
    ]);

    if (!valid) {
      await Promise.all([
        pieceA.animateMove({
          to: { x: viewPositionA.x, y: viewPositionA.y },
          newGridPosition: positionA,
        }),
        pieceB.animateMove({
          to: { x: viewPositionB.x, y: viewPositionB.y },
          newGridPosition: positionB,
        }),
      ]);
    }

    if (valid) {
      const typeA = this.puzzlingBoard.board.getTypeByPosition(positionA);
      const typeB = this.puzzlingBoard.board.getTypeByPosition(positionB);
      this.puzzlingBoard.board.setTypeByPosition(positionA, typeB);
      this.puzzlingBoard.board.setTypeByPosition(positionB, typeA);
      this.puzzlingBoard.process.start();
    }

    // Animate pieces to their new positions
    // this.match3.board.bringToFront(pieceA);
    // await Promise.all([
    //   pieceA.animateSwap(viewPositionB.x, viewPositionB.y),
    //   pieceB.animateSwap(viewPositionA.x, viewPositionA.y),
    // ]);

    // if (!valid) {
    //   // Revert pieces to their original position if move is not valid
    //   const viewPositionA =
    //     this.match3.board.getViewPositionByGridPosition(positionA);
    //   const viewPositionB =
    //     this.match3.board.getViewPositionByGridPosition(positionB);
    //   this.match3.board.bringToFront(pieceB);
    //   await Promise.all([
    //     pieceA.animateSwap(viewPositionA.x, viewPositionA.y),
    //     pieceB.animateSwap(viewPositionB.x, viewPositionB.y),
    //   ]);
    // } else if (
    //   this.match3.special.isSpecial(
    //     match3GetPieceType(this.match3.board.pieceGrid, positionA)
    //   )
    // ) {
    //   // Pop piece A if is special
    //   await this.match3.board.popPiece(positionA);
    // } else if (
    //   this.match3.special.isSpecial(
    //     match3GetPieceType(this.match3.board.pieceGrid, positionB)
    //   )
    // ) {
    //   // Pop piece B if is special
    //   await this.match3.board.popPiece(positionB);
    // }
  }
}
