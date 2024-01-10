import { Container, Sprite } from 'pixi.js';
import * as _ from 'lodash';

type SetupOptions = {
  rows: number;
  columns: number;
  tileSize: number;
};

export class GameGrid extends Container {
  private gameGridContent: Container;
  private base: Container;

  private shadow: Container;
  constructor() {
    super();

    //* build the grid
    this.gameGridContent = new Container();

    this.base = new Container();
    this.gameGridContent.addChild(this.base);

    //* build the shadow grid;
    this.shadow = new Container();
    this.gameGridContent.addChild(this.shadow);

    this.addChild(this.gameGridContent);
  }

  public setup(options: SetupOptions) {
    const { rows, columns, tileSize } = options;

    //* create blocks in the center
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const block = Sprite.from('shelf-block');
        const blockContainer = new Container();
        blockContainer.addChild(block);
        const x = c * tileSize;
        const y = r * tileSize;

        blockContainer.width = tileSize;
        blockContainer.height = tileSize;
        blockContainer.x = x;
        blockContainer.y = y;

        this.base.addChild(blockContainer);
      }
    }

    //* create left decoration col
    for (let r = 0; r < rows; r++) {
      const textureImage =
        r !== 0 && r !== rows - 1 ? 'shelf-block' : 'shelf-corner';
      const block = Sprite.from(textureImage);
      const blockContainer = new Container();
      blockContainer.addChild(block);
      const x = -1 * tileSize;
      const y = r * tileSize;
      blockContainer.width = tileSize;
      blockContainer.height = tileSize;
      blockContainer.x = x;
      blockContainer.y = y;
      if (r === rows - 1) {
        block.anchor.set(0.5);
        block.rotation = r === rows - 1 ? -Math.PI * 0.5 : 0;
        block.x = block.x + block.width / 2;
        block.y = block.y + block.width / 2;
      }

      const books = this.getBooks(r === rows - 1 ? 4 : r);
      blockContainer.addChild(books);
      this.base.addChild(blockContainer);
    }

    //* create left decoration col
    for (let r = 0; r < rows; r++) {
      const textureImage =
        r !== 0 && r !== rows - 1 ? 'shelf-block' : 'shelf-corner';
      const block = Sprite.from(textureImage);
      const blockContainer = new Container();
      blockContainer.addChild(block);
      const x = columns * tileSize;
      const y = r * tileSize;
      blockContainer.width = tileSize;
      blockContainer.height = tileSize;
      blockContainer.x = x;
      blockContainer.y = y;
      if (r === rows - 1 || r == 0) {
        block.anchor.set(0.5);
        block.rotation = r === 0 ? Math.PI * 0.5 : Math.PI;
        block.x = block.x + block.width / 2;
        block.y = block.y + block.width / 2;
      }

      const books = this.getBooks(r === rows - 1 ? 4 : r);
      blockContainer.addChild(books);
      this.base.addChild(blockContainer);
    }

    //* create the shadow of bottomline
    for (let c = -1; c < columns + 1; c++) {
      const textureImage =
        c === -1 || c === columns ? 'shelf-corner' : 'shelf-block';
      const shadowBlock = Sprite.from(textureImage);
      shadowBlock.tint = 0x000000;
      shadowBlock.alpha = 0.3;
      shadowBlock.x = tileSize * c;
      shadowBlock.y = tileSize * rows;
      shadowBlock.width = tileSize;
      shadowBlock.height = tileSize;
      if (c === columns || c == -1) {
        shadowBlock.anchor.set(0.5);
        shadowBlock.rotation = c === -1 ? -Math.PI * 0.5 : Math.PI;
        shadowBlock.x = shadowBlock.x + shadowBlock.width / 2;
        shadowBlock.y = shadowBlock.y + shadowBlock.width / 2;
      }
      this.shadow.addChild(shadowBlock);
    }

    const offsetX = (columns * tileSize) / 2;
    const offsetY = (rows * tileSize) / 2;
    this.gameGridContent.x = this.gameGridContent.x - offsetX;
    this.gameGridContent.y = this.gameGridContent.y - offsetY;

    this.shadow.y = -tileSize * 0.75;
  }

  private getBooks(index: number) {
    const list = ['books-01', 'books-02', 'books-03', 'books-04', 'books-05'];
    const name = list[index % list.length];
    const books = Sprite.from(name);
    return books;
  }
}
