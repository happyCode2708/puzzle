import { Slider } from '@pixi/ui';
import { Graphics } from '@pixi/graphics';

import { Label } from './Label';

class GameSlider extends Slider {
  private label: Label;

  constructor(label: string) {
    const width = 280;
    const height = 20;
    const radius = 10;
    const border = 4;
    const handleRadius = 14;
    const handleBorder = 4;
    const meshColor = 0xffd579;
    const fillColor = 0xff8221;
    const borderColor = 0xcf4b00;
    const backgroundColor = 0xcf4b00;

    // const newSlider = new Slider({

    // })

    const bg = new Graphics()
      .beginFill(borderColor)
      .drawRoundedRect(0, 0, width, height, radius)
      .beginFill(backgroundColor)
      .drawRoundedRect(
        border,
        border,
        width - border * 2,
        height - border * 2,
        radius
      );

    const fill = new Graphics()
      .beginFill(borderColor)
      .drawRoundedRect(0, 0, width, height, radius)
      .beginFill(fillColor)
      .drawRoundedRect(
        border,
        border,
        width - border * 2,
        height - border * 2,
        radius
      );

    const slider = new Graphics()
      .beginFill(borderColor)
      .drawCircle(0, 0, handleRadius + handleBorder)
      .beginFill(meshColor)
      .drawCircle(0, 0, handleRadius)
      .endFill();

    super({ slider, bg, fill });

    this.label = new Label(label, {
      align: 'left',
      fill: 0xffffff,
      fontSize: 18,
    });

    // this.addChil
    // this.gameSliderInit(label);
  }

  // private gameSliderInit(label: string) {
  //   // this.addChild(this.label);
  // }
}

export default GameSlider;
