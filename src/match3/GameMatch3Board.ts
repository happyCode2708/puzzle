import * as PIXI from 'pixi.js';
// import { Match3 } from '../match3.ts';
import { Match3Config } from './Match3Config.ts';
import { Match3Grid } from './type.ts';
import { getAllBlockTypesInGame } from './Match3Config.ts';
import { match3CreateGrid, match3ForEach } from './Match3Utility.ts';
import { pool } from '../utils/pool';
import { Match3Piece } from './Match3Piece.ts';
import { PuzzlingBoard } from './PuzzlingBoard.ts';

// import { findAllMatchedsByDirection } from './Match3Utility.ts';

import * as _ from 'lodash';
import {
  Match3Position,
  match3SetPieceType,
  // match3GetPieceType,
  // match3CreateGrid,
  // match3ForEach,
  // Match3Grid,
  Match3Type,
} from './Match3Utility';

export class GameMatch3Board extends PIXI.Container {
  public puzzlingBoard: PuzzlingBoard;

  public rows: number = 0;
  public columns: number = 0;
  public tileSize: number = 0;

  public pieces: Match3Piece[] = [];

  public boardContainer: PIXI.Container;

  public pieceGrid: Match3Grid = [];
  public commonTypes: number[] = [];
  public specialTypes: number[] = [];
  public pieceTypes: number[] = [];
  private pieceTypeNames: string[] = [];

  // public popPieces: void;
  // public gameBlockTypes:

  constructor(match3: PuzzlingBoard) {
    super();

    this.puzzlingBoard = match3;
    this.boardContainer = new PIXI.Container();
    this.puzzlingBoard.addChild(this.boardContainer);
    // this.popPieces = this.popPieces.bind(this);
  }

  public setup(boardConfig: Match3Config) {
    const { rows, columns, tileSize, mode } = boardConfig;

    this.rows = rows;
    this.columns = columns;
    this.tileSize = tileSize;
    // this.pieceGrid = d

    const gameBlockTypeDefine = getAllBlockTypesInGame(mode);
    this.pieceTypeNames = _.concat(
      gameBlockTypeDefine.common,
      gameBlockTypeDefine.special
    );

    this.commonTypes = gameBlockTypeDefine.common.map(
      (blockTypeName, index) => {
        return index + 1;
      }
    );

    this.specialTypes = gameBlockTypeDefine.common.map(
      (blockTypeName, index) => {
        return this.commonTypes.length + index;
      }
    );

    //? add special handler to the board
    // gameBlockTypeDefine.special.forEach(blockTypeName => {
    //   this.match3.spe
    // })

    this.pieceGrid = match3CreateGrid(
      this.rows,
      this.columns,
      this.commonTypes
    );

    this.createPiecesMatrix();
    this.setBoardContainerPosition();
  }

  public createPiecesMatrix() {
    for (let r = 0; r < this.pieceGrid.length; r++) {
      for (let c = 0; c < this.pieceGrid[r].length; c++) {
        const typeIndex = this.pieceGrid[r][c];
        this.createPiece({ row: r, column: c }, typeIndex);
      }
    }
  }

  public createPiece(position: Match3Position, pieceTypeIndex: Match3Type) {
    const { row, column } = position;

    const name = this.pieceTypeNames[pieceTypeIndex - 1];

    const piece = pool.get(Match3Piece);
    const viewPosition = this.getViewPositionByGridPosition(position);
    // piece.onMove = (from, to) => this.match3.actions.actionMove(from, to);
    // piece.onTap = (position) => this.match3.actions.actionTap(position);

    piece.setup({
      name,
      type: pieceTypeIndex,
      size: this.tileSize,
      interactive: true,
      highlight: this.puzzlingBoard.special.isSpecial(pieceTypeIndex),
      row,
      column,
      puzzlingBoard: this.puzzlingBoard,
    });
    piece.x = viewPosition.x;
    piece.y = viewPosition.y;
    this.pieces.push(piece);
    this.boardContainer.addChild(piece);
    return piece;
  }

