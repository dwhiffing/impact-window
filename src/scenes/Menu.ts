import { Scene } from 'phaser'

export class Menu extends Scene {
  constructor() {
    super('Menu')
  }

  create(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          this.scene.start('Game')
          break
      }
    })
  }
}
