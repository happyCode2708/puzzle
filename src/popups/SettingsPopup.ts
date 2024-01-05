import * as PIXI from 'pixi.js';
// import GameSlider from '../ui/Slider.ts';
import gsap from 'gsap';

import { Label } from '../ui/Label.ts';
import { LargeButton } from '../ui/LargeButton.ts';

import { ImageButton } from '../ui/ImageButton.ts';
import { navigation } from '../utils/navigation';
import { RoundedBox } from '../ui/RoundedBox.ts';
import { RoundedRectangle } from '../ui/RoundedRectangle.ts';
import { GameSlider } from '../ui/GameSlider.ts';

class SettingsPopup extends PIXI.Container {
  private masterSlider;
  private bgmSlider;
  // private sfxSlider;

  private panel: PIXI.Container;
  private title: Label;
  private popupMask: PIXI.Sprite;
  private doneButton: LargeButton;
  private panelBase: RoundedRectangle;
  private formContainer: PIXI.Container;
  // private bg: Sprite;

  constructor() {
    super();
    this.panel = new PIXI.Container();
    // this.init();

    //* init popup mask
    this.popupMask = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.popupMask.tint = 0x0a0025;
    this.popupMask.interactive = true;

    this.addChild(this.popupMask);

    //* create rouned box;
    this.panelBase = new RoundedRectangle({
      width: 400,
      height: 600,
      radius: 40,
      fill: '0x2c136c',
    });
    this.panel.addChild(this.panelBase);

    //* create the title
    this.title = new Label('Setting', {
      fill: 0xffd579,
      fontSize: 50,
    });
    this.panel.addChild(this.title);

    //* create new container for all setting
    this.formContainer = new PIXI.Container();
    //* create volumne slider;
    this.masterSlider = new GameSlider({});
    this.formContainer.addChild(this.masterSlider);

    //* create bgm volume slider;
    this.bgmSlider = new GameSlider({});
    this.bgmSlider.y = 100;
    this.formContainer.addChild(this.bgmSlider);

    this.formContainer.x =
      -this.panelBase.width / 2 +
      (this.panelBase.width - this.masterSlider.width) / 2;
    this.formContainer.y = -this.panelBase.height / 2 + 150;

    this.panel.addChild(this.formContainer);
    //* create done button
    this.doneButton = new LargeButton({
      text: 'Done',
      width: 300,
      height: 100,
    });
    this.doneButton.onPress.connect(() => {
      navigation.dismissPopup();
    });

    this.panel.addChild(this.doneButton);

    //* add panel to setting popup object
    this.addChild(this.panel);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.popupMask.width = width;
    this.popupMask.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    //* set posiiton for each element
    this.title.y = -this.panelBase.height / 2 + 50;
    this.doneButton.y = 200;
  }

  private init() {
    // this.panel.addChild(this.masterSlider);
  }
  /** Present the popup, animated */
  public async show() {
    // if (navigation.currentScreen) {
    //     navigation.currentScreen.filters = [new BlurFilter(5)];
    // }
    // gsap.killTweensOf(this.bg);
    gsap.killTweensOf(this.panel.pivot);
    this.popupMask.alpha = 0;
    this.panel.pivot.y = -400;
    gsap.to(this.popupMask, { alpha: 0.8, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, { y: 0, duration: 0.3, ease: 'back.out' });
  }

  /** Dismiss the popup, animated */
  public async hide() {
    // if (navigation.currentScreen) {
    //     navigation.currentScreen.filters = null;
    // }
    // gsap.killTweensOf(this.bg);
    gsap.killTweensOf(this.panel.pivot);
    // gsap.to(this.bg, { alpha: 0, duration: 0.2, ease: 'linear' });
    await gsap.to(this.panel.pivot, {
      y: -500,
      duration: 0.3,
      ease: 'back.in',
    });
  }
}

export { SettingsPopup };
