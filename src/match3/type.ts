/** Piece type on each position in the grid */
export type Match3Type = number;

/** Two-dimensional array represeinting the game board */
export type Match3Grid = Match3Type[][];

/** Pair of row & column representing grid coordinates */
export type Match3Position = { row: number; column: number };

/** Orientation for match checks */

export const match3ValidModes = ['test', 'easy', 'normal', 'hard'] as const;

/** The game mode type */
export type Match3Mode = (typeof match3ValidModes)[number];
