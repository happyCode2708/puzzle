import * as PIXI from 'pixi.js';
import { Slider } from '@pixi/ui';
import { Label } from '../ui/Label';
import { Signal } from 'typed-signals';

const defaultOptions =
  {
    min: 0,
    max: 100,
    width: 240,
    height: 20,
    radius: 10,
    borderThick: 4,
    label: '',
    value: 0,
  } || undefined;

type Options = typeof defaultOptions;

class GameSlider extends Slider {
  public handleRadius: number;
  private labelObject: Label | undefined;

  constructor(options: Partial<Options> = {}) {
    const opts = { ...(defaultOptions || {}), ...options };

    const { max, min, width, height, radius, borderThick, label, value } = opts;

    const borderColor = 0xcf4b00;
    const handleColor = 0xffd579;
    const innerColor = 0xff8221;
    const handleBorder = 4;
    const handleRadius = 14;

    const bg = new PIXI.Graphics()
      .beginFill(borderColor)
      .drawRoundedRect(0, 0, width, height, radius);

    const fill = new PIXI.Graphics()
      .beginFill(borderColor)
      .drawRoundedRect(0, 0, width, height, radius)
      .beginFill(innerColor)
      .drawRoundedRect(
        borderThick,
        borderThick,
        width - borderThick * 2,
        height - borderThick * 2,
        radius
      );

    const slider = new PIXI.Graphics()
      .beginFill(borderColor)
      .drawCircle(0, 0, handleRadius + handleBorder)
      .beginFill(handleColor)
      .drawCircle(0, 0, handleRadius)
      .endFill();

    // bg.width = bg.width - handleRadius;

    super({
      bg,
      fill,
      slider,
      min,
      max,
      value,
    });
    this.handleRadius = handleRadius;
    // this.value = value;

    if (label) {
      const labelStyle: Partial<PIXI.TextStyle> = {
        align: 'left',
        fontSize: 18,
        fill: 0xffffff,
      };
      this.labelObject = new Label(label, labelStyle);

      this.labelObject.anchor.x = 0;
      this.labelObject.x = 0;
      this.labelObject.y = -18;

      this.addChild(this.labelObject);
    }
  }
}

export { GameSlider };
