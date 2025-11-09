import { Scene } from 'phaser'
import { PLAYER_SIZE } from '../constants'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  init() {
    const bar = this.add.rectangle(0, 0, 0, 64, 0xffffff).setOrigin(0, 0)
    this.load.on('progress', (p: number) => (bar.width = 64 * p))
  }

  preload() {
    this.load.setPath('assets/')
    this.load.bitmapFont('pixel-dan', 'pixel-dan.png', 'pixel-dan.xml')
    this.add
      .graphics()
      .fillStyle(0xffffff, 1)
      .fillRect(0, 0, 4, 4)
      .generateTexture('particle', 4, 4)
      .destroy()
    const r = PLAYER_SIZE * 3
    this.add
      .graphics()
      .fillStyle(0xffffff, 1)
      .fillCircle(r, r, r)
      .generateTexture('circle', r * 2, r * 2)
      .destroy()
  }

  create() {
    this.scene.start('Game')
  }
}
