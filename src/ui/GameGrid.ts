import { Container, Sprite, Graphics } from 'pixi.js';
import * as _ from 'lodash';

type SetupOptions = {
  rows: number;
  columns: number;
  tileSize: number;
};

export class GameGrid extends Container {
  private base: Container;

  private shadow: Container;
  constructor() {
    super();

    //* build the grid
    this.base = new Container();
    this.addChild(this.base);

    //* build the shadow grid;
    this.shadow = new Container();
    this.shadow.y = 8;
    this.addChild(this.shadow);
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
        // block.anchor.set(0.5);

        blockContainer.width = tileSize;
        blockContainer.height = tileSize;
        blockContainer.x = x;
        blockContainer.y = y;
        // block.anchor.set(0.5);

        this.base.addChild(blockContainer);

        //* create the shadow of bottomline
        if (r === rows - 1) {
          const newBlock = Sprite.from('shelf-block');
          // const shadowBlockContainer = _.clone(blockContainer);
          this.shadow.addChild(newBlock);
        }
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

    const offsetX = (columns * tileSize) / 2;
    const offsetY = (rows * tileSize) / 2;
    this.base.x = this.base.x - offsetX;
    this.base.y = this.base.y - offsetY;
  }

  private getBooks(index: number) {
    const list = ['books-01', 'books-02', 'books-03', 'books-04', 'books-05'];
    const name = list[index % list.length];
    const books = Sprite.from(name);
    return books;
  }
}
