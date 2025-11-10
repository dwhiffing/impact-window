import { Scene } from 'phaser'
import { LOCAL_STORAGE_KEY } from '../constants'

export class Menu extends Scene {
  constructor() {
    super('Menu')
  }

  create(): void {
    const { centerX, centerY } = this.cameras.main

    this.cameras.main.fadeFrom(800, 0, 0, 0)

    this.add.image(centerX, centerY - 35, 'title').setOrigin(0.5)

    const hs = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10) || 0
    if (hs > 0) {
      this.add
        .bitmapText(centerX, centerY + 35, 'pixel-dan', `HIGH SCORE: ${hs}`)
        .setOrigin(0.5)
        .setFontSize(10)
        .setDepth(9)
    }

    const pressText = this.add
      .bitmapText(centerX, centerY + 80, 'pixel-dan', 'PRESS TO START')
      .setOrigin(0.5, 1)
      .setFontSize(10)
      .setDepth(9)

    this.tweens.add({
      targets: pressText,
      alpha: { from: 0.2, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.input.once('pointerdown', this.startGame)
  }

  startGame = () => {
    this.sound.play('start-game')
    this.sound.play('explode-2', { volume: 0.5 })
    this.cameras.main
      .flash(50, 255, 255, 255)
      .shake(300, 0.01)
      .fade(800, 0, 0, 0, true, (_: any, p: number) => {
        if (p === 1) this.scene.start('Game')
      })
  }
}
