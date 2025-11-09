import { ENEMY_STATS, EnemyType } from '../constants'
import { Game } from '../scenes/Game'

export class Enemy extends Phaser.GameObjects.Container {
  declare scene: Game
  declare body: Phaser.Physics.Arcade.Body
  public spawnType: EnemyType = 'grunt'
  public health = 0

  private base!: Phaser.GameObjects.Arc
  private healthBar: Phaser.GameObjects.Arc[] = []
  private spinTween?: Phaser.Tweens.Tween

  constructor(scene: Game) {
    super(scene)
    scene.physics.add.existing(this)
    scene.add.existing(this)

    this.base = scene.add.arc(0, 0).setDepth(9)
    for (let i = 0; i < 3; i++) {
      this.healthBar.push(scene.add.arc(0, 0).setDepth(10))
    }
    this.add([this.base, ...this.healthBar])
    this.setVisible(false)
  }

  spawn(spawnType: EnemyType) {
    const { width, height } = this.scene.cameras.main
    this.spawnType = spawnType
    this.health = this.stats.health

    this.body
      .setCircle(this.stats.size)
      .setAllowGravity(false)
      .setOffset(-this.stats.size)
    this.setAlpha(1).setActive(true)
    this.base.setRadius(this.stats.size).setFillStyle(this.stats.color, 1)
    this.setVisible(true)

    const side = Phaser.Math.Between(0, 3)
    let x = 0
    let y = 0
    const d = this.stats.size * 2

    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, width)
        y = -d
        break
      case 1: // right
        x = width + d
        y = Phaser.Math.Between(0, height)
        break
      case 2: // bottom
        x = Phaser.Math.Between(0, width)
        y = height + d
        break
      case 3: // left
        x = -d
        y = Phaser.Math.Between(0, height)
        break
    }

    this.setPosition(x, y)
    this.updatehealthBar()
    this.move()
  }

  move = () => {
    const { centerX, centerY } = this.scene.cameras.main
    const s = 100
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
    if (this.alpha < 1) return

    if (--this.health <= 0) {
      this.kill()
    } else {
      this.setAlpha(0.5)
      this.spinTween?.destroy()
      this.scene.time.delayedCall(200, () => this.setAlpha(1).setActive(true))
      this.scene.time.delayedCall(Phaser.Math.Between(500, 1000), () =>
        this.move(),
      )
    }
    this.updatehealthBar()
  }

  kill = () => {
    this.setActive(false).setAlpha(0)
    this.setVisible(false)
    this.scene.particles
      .setParticleTint(this.stats.color)
      .emitParticleAt(this.x, this.y, 15)
  }

  private updatehealthBar() {
    const fillTint = darkenColor(this.stats.color, 15)
    const GAP = 10
    const r = this.stats.size - 2
    const gapTotal = GAP * this.stats.health
    const available = 360 - gapTotal
    const arcDeg = available / this.stats.health
    const start = -90 + GAP / 2

    this.healthBar.forEach((seg, i) => {
      if (i >= this.health) {
        seg.setVisible(false)
        return
      }

      const sDeg = start + i * (arcDeg + GAP)
      const eDeg = sDeg + arcDeg
      seg
        .setVisible(true)
        .setRadius(r)
        .setStartAngle(sDeg)
        .setEndAngle(eDeg)
        .setFillStyle(fillTint, 1)
    })
  }

  get stats() {
    return ENEMY_STATS[this.spawnType]
  }
}

const darkenColor = (color: number, amount: number) => {
  const Color = Phaser.Display.Color
  const c = Color.ValueToColor(color)
  const d = Color.Interpolate.ColorWithColor(c, new Color(0, 0, 0), 100, amount)
  return Color.GetColor(d.r, d.g, d.b)
}
