import { ENEMY_STATS } from '../constants'
import { Game } from '../scenes/Game'
import { darkenColor } from '../darkenColor'
import { EnemyType } from '../types'

export class Enemy extends Phaser.GameObjects.Container {
  declare scene: Game
  declare body: Phaser.Physics.Arcade.Body
  public spawnType: EnemyType = 'grunt'
  public health = 0

  private base: Phaser.GameObjects.Arc
  private indicator: Phaser.GameObjects.Arc
  private healthGraphics: Phaser.GameObjects.Graphics
  private spinTween?: Phaser.Tweens.Tween
  private timers?: Phaser.Time.TimerEvent[] = []

  constructor(scene: Game) {
    super(scene)
    scene.physics.add.existing(this)
    scene.add.existing(this)

    this.base = scene.add.arc(0, 0).setDepth(1)
    this.indicator = scene.add.arc(0, 0).setAlpha(0)
    this.healthGraphics = scene.add.graphics().setDepth(2)
    this.add([this.base, this.healthGraphics])
    this.setVisible(false).setDepth(2)
  }

  spawn(spawnType: EnemyType) {
    const { x, y, side } = this.computeSpawnPosition()
    this.spawnType = spawnType
    this.health = this.stats.health
    this.timers?.forEach((t) => t.destroy())
    this.timers = []

    this.body
      .setCircle(this.stats.size)
      .setAllowGravity(false)
      .setOffset(-this.stats.size)
    this.setAlpha(1).setActive(true)
    this.base.setRadius(this.stats.size).setFillStyle(this.stats.color, 1)
    this.setVisible(true)
    this.setPosition(x, y)
    this.updateHealthBar()
    this.body.setVelocity(0)

    const d = 25
    const _x = x + (side === 1 ? -d : side === 3 ? d : 0)
    const _y = y + (side === 2 ? -(d + 5) : side === 0 ? d : 0)
    const t = this.scene.tweens
    this.indicator
      .setPosition(_x, _y)
      .setFillStyle(this.stats.color)
      .setRadius(3)

    const FADE_TIME = 400
    const DELAY_TIME = 750

    t.add({
      targets: this.indicator,
      alpha: 0.7,
      duration: FADE_TIME,
      onComplete: () => {
        this.scene.time.delayedCall(DELAY_TIME, this.move)
        t.add({
          targets: this.indicator,
          alpha: 0,
          delay: DELAY_TIME,
          duration: FADE_TIME,
        })
      },
    })
  }

  move = () => {
    const { centerX, centerY } = this.scene.cameras.main
    const s = 40
    const dx = centerX + Phaser.Math.Between(-s, s) - this.x
    const dy = centerY + Phaser.Math.Between(-s, s) - this.y
    const angle = Math.atan2(dy, dx)
    const speed = Phaser.Math.Between(
      Math.max(10, this.stats.speed - 20),
      Math.max(this.stats.speed + 20, this.stats.speed),
    )
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)

    this.spinTween?.destroy()
    this.spinTween = this.scene.add.tween({
      targets: this,
      angle: 360,
      repeat: -1,
      duration: Phaser.Math.Between(1500, 3000),
    })
  }

  damage = () => {
    const damage =
      this.scene.player.activePowerup?.def.name === 'damage' ? 3 : 1
    this.health -= damage
    if (this.health <= 0) {
      this.kill()
      this.scene.addEnergy(this.stats.energyOnKill)
    } else {
      this.scene.sound.play('enemy-hit', { volume: 0.5 })
      this.setAlpha(0.5)
      const a = this.scene.time.delayedCall(100, () => this.setAlpha(1))
      this.spinTween?.destroy()
      const b = this.scene.time.delayedCall(250, () => this.move())
      this.timers?.push(a, b)
    }
    this.updateHealthBar()
  }

  kill = () => {
    this.scene.sound.play('enemy-kill', { volume: 0.75 })
    this.setActive(false).setAlpha(0).setVisible(false)
    this.body.setVelocity(0)
    this.scene.particles
      .setParticleTint(this.stats.color)
      .emitParticleAt(this.x, this.y, 15)

    if (this.spawnType === 'fast') {
      this.scene.spawnPowerup(this.x, this.y)
    }
    this.timers?.forEach((t) => t.destroy())
    this.timers = []

    this.scene.state.patch((s) => ({
      score: s.score + (s.multi + 1) * this.stats.score,
      multi: s.multi + 1,
      lastKillAt: this.scene.time.now,
    }))

    this.scene.player.trailParticles.setParticleTint(this.stats.color)
    this.scene.time.delayedCall(Phaser.Math.Between(50, 100), () => {
      this.scene.player.trailParticles.setParticleTint(this.scene.player.color)
    })
  }

  private updateHealthBar() {
    const fillTint = darkenColor(this.stats.color, 15)
    const GAP = 10
    const r = this.stats.size - 2
    const r2 = r - 3

    const gapTotal = this.stats.health > 1 ? GAP * this.stats.health : 0
    const available = 360 - gapTotal
    const arcDeg = available / this.stats.health
    const startDeg = -90 + GAP / 2
    this.healthGraphics.clear()

    for (let i = 0; i < this.stats.health; i++) {
      if (i >= this.health) break

      const sDeg = startDeg + i * (arcDeg + GAP)
      const eDeg = sDeg + arcDeg
      const sRad = Phaser.Math.DegToRad(sDeg)
      const eRad = Phaser.Math.DegToRad(eDeg)

      const ox = Math.cos(sRad) * r
      const oy = Math.sin(sRad) * r
      const ix = Math.cos(eRad) * r2
      const iy = Math.sin(eRad) * r2

      this.healthGraphics
        .moveTo(ox, oy)
        .arc(0, 0, r, sRad, eRad, false)
        .lineTo(ix, iy)
        .arc(0, 0, r2, eRad, sRad, true)
        .fillStyle(fillTint, 1)
        .fillPath()
    }
  }

  get stats() {
    return ENEMY_STATS[this.spawnType]
  }

  computeSpawnPosition() {
    const { width, height } = this.scene.cameras.main
    const d = 18
    const s = Phaser.Math.Between(0, 3)
    let x = 0
    let y = 0
    switch (s) {
      case 0:
        x = Phaser.Math.Between(d, width - d)
        y = -d
        break
      case 1:
        x = width + d
        y = Phaser.Math.Between(d, height - d)
        break
      case 2:
        x = Phaser.Math.Between(d, width - d)
        y = height + d
        break
      case 3:
        x = -d
        y = Phaser.Math.Between(d, height - d)
        break
    }
    return { x, y, side: s }
  }
}
