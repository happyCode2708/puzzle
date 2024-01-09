import * as PIXI from 'pixi.js';

const defaultOptions = {
  gap: 50,
};

const defaultItemOptions = {
  x: 0,
  y: 0,
  gap: 10,
};

type Options = typeof defaultOptions;
type ItemOptions = typeof defaultItemOptions;
type ObjectInfo = {
  item: PIXI.Container;
  x: number;
  y: number;
  gap: number;
};

class FormContainer extends PIXI.Container {
  public objects: ObjectInfo[];
  private gap: number;

  constructor(options?: Partial<Options>) {
    const opts = { ...defaultOptions, ...(options || {}) };
    super();
    this.objects = [];
    this.gap = opts.gap;
  }

  public addItem(item: PIXI.DisplayObject, itemOptions?: Partial<ItemOptions>) {
    const opts = { ...defaultItemOptions, ...(itemOptions || {}) };
    const { x, y, gap: customGap } = opts;

    const itemGap = customGap ?? this.gap;

    const theLastItem = this.objects[this.objects.length - 1];
    const lastItemEndY = theLastItem
      ? theLastItem.y + theLastItem.item.height
      : 0;

    const itemY = lastItemEndY ? lastItemEndY + itemGap : lastItemEndY;

    item.y = y || itemY;
    item.x = x;

    const itemContainer = new PIXI.Container();
    itemContainer.addChild(item);
    this.objects.push({
      item: itemContainer,
      x: item.x,
      y: item.y,
      gap: itemGap,
    });
    this.addChild(itemContainer);
  }
}

export { FormContainer };
