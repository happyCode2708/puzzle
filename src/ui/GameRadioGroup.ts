import { CheckBox, RadioGroup, RadioBoxOptions } from '@pixi/ui';
import * as PIXI from 'pixi.js';

const defaultOptions = {
  itemLabels: [],
  gap: 10,
};

type Options = {
  itemLabels: Array<{ label: string }>;
  gap?: number;
};

class GameRadioGroup extends RadioGroup {
  constructor(options: Options) {
    // const { items } = options;
    // const { items } = options;
    const gameRadioGroupOpts = { ...defaultOptions, ...options };
    const { itemLabels, gap } = gameRadioGroupOpts;

    const outerRadius = 16;
    const innerRadius = 12;
    const innerColor = 0xffd579;
    const outerColor = 0xcf4b00;
    const labelColor = 0xffffff;

    const opts: RadioBoxOptions = {
      items: itemLabels.map((item, idx) => {
        const checked = new PIXI.Graphics()
          .beginFill(outerColor)
          .drawCircle(0, 0, outerRadius)
          .beginFill(innerColor)
          .drawCircle(0, 0, innerRadius);

        const unchecked = new PIXI.Graphics()
          .beginFill(outerColor)
          .drawCircle(0, 0, outerRadius);

        const checkbox = new CheckBox({
          style: {
            checked,
            unchecked,
            textOffset: {
              y: -15,
              x: -10,
            },
            text: {
              fill: labelColor,
              fontSize: 18,
            },
          },
          text: item.label,
        });

        return checkbox;
      }),
      elementsMargin: gap,
      selectedItem: 1,
      type: 'vertical' as const,
    };

    super(opts);
  }
}

export { GameRadioGroup };
