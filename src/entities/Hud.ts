import {
  COMBO_COUNTDOWN_MS,
  COMBO_EXPIRE_MS,
  FULL_LAUNCH_COST,
  MAX_ENERGY,
  WEAK_LAUNCH_COST,
} from '../constants'
import { Game } from '../scenes/Game'

const ALPHA = 0.6
export class Hud {
  scene: Game
  public comboArc: Phaser.GameObjects.Graphics
  public energyMeterFill: Phaser.GameObjects.Rectangle
  public multiText: Phaser.GameObjects.BitmapText
  private multiCountdownEvent?: Phaser.Time.TimerEvent | null
  private comboExpireEvent?: Phaser.Time.TimerEvent | null

  constructor(scene: Game) {
    this.scene = scene
    this.multiCountdownEvent = undefined
    this.comboExpireEvent = undefined
    const { centerX: x, width, height } = this.scene.cameras.main

    const scoreText = this.scene.add
      .bitmapText(x, height - 2, 'pixel-dan', '0')
      .setOrigin(0.5, 1)
      .setAlpha(ALPHA)
      .setFontSize(10)
      .setDepth(9)
    this.multiText = this.scene.add
      .bitmapText(x, height - 26, 'pixel-dan', '')
      .setOrigin(0.5, 1)
      .setFontSize(5)
      .setDepth(9)
      .setAlpha(ALPHA)

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

    this.scene.state.on('change', ({ score, multi }, { multi: prevMulti }) => {
      scoreText.setText(`${score}`)
      this.multiText.setText(multi > 0 ? `X${multi}` : '')
      this.updateEnergyBar()
      if (multi > prevMulti) {
        this.clearMultiCountdown()
        this.startComboExpire()
      }
    })
  }

  update = () => {
    const multi = this.scene.state.get().multi
    const x = this.multiText.x - 1
    const y = this.multiText.y - 6
    const R = 8

    this.comboArc.clear()
    if (multi > 0) {
      let fraction = 0

      if (this.multiCountdownEvent) {
        const tev: any = this.multiCountdownEvent
        let progress = 0
        progress = tev.getProgress()

        fraction = Phaser.Math.Clamp(1 - progress, 0, 1)
      } else if (this.comboExpireEvent) {
        const tev: any = this.comboExpireEvent
        let progress = 0
        progress = tev.getProgress()

        fraction = Phaser.Math.Clamp(1 - progress, 0, 1)

        if (tev.hasDispatched && !this.multiCountdownEvent)
          this.startMultiCountdown()
      } else {
        fraction = 0
      }

      const startDeg = -90
      const endDeg = startDeg + Math.floor(360 * fraction)
      const start = Phaser.Math.DegToRad(startDeg)
      const end = Phaser.Math.DegToRad(endDeg)

      this.comboArc
        .lineStyle(1, 0xffffff, ALPHA)
        .arc(x, y, R, start, end, false)
        .strokePath()
    }
  }

  startMultiCountdown = () => {
    if (this.multiCountdownEvent) return

    this.comboExpireEvent?.remove(false)
    this.comboExpireEvent = undefined

    const currentMulti = this.scene.state.get().multi ?? 1
    const next = Math.max(0, currentMulti - 1)
    this.scene.state.patch({ multi: next })

    if (next === 0) {
      this.scene.sound.play('combo-expire', { volume: 0.5 })
      return
    } else {
      this.scene.sound.play('combo-countdown', { volume: 0.5 })
    }

    this.multiCountdownEvent = this.scene.time.addEvent({
      delay: COMBO_COUNTDOWN_MS,
      loop: true,
      callback: () => {
        const cm = this.scene.state.get().multi
        if (!cm || cm <= 0) return this.clearMultiCountdown()

        const next = Math.max(0, cm - 1)
        this.scene.state.patch({ multi: next })

        if (next === 0) {
          this.scene.sound.play('combo-expire', { volume: 0.5 })
          return this.clearMultiCountdown()
        } else {
          this.scene.sound.play('combo-countdown', { volume: 0.5 })
        }
      },
    })
  }

  startComboExpire = () => {
    this.comboExpireEvent?.remove(false)

    const multi = this.scene.state.get().multi
    if (!multi || multi <= 0) return

    this.comboExpireEvent = this.scene.time.addEvent({
      delay: COMBO_EXPIRE_MS,
      loop: false,
      callback: () => this.startMultiCountdown,
    })
  }

  clearMultiCountdown = () => {
    this.multiCountdownEvent?.remove(false)
    this.multiCountdownEvent = undefined
    this.comboExpireEvent?.remove(false)
    this.comboExpireEvent = undefined
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
