import Column from "./column";
import RenderStation from "./renderStation";

class Station {
  #queue = [];
  #fillings = [];
  #ready = [];

  constructor(type, renderApp = null) {
    this.type = type;
    this.renderApp = renderApp;
    this.renderStation = null;
  }

  get fillings() {
    return this.#fillings;
  }

  get queue() {
    return this.#queue;
  }

  init() {
    this.createFillings();
    this.render();

    setInterval(() => {
      this.checkQueueToFilling();
    }, 2000);
  }

  createFillings() {
    for (const option of this.type) {
      if (!option.count) {
        option.count = 1;
      }
      if (!option.speed) {
        option.speed = 5;
      }

      for (let i = 0; i < option.count; i++) {
        this.#fillings.push(new Column(option.type, option.speed));
      }
    }
  }

  render() {
    if (this.renderApp) {
      this.renderStation = new RenderStation(this.renderApp, this);
    }
  }

  checkQueueToFilling() {
    if (this.#queue.length) {
      for (let i = 0; i < this.#queue.length; i++) {
        for (let j = 0; j < this.#fillings.length; j++) {
          if (!this.#fillings[j].car &&
            this.#queue[i].typeFuel === this.#fillings[j].type) {
            this.#fillings[j].car = this.#queue.splice(i, 1)[0];
            this.fillingGo(this.#fillings[j]);
            this.renderStation.renderStation();
            break;
          }
        }
      }
    }
  }

  fillingGo(column) {
    const car = column.car;
    const needPetrol = car.needPetrol;
    let nowTank = car.nowTank;
    const timerId = setInterval(() => {
      nowTank += column.speed;

      if(nowTank >= car.maxTank) {
        clearInterval(timerId);
        const total = nowTank - needPetrol;
        car.fillUp();
        column.car = null;
        this.leaveClient({car, total});
      }
    }, 1000);
  }

  leaveClient({car, total}) {
    this.#ready.push(car);
    this.renderStation.renderStation();
  }

  addCarQueue(car) {
    this.#queue.push(car);
    this.renderStation.renderStation();
  }
}

export default Station;
