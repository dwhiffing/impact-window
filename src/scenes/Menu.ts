import { Scene } from 'phaser'

export class Menu extends Scene {
  constructor() {
    super('Menu')
  }

  create(): void {
    const { centerX, centerY, height } = this.cameras.main

    this.cameras.main.fadeFrom(800, 0, 0, 0)

    this.add.image(centerX, centerY - 20, 'title').setOrigin(0.5)

    const pressText = this.add
      .bitmapText(centerX, height - 15, 'pixel-dan', 'PRESS TO START')
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

    this.input.on('pointerdown', () => {
      this.cameras.main
        .flash(50, 255, 255, 255)
        .shake(300, 0.01)
        .fade(800, 0, 0, 0, true, (_: any, p: number) => {
          if (p === 1) this.scene.start('Game')
        })
    })
  }
}
