import { Container, FederatedPointerEvent, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
// import { Match3Position } from './Match3Utility';

import {
  resolveAndKillTweens,
  registerCustomEase,
  pauseTweens,
  resumeTweens,
} from '../utils/animation';
import { app } from '../pixiMain';
import { Match3Position } from './type';

import { Match3 } from './Match3';

/** Default piece options */
const defaultMatch3PieceOptions = {
  /** Piece name, must match one of the textures available */
  name: '',
  /** Attributed piece type in the grid */
  type: 0,
  /** Piece size - width & height - in pixel */
  size: 50,
  /** Set if the piece should be highlighted, like special types */
  highlight: false,
  /** Enable or disable its interactivity */
  interactive: false,

  row: 0,

  column: 0,
};

/** Piece configuration parameters */
export type Match3PieceOptions = typeof defaultMatch3PieceOptions;

/** Custom ease curve for y animation of falling pieces */
const easeSingleBounce = registerCustomEase(
  'M0,0,C0.14,0,0.27,0.191,0.352,0.33,0.43,0.462,0.53,0.963,0.538,1,0.546,0.985,0.672,0.83,0.778,0.83,0.888,0.83,0.993,0.983,1,1'
);

/**
 * The visual representation of a piece in the board. Pieces are the point of interaction with the board
 * because of simplicity, setting up the pointer listeners and passing them up through callbacks.
 * They also have their own set of animations and they will be locked while playing them, to avoid
 * positioning conflicts.
 */
export class Match3Piece extends Container {
  public pieceZone: Sprite;

  public image: Sprite;

  public row = 0;
  public column = 0;

  //* event state
  public pressing = false;
  public dragging = false;
  public pressX = 0;
  public pressY = 0;

  public match3: Match3 = new Match3();

  constructor() {
    super();

    this.image = new Sprite();
    this.image.anchor.set(0.5);
    this.addChild(this.image);

    this.pieceZone = new Sprite(Texture.WHITE);
    this.pieceZone.alpha = 0;
    this.pieceZone.anchor.set(0.5);
    this.addChild(this.pieceZone);

    this.pieceZone.on('pointerdown', this.onPointerDown);
    this.pieceZone.on('pointermove', this.onPointerMove);
    this.pieceZone.on('pointerup', this.onPointerUp);
    this.pieceZone.on('pointerupoutside', this.onPointerUp);
    // this.anchor.set()

    // this.onMove = this.onMove.bind(this);
    // this.onTap = this.onTap.bind(this);
  }

  public setup(options: Partial<Match3PieceOptions & { match3: Match3 }> = {}) {
    const opts = { ...defaultMatch3PieceOptions, ...options };

    const { name, type, size, row, column, highlight, interactive, match3 } =
      opts;

    if (!match3) return;

    //* set row and column to piece
    this.row = row;
    this.column = column;

    //* set up image
    this.image.texture = Texture.from(name);
    const imageSize = size - (highlight ? 2 : 8);
    this.image.width = imageSize;
    this.image.height = imageSize;

    //* setup pieceZone
    this.pieceZone.width = size;
    this.pieceZone.height = size;
    this.pieceZone.interactive = interactive;

    //* set match3
    this.match3 = match3;
  }

  private onPointerDown = (e: FederatedPointerEvent) => {
    if (this.isLock()) return;

    this.pressing = true;
    this.dragging = false;
    this.pressX = e.globalX;
    this.pressY = e.globalY;
  };

  //   publ

  public animateMove = async ({
    to: { x, y },
    newGridPosition,
  }: {
    to: { x: number; y: number };
    newGridPosition: Match3Position;
  }) => {
    const duration = 0.5;
    await gsap.to(this, { x, y, duration, ease: 'quad.out' });
    const { row: newRow, column: newColumn } = newGridPosition;
    this.row = newRow;
    this.column = newColumn;
  };

  public isLock = () => {
    return !this.interactiveChildren;
  };

  public onMove = (from: Match3Position, to: Match3Position) => {
    return this.match3.actions.actionMove(from, to);
  };

  public onTap = (position: Match3Position) => {
    this.match3.actions.actionTap(position);
  };

  private onPointerUp = () => {
    if (this.pressing) {
      this.pressing = false;
      this.pressX = 0;
      this.pressY = 0;
    }
  };

  /** Interaction mouse/touch move handler */
  private onPointerMove = (e: FederatedPointerEvent) => {
    if (!this.pressing || this.isLock()) return;

    const moveX = e.globalX - this.pressX;
    const moveY = e.globalY - this.pressY;
    const distanceX = Math.abs(moveX);
    const distanceY = Math.abs(moveY);
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance > 10) {
      this.dragging = true;
      const from = { row: this.row, column: this.column };
      const to = { row: this.row, column: this.column };

      if (distanceX > distanceY) {
        if (moveX < 0) {
          // Move left
          to.column -= 1;
          this.onMove?.(from, to);
        } else {
          // Move right
          to.column += 1;
          this.onMove?.(from, to);
        }
      } else {
        if (moveY < 0) {
          // Move up
          to.row -= 1;
          this.onMove?.(from, to);
        } else {
          // Move down
          to.row += 1;
          this.onMove?.(from, to);
        }
      }

      this.onPointerUp();
    }
  };

  public getRowCol = () => {
    return {
      row: this.row,
      column: this.column,
    };
  };

  /** Pop out animation */
  public async animatePop() {
    // this.lock();
    resolveAndKillTweens(this.image);
    const duration = 0.1;
    await gsap.to(this.image, { alpha: 0, duration, ease: 'sine.out' });
    this.visible = false;
  }
}
