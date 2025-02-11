class Chair {
  #index;
  #player;
  constructor(index) {
    this.#index = index;
    this.#player = null;
  }

  get player() {
    return this.player;
  }

  set player(player) {
    this.player = player;
  }
}