  //* set the board position to game container
  private setBoardContainerPosition = () => {
    const offsetX = (this.columns * this.tileSize) / 2;
    const offetY = (this.rows * this.tileSize) / 2;
    const pieceOffset = this.tileSize / 2;

    this.boardContainer.x = this.boardContainer.x - offsetX + pieceOffset;
    this.boardContainer.y = this.boardContainer.y - offetY + pieceOffset;
  };

  public reset() {
    this.boardContainer.x = this.boardContainer.width;
  }

  public getPieceByPosition(position: Match3Position) {
    for (const piece of this.pieces) {
      if (piece.row === position.row && piece.column === position.column) {
        return piece;
      }
    }
    return null;
  }

  /**
   *? get the poisiton by grid col and column
   * Conver grid position (row & column) to view position (x & y)
   * @param position The grid position to be converted
   * @returns The equivalet x & y position in the board
   */
  public getViewPositionByGridPosition(position: Match3Position) {
    const { column, row } = position;
    return { x: column * this.tileSize, y: row * this.tileSize };
  }

  public getTypeByPosition = (position: Match3Position) => {
    const { row, column } = position;
    return this.pieceGrid?.[row]?.[column];
  };

  public setTypeByPosition = (position: Match3Position, type) => {
    const { row, column } = position;
    this.pieceGrid[row][column] = type;
  };

  //! origin
  /** Bring a piece in front of all others */
  public bringToFront(piece: Match3Piece) {
    this.boardContainer.addChild(piece);
  }

  /**
   * Pop a piece out of the board, triggering its effects if it is a special piece
   * @param position The grid position of the piece to be popped out
   * @param causedBySpecial If the pop was caused by special effect
   */
  public async popPiece(position: Match3Position, causedBySpecial = false) {
    const piece = this.getPieceByPosition(position);
    // const type = match3GetPieceType(this.grid, position);
    const type = this.getTypeByPosition(position);
    if (!type || !piece) return;
    const isSpecial = this.puzzlingBoard.special.isSpecial(type);
    const combo = this.puzzlingBoard.process.getProcessRound();

    // Set piece position in the grid to 0 and pop it out of the board
    match3SetPieceType(this.pieceGrid, position, 0);
    const popData = { piece, type, combo, isSpecial, causedBySpecial };
    this.puzzlingBoard.stats.registerPop(popData);
    this.puzzlingBoard.onPop?.(popData);
    if (this.pieces.includes(piece)) {
      this.pieces.splice(this.pieces.indexOf(piece), 1);
    }
    await piece.animatePop();
    this.disposePiece(piece);

    // Trigger any specials related to this piece, if there is any
    // await this.match3.special.trigger(type, position);
  }

  /**
   * Pop a list of pieces all together
   * @param positions List of positions to be popped out
   * @param causedBySpecial If this was caused by special effects
   */
  public popPieces = async (
    positions: Match3Position[],
    causedBySpecial = false
  ) => {
    const animPromises = [];
    for (const position of positions) {
      animPromises.push(this.popPiece(position, causedBySpecial));
    }
    await Promise.all(animPromises);
  };

  // public resume() {
  //   for (const piece of this.pieces) piece.resume();
  // }

  // public findAllMactchedByDirection = (
  //   matchSize: number,
  //   direction: 'horizontal' | 'vertical'
  // ) => {
  //   return

  /**
   * Dispose a piece, remving it from the board
   * @param piece Piece to be removed
   */
  public disposePiece(piece: Match3Piece) {
    if (this.pieces.includes(piece)) {
      this.pieces.splice(this.pieces.indexOf(piece), 1);
    }
    if (piece.parent) {
      piece.parent.removeChild(piece);
    }
    // pool.giveBack(piece);
  }
}
