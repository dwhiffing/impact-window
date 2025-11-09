import { FULL_LAUNCH_COST, MAX_ENERGY, WEAK_LAUNCH_COST } from '../constants'
import { Game } from '../scenes/Game'

export class Hud {
  scene: Game
  public energyMeterFill: Phaser.GameObjects.Rectangle

  constructor(scene: Game) {
    this.scene = scene
    const { centerX: x, width, height } = this.scene.cameras.main

    const scoreText = this.scene.add
      .bitmapText(x, height - 5, 'pixel-dan', '0')
      .setOrigin(0.5, 1)
      .setFontSize(10)
      .setDepth(9)
    const multiText = this.scene.add
      .bitmapText(x, height - 23, 'pixel-dan', '')
      .setOrigin(0.5, 1)
      .setFontSize(5)
      .setDepth(9)

    this.scene.add
      .rectangle(0, height, width, 3, 0x222222)
      .setOrigin(0, 1)
      .setDepth(9)
    this.energyMeterFill = this.scene.add
      .rectangle(0, height, width, 3, 0x00cc99)
      .setOrigin(0, 1)
      .setDepth(10)

    this.scene.state.on('change', ({ score, multi }) => {
      scoreText.setText(`${score}`)
      multiText.setText(multi > 0 ? `X${multi}` : '')
      this.updateEnergyBar()
    })
  }

  updateEnergyBar = () => {
    const energy = this.scene.state.get().energy
    const width = this.scene.cameras.main.width
    const p = clamp(energy / MAX_ENERGY, 0, 1)
    const f = this.energyMeterFill
    const isWeak = energy < FULL_LAUNCH_COST
    const isDisabled = energy < WEAK_LAUNCH_COST
    const color = isDisabled ? 0x333333 : isWeak ? 0x00ffff : 0xffff00
    f.setDisplaySize(width * p, f.height)
    f.setFillStyle(color)
  }
}

const clamp = Phaser.Math.Clamp
