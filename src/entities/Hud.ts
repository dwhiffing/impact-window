import {
  COMBO_EXPIRE_MS,
  FULL_LAUNCH_COST,
  MAX_ENERGY,
  WEAK_LAUNCH_COST,
} from '../constants'
import { Game } from '../scenes/Game'

export class Hud {
  scene: Game
  public comboArc: Phaser.GameObjects.Graphics
  public energyMeterFill: Phaser.GameObjects.Rectangle
  public multiText: Phaser.GameObjects.BitmapText

  constructor(scene: Game) {
    this.scene = scene
    const { centerX: x, width, height } = this.scene.cameras.main

    const scoreText = this.scene.add
      .bitmapText(x, height - 2, 'pixel-dan', '0')
      .setOrigin(0.5, 1)
      .setAlpha(0.7)
      .setFontSize(10)
      .setDepth(9)
    this.multiText = this.scene.add
      .bitmapText(x, height - 26, 'pixel-dan', '')
      .setOrigin(0.5, 1)
      .setFontSize(5)
      .setDepth(9)
      .setAlpha(0.7)

    this.scene.add
      .rectangle(0, height, width, 3, 0x222222)
      .setOrigin(0, 1)
      .setDepth(9)
    this.energyMeterFill = this.scene.add
      .rectangle(0, height, width, 3, 0x00cc99)
      .setOrigin(0, 1)
      .setDepth(10)

    this.comboArc = this.scene.add.graphics().setDepth(11)
    this.scene.events.on('update', this.update, this)

    this.scene.state.on('change', ({ score, multi }) => {
      scoreText.setText(`${score}`)
      this.multiText.setText(multi > 0 ? `X${multi}` : '')
      this.updateEnergyBar()
    })
  }

  update = () => {
    const multi = this.scene.state.get().multi
    const x = this.multiText.x - 1
    const y = this.multiText.y - 6
    const R = 8

    if (multi > 0) {
      const lastKill = this.scene.state.get().lastKillAt || 0
      const remaining = Math.max(
        0,
        lastKill + COMBO_EXPIRE_MS - this.scene.time.now,
      )
      const fraction = Phaser.Math.Clamp(remaining / 1000, 0, 1)

      const startDeg = -90
      const endDeg = startDeg + Math.floor(360 * fraction)
      const start = Phaser.Math.DegToRad(startDeg)
      const end = Phaser.Math.DegToRad(endDeg)

      this.comboArc
        .clear()
        .lineStyle(1, 0xffffff, 0.7)
        .arc(x, y, R, start, end, false)
        .strokePath()

      if (remaining <= 0) {
        this.scene.sound.play('combo-expire', { volume: 0.5 })
        this.scene.state.patch({ multi: 0 })
      }
    }
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
