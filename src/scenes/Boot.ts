import { Scene } from 'phaser'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  init() {
    const bar = this.add.rectangle(0, 0, 0, 64, 0xffffff).setOrigin(0, 0)
    this.load.on('progress', (p: number) => (bar.width = 64 * p))
  }

  preload() {}

  create() {
    this.scene.start('Game')
  }
}
