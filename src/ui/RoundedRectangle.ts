import * as PIXI from 'pixi.js';

const defaultOptions = {
  width: 100,
  height: 100,
  radius: 10,
  fill: '0x000000',
};

type Options = typeof defaultOptions;

class RoundedRectangle extends PIXI.Container {
  private roundedRectangle: PIXI.Graphics;
  constructor(options: Partial<Options>) {
    super();
    const { width = 10, height = 10, radius = 10, fill = '0x000000' } = options;

    this.roundedRectangle = new PIXI.Graphics();
    this.roundedRectangle.beginFill(fill);
    this.roundedRectangle.drawRoundedRect(0, 0, width, height, radius);
    this.roundedRectangle.x = -width / 2;
    this.roundedRectangle.y = -height / 2;
    this.addChild(this.roundedRectangle);
  }
}

export { RoundedRectangle };
