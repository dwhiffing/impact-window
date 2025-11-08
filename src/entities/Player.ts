import {
  PLAYER_COLOR,
  PLAYER_CRUSH_COLOR,
  PLAYER_DRAG,
  PLAYER_MAX_SPEED,
  PLAYER_MIN_CRUSH_SPEED,
  PLAYER_SIZE,
  PLAYER_ACCELERATION,
  ENEMY_COLOR,
  PLAYER_LAUNCH_SPEED,
} from '../constants'
import { Game } from '../scenes/Game'

export class Player extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game
  private pendingImpulse = 0

  constructor(scene: Game) {
    const { centerX, centerY } = scene.cameras.main
    super(scene, centerX, centerY, PLAYER_SIZE, 0, 360, true, PLAYER_COLOR)
    scene.physics.add.existing(this)
    scene.add.existing(this)
    this.body
      .setCircle(PLAYER_SIZE)
      .setImmovable(false)
      .setAllowGravity(false)
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setDamping(true)
      .setDrag(PLAYER_DRAG)

    this.body.onWorldBounds = true
  }

  update() {
    this.setFillStyle(this.color)

    if (this.pendingImpulse > 0) {
      const apply = Math.min(this.pendingImpulse, PLAYER_ACCELERATION)
      const nx = this.body.velocity.x / this.speed
      const ny = this.body.velocity.y / this.speed
      const s = Math.min(this.speed + apply, PLAYER_MAX_SPEED)
      this.body.setVelocity(nx * s, ny * s)
      this.pendingImpulse -= apply
      if (this.pendingImpulse <= 0) this.pendingImpulse = 0
    }

    const t = Phaser.Math.Clamp(this.speed / PLAYER_MAX_SPEED, 0, 1)
    const eased = 1 - Math.pow(1 - t, 1.2)
    const scale = Phaser.Math.Linear(0.01, 0.2, eased)
    this.scene.trailParticles.setParticleScale(scale)
    if (this.speed > PLAYER_MIN_CRUSH_SPEED) {
      this.scene.trailParticles.setActive(true)
    } else {
      this.scene.state.patch({ multi: 0 })
    }
  }

  kill = () => {
    this.setActive(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(this.color)
      .emitParticleAt(this.x, this.y, 50)
  }

  get color(): number {
    return this.speed > PLAYER_MIN_CRUSH_SPEED
      ? PLAYER_CRUSH_COLOR
      : PLAYER_COLOR
  }

  get speed(): number {
    return (
      Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2) +
      0.0000001
    )
  }

  addImpulse(impulse: number) {
    const availableToMax = Math.max(0, PLAYER_MAX_SPEED - this.speed)
    const toAdd = Math.min(impulse, availableToMax)
    if (toAdd <= 0) return
    this.pendingImpulse += toAdd
    this.scene.trailParticles.setParticleTint(ENEMY_COLOR)
    this.scene.time.delayedCall(Phaser.Math.Between(50, 100), () => {
      this.scene.trailParticles.setParticleTint(this.color)
    })
  }

  launch(p: Phaser.Input.Pointer) {
    const dx = -(p.x - p.downX)
    const dy = -(p.y - p.downY)
    const angle = Math.atan2(dy, dx)
    const vx = Math.cos(angle) * 0.01
    const vy = Math.sin(angle) * 0.01
    this.body.setVelocity(vx, vy)
    this.pendingImpulse += PLAYER_LAUNCH_SPEED
  }

  onWorldBounds() {
    this.scene.cameras.main.shake(50, 0.015)
    this.scene.particles
      .setParticleTint(this.color)
      .emitParticleAt(this.x, this.y, 2)
  }
}
