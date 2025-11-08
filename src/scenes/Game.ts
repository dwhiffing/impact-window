import { Scene } from 'phaser'
import { HookState, withGlobalState } from 'phaser-hooks'

type IState = {
  score: number
  multi: number
}
export class Game extends Scene {
  private player!: Player
  private enemies!: Phaser.Physics.Arcade.Group
  private line: Line
  public state: HookState<IState>

  constructor() {
    super('Game')
  }

  create(): void {
    const { centerX, height } = this.cameras.main
    this.cameras.main.fadeFrom(800, 0, 0, 0)

    this.player = new Player(this)
    this.enemies = this.physics.add.group({ classType: Enemy })

    this.state = withGlobalState<IState>(this, 'global')
    this.state.set({ score: 0, multi: 0 })
    const scoreText = this.add.text(centerX, height - 12, '0').setOrigin(0.5, 1)
    const multiText = this.add.text(centerX, height - 30, '').setOrigin(0.5, 1)
    this.state.on('change', (newState) => {
      scoreText.setText(newState.score.toString())
      multiText.setText(newState.multi > 0 ? `x${newState.multi}` : '')
    })

    this.enemies.get().spawn()
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => this.enemies.get().spawn(),
      callbackScope: this,
    })

    this.physics.add.overlap(this.player, this.enemies, (p: any, e: any) => {
      const player = p as Player
      const enemy = e as Enemy
      if (player.alpha === 0 || enemy.alpha === 0) return

      if (player.getSpeed() > player.speedThreshold) {
        enemy.setActive(false).setAlpha(0)
        player.addImpulse(100)
        this.state.patch((s) => ({
          score: s.score + (s.multi + 1),
          multi: s.multi + 1,
        }))
      } else {
        player.setActive(false).setAlpha(0)
        this.cameras.main
          .shake(300, 0.01)
          .fade(800, 0, 0, 0, true, (_: any, p: number) => {
            if (p === 1) {
              this.state.clearListeners()
              this.scene.restart()
            }
          })
      }
    })

    this.line = new Line(this)

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return
      this.line.draw(p)
    })

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      this.line.clear()
      this.player.launch(p)
    })
    this.input.on('gameout', () => {
      this.line.clear()
      this.player.launch(this.input.activePointer)
    })
  }

  update = (_time: number, _delta: number): void => {
    this.player.update()
  }
}

class Line extends Phaser.GameObjects.Graphics {
  constructor(scene: Scene) {
    super(scene)
    scene.add.existing(this)
  }

  draw(p: Phaser.Input.Pointer) {
    const dx = p.worldX - p.downX
    const dy = p.worldY - p.downY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const MAX = 50

    const ratio = distance > MAX ? MAX / distance : 1
    const endX = p.downX + dx * ratio
    const endY = p.downY + dy * ratio

    this.clear()
      .lineStyle(2, 0xffffff, 1)
      .moveTo(p.downX, p.downY)
      .lineTo(endX, endY)
      .strokePath()
  }
}

class Enemy extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Scene) {
    super(scene, 0, 0, 10, 0, 360, true, 0xff4444)
    scene.physics.add.existing(this)
    scene.add.existing(this)
  }

  spawn() {
    const { width, height, centerX, centerY } = this.scene.cameras.main

    this.body.setCircle(10).setAllowGravity(false)
    this.setAlpha(1).setActive(true)

    const side = Phaser.Math.Between(0, 3)
    let x = 0
    let y = 0

    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, width)
        y = -50
        break
      case 1: // right
        x = width + 50
        y = Phaser.Math.Between(0, height)
        break
      case 2: // bottom
        x = Phaser.Math.Between(0, width)
        y = height + 50
        break
      case 3: // left
        x = -50
        y = Phaser.Math.Between(0, height)
        break
    }

    this.setPosition(x, y)

    const dx = centerX + Phaser.Math.Between(-50, 50) - x
    const dy = centerY + Phaser.Math.Between(-50, 50) - y
    const angle = Math.atan2(dy, dx)
    const speed = Phaser.Math.Between(20, 100)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)
  }
}

class Player extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game
  speedThreshold: number = 100

  constructor(scene: Game) {
    const { centerX, centerY } = scene.cameras.main
    super(scene, centerX, centerY, 13, 0, 360, true, 0x00ffcc)
    scene.physics.add.existing(this)
    scene.add.existing(this)
    this.body
      .setCircle(13)
      .setImmovable(false)
      .setAllowGravity(false)
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setDamping(true)
      .setDrag(0.1)

    this.body.onWorldBounds = true
    this.scene.physics.world.on(
      'worldbounds',
      (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === this) this.scene.cameras.main.shake(50, 0.015)
      },
      this,
    )
  }

  getSpeed(): number {
    return Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2)
  }

  addImpulse(impulse: number) {
    const speed = this.getSpeed()
    const newSpeed = speed + impulse
    const nx = this.body.velocity.x / speed
    const ny = this.body.velocity.y / speed
    this.body.setVelocity(nx * newSpeed, ny * newSpeed)
  }

  launch(p: Phaser.Input.Pointer) {
    const dx = -(p.x - p.downX)
    const dy = -(p.y - p.downY)

    const angle = Math.atan2(dy, dx)
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speed = Math.min(distance * 6, 800)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)
  }

  update() {
    const speed = this.getSpeed()
    if (speed > this.speedThreshold) {
      this.setFillStyle(0xffff00) // yellow
    } else {
      this.setFillStyle(0x00ffcc) // cyan (original)
      this.scene.state.patch({ multi: 0 })
    }
  }
}
