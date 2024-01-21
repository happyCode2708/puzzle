import { Container, Sprite } from 'pixi.js';
import gsap from 'gsap';
import { randomRange } from '../utils/random';

export class PopExplosion extends Container {
  private circleParticleList: Sprite[] = [];
  private particalMaxCount = 12;
  private duration = 0.25;

  constructor() {
    super();
    this.setup();
  }

  private setup() {
    for (let i = 0; i < this.particalMaxCount; i++) {
      const particle = Sprite.from('circle');
      particle.anchor.set(0.5);
      this.circleParticleList.push(particle);
      this.addChild(particle);
    }
  }

  public async play() {
    const animatePromises = [];
    for (const particle of this.circleParticleList) {
      animatePromises.push(this.playParticle(particle));
    }
    await Promise.all(animatePromises);
  }

  private async playParticle(particle: Sprite) {
    gsap.killTweensOf(particle.scale);
    gsap.killTweensOf(particle);
    particle.scale.set(0.1);
    particle.alpha = 1;
    particle.x = randomRange(-10, 10);
    particle.y = randomRange(-10, 10);

    const newX = randomRange(-50, 50);
    const newY = randomRange(-50, 50);

    const endScale = randomRange(0, 0.5);
    gsap.to(particle.scale, {
      x: endScale,
      y: endScale,
      duration: this.duration,
      ease: 'sine.out',
    });
    await gsap.to(particle, {
      x: newX,
      y: newY,
      alpha: 0,
      duration: this.duration + 0.2,
      ease: 'quad.out',
    });
  }
}
