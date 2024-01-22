import { Container } from 'pixi.js';
import {
  Match3OnMatchData,
  Match3OnMoveData,
  Match3OnPopData,
} from '../match3/PuzzlingBoard.ts';
import { Match3Piece } from '../match3/Match3Piece.ts';
import { randomRange } from '../utils/random.ts';
import gsap from 'gsap';
import { GameScreen } from '../screens/GameScreen.ts';
import { earthquake, registerCustomEase } from '../utils/animation.ts';
// import { getDistance } from '../utils/maths';
import { pool } from '../utils/pool.ts';
import { sfx } from '../utils/audio.ts';
import { PopExplosion } from './PopExplosion.ts';
import { waitFor } from '../utils/asyncUtils.ts';
// import { throttle } from '../utils/throttle';

/** Custom ease curve for x tweens of pieces flying to cauldron */
const easeJumpToCauldronX = registerCustomEase(
  'M0,0,C0,0,0.063,-0.304,0.374,-0.27,0.748,-0.228,1,1,1,1'
);

/** Custom ease curve for y tweens of pieces flying to cauldron */
const easeJumpToCauldronY = registerCustomEase(
  'M0,0 C0,0 0.326,1.247 0.662,1.29 0.898,1.32 1,1 1,1 '
);

/** Custom ease curve for scale tweens of pieces flying to cauldron */
const easeJumpToCauldronScale = registerCustomEase(
  'M0,0,C0,0,0.043,-1.694,0.356,-1.694,1.026,-1.694,1,1,1,1'
);

/**
 * All gameplay special effects, isolated on its own class in a way that can be changed freely, without affecting gameplay.
 * List of special effects in this class:
 * - Piece Move - Play a short sfx accordingly if the movement is allowed or not
 * - Piece Explosion - When a piece is popped out, play a little explosion animation in place
 * - Piece Pop - When a non-special piece is popped out, it flies to the cauldron
 * - Match Done - When a match happens, play sfx and "shake" the game according to the combo level
 * - Gird Explosion - Explode all pieces out of the grid, played when gameplay finishes
 */
export class Effects extends Container {
  /** The game screen instance */
  private game: GameScreen;

  constructor(game: GameScreen) {
    super();
    this.game = game;
    this.sortableChildren = true;
  }

  /** Auto-update by overriding Container's updateTransform */
  public updateTransform() {
    super.updateTransform();
    // Update children z indexes to auto organise their order according
    // to their scales, to create a sort of a "3d depth" simulation
    for (const child of this.children) {
      child.zIndex = child.scale.x;
    }
  }

  /** Fired when a piece is moved */
  public async onMove(data: Match3OnMoveData) {
    if (!data.valid) {
      sfx.play('common/sfx-incorrect.wav', { volume: 0.5 });
    } else {
      sfx.play('common/sfx-correct.wav', { volume: 0.5 });
    }
  }

  /** Fired when a piece is popped out from the grid */
  public async onPop(data: Match3OnPopData) {
    const position = this.toLocal(data.piece.getGlobalPosition());
    this.playPopExplosion(position);
    // earthquake(this.game.pivot, 15);
    // sfx.play('common/sfx-special.wav', { volume: 0.5 });

    // if (!data.isSpecial) {
    //   const position = this.toLocal(data.piece.getGlobalPosition());
    //   const piece = pool.get(Match3Piece);
    //   piece.setup({
    //     name: data.piece.name,
    //     type: data.piece.type,
    //     size: this.game.puzzlingBoard.board.tileSize,
    //     interactive: false,
    //   });
    //   piece.position.copyFrom(position);
    //   this.addChild(piece);
    //   await this.playFlyToCauldron(piece);
    //   this.removeChild(piece);
    //   pool.giveBack(piece);
    // } else {
    //   sfx.play('common/sfx-special.wav', { volume: 0.5 });
    //   earthquake(this.game.pivot, 15);
    // }
  }

  public onMatchEffect(comboCount: number) {
    sfx.play('common/sfx-match.wav', {
      speed: 0.95 + comboCount * 0.05,
      volume: 0.4,
    });

    if (comboCount > 1) {
      earthquake(this.game.pivot, Math.min(1 + comboCount, 20));
    }
  }

  /** Play a short explosion effect in given position */
  private async playPopExplosion(position: { x: number; y: number }) {
    const explosion = new PopExplosion();
    explosion.x = position.x;
    explosion.y = position.y;
    this.addChild(explosion);
    await explosion.play();
    this.removeChild(explosion);
    // pool.giveBack(explosion);
  }
}
