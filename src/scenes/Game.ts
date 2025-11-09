import { Scene } from 'phaser'
import { HookState, withGlobalState } from 'phaser-hooks'
import { Enemy } from '../entities/Enemy'
import { Player } from '../entities/Player'
import { Line } from '../entities/Line'
import { Hud } from '../entities/Hud'
import { IState } from '../types'
import {
  DEAD_ZONE_SIZE,
  NUDGE_ZONE_SIZE,
  MULTI_SPEED_BOOST,
  PARTICLE_CONFIG,
  PLAYER_MIN_CRUSH_SPEED,
  MAX_ENERGY,
  ENERGY_RECHARGE_RATE,
  WEAK_LAUNCH_COST,
  FULL_LAUNCH_COST,
  BASE_SCORE,
  SPAWN_RATE,
} from '../constants'

export class Game extends Scene {
  public player: Player
  public enemies: Phaser.Physics.Arcade.Group
  public line: Line
  public hud: Hud
  public particles: Phaser.GameObjects.Particles.ParticleEmitter
  public state: HookState<IState>

  constructor() {
    super('Game')
  }

  create(): void {
    this.cameras.main.fadeFrom(800, 0, 0, 0)

    this.state = withGlobalState<IState>(this, 'global')
    this.state.set({ score: 0, multi: 0, energy: MAX_ENERGY })

    this.player = new Player(this)
    this.line = new Line(this)
    this.enemies = this.physics.add.group({ classType: Enemy })
    this.particles = this.add.particles(0, 0, 'particle', PARTICLE_CONFIG)
    this.hud = new Hud(this)

    this.input.on('pointermove', this.onDrag)
    this.input.on('pointerup', this.onRelease)
    this.input.on('gameout', this.onRelease)
    this.physics.world.on('worldbounds', this.onWorldBounds)
    this.physics.add.collider(this.player, this.enemies, undefined, this.onCollide) // prettier-ignore

    this.time.addEvent({
      delay: SPAWN_RATE,
      loop: true,
      callback: this.spawnEnemy,
    })
    this.spawnEnemy()
  }

  spawnEnemy = () =>
    this.enemies
      .get()
      .spawn(Phaser.Math.Between(0, 3) === 0 ? 'heavy' : 'grunt')

  update = (_time: number, _delta: number): void => {
    const dt = _delta / 1000

    this.player.update()

    const rate = this.time.timeScale < 1 ? -1 : ENERGY_RECHARGE_RATE
    this.state.patch((s) => ({
      energy: Math.min(s.energy + rate * dt, MAX_ENERGY),
    }))

    if (this.input.activePointer.isDown) {
      if (this.time.timeScale < 1 || !this.player.canLaunch) return

      this.setTimeScale(0.2)
    }
  }

  onDrag = () => {
    if (!this.input.activePointer.isDown) return

    this.line.draw(this.input.activePointer)
  }

  onRelease = () => {
    this.line.clear()

    if (this.time.timeScale === 1) return

    this.setTimeScale(1)

    const p = this.input.activePointer
    const dist = Phaser.Math.Distance.Between(p.x, p.y, p.downX, p.downY)
    if (dist <= DEAD_ZONE_SIZE) return

    const energy = this.state.get().energy
    const isWeak = dist <= NUDGE_ZONE_SIZE || energy < FULL_LAUNCH_COST
    const cost = isWeak ? WEAK_LAUNCH_COST : FULL_LAUNCH_COST
    if (energy >= cost) {
      this.state.patch((s) => ({ energy: Math.max(s.energy - cost, 0) }))
      this.player.launch(p, !isWeak)
    }
  }

  onCollide = (_p: any, e: any) => {
    const enemy = e as Enemy
    if (!this.player.active || !enemy.active || this.player.isInvulnerable)
      return false

    if (this.player.speed >= PLAYER_MIN_CRUSH_SPEED) {
      this.onHitEnemy(enemy)
    } else {
      this.onGameOver()
    }
    return enemy.health > 0
  }

  onHitEnemy = (enemy: Enemy) => {
    enemy.damage()
    this.player.makeInvulnerable(100)
    this.player.addImpulse(
      enemy.stats.speedBoost + MULTI_SPEED_BOOST * this.state.get().multi,
    )
    this.state.patch((s) => ({
      score: s.score + (s.multi + 1) * BASE_SCORE,
      multi: s.multi + 1,
    }))
  }

  onGameOver = () => {
    this.player.kill()
    this.cameras.main
      .flash(50, 255, 255, 255)
      .shake(300, 0.01)
      .fade(800, 0, 0, 0, true, (_: any, p: number) => {
        if (p === 1) {
          this.state.clearListeners()
          this.scene.restart()
        }
      })
  }

  onWorldBounds = (body: Phaser.Physics.Arcade.Body) => {
    if (body.gameObject === this.player) this.player.onWorldBounds()
  }

  setTimeScale(scale: number) {
    this.time.timeScale = scale
    this.tweens.timeScale = scale
    this.particles.timeScale = scale
    this.player.trailParticles.timeScale = scale
    this.physics.world.timeScale = 1 / scale
  }

  addEnergy = (amount: number) => {
    const counter = { val: 0, last: 0 }
    this.tweens.add({
      targets: counter,
      val: amount,
      duration: 250,
      ease: 'Linear',
      onUpdate: () => {
        const delta = counter.val - counter.last
        counter.last = counter.val
        this.state.patch((s) => ({
          energy: Math.min(s.energy + delta, 100),
        }))
      },
    })
  }
}
