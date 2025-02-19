var uniqid = require("uniqid");
const { observer } = require("./util/observer");
const { rndBetween } = require("./util/rnd");
class Booking {
  constructor(fest) {
    this.fest = fest;
    this.timeoutIds = [];
    this.areas = [
      {
        area: "Minty Mountain",
        spots: 400,
        available: rndBetween(0, 400),
        direction: -1,
      },
      {
        area: "Cherry Camp",
        spots: 300,
        available: rndBetween(0, 300),
        direction: -1,
      },
      {
        area: "Licorice Lagoon",
        spots: 100,
        available: rndBetween(0, 100),
        direction: -1,
      },
      {
        area: "Blueberry Beach",
        spots: 200,
        available: rndBetween(0, 200),
        direction: -1,
      },
      {
        area: "Watermelon Wonderland",
        spots: 250,
        available: rndBetween(0, 250),
        direction: -1,
      },
    ];
    //sell out random area
    const areaIndex = rndBetween(0, this.areas.length - 1);
    this.areas[areaIndex].available = 0;
    this.areas[areaIndex].direction = 1;
    this.tick.bind(this);
    observer.subscribe("TICK", () => this.tick());
  }
  getData() {
    return this.areas.map((oneArea) => ({
      area: oneArea.area,
      spots: oneArea.spots,
      available: oneArea.available,
    }));
  }
  reserveSpot(area, amount) {
    let cleanAmount = Number(amount);
    const thisArea = this.areas.filter((a) => a.area === area)[0];
    if (thisArea && thisArea.available >= cleanAmount) {
      thisArea.available -= cleanAmount;
      const timeoutId = setTimeout(() => {
        thisArea.available += cleanAmount;
        clearTimeout(timeoutId);
      }, this.fest.reservationDuration);
      const id = uniqid();
      this.timeoutIds.push({
        clearCallback: timeoutId,
        id: id,
        area: thisArea,
        expires: Date.now() + this.fest.reservationDuration,
        cleanAmount,
      });
      return {
        message: "Reserved",
        id,
        timeout: this.fest.reservationDuration,
      };
    } else {
      return {
        error: "Invalid area, expired id or not enough available spots",
        status: 500,
      };
    }
  }

  fullfillReservation(id) {
    const obj = this.timeoutIds.find((e) => e.id === id);
    if (obj !== undefined && obj.expires > Date.now()) {
      clearTimeout(obj.clearCallback);
      this.timeoutIds.splice(
        this.timeoutIds.findIndex((e) => e.id === id),
        1
      );
      return { message: "Reservation completed" };
    } else {
      return {
        message: "ID not found",
        status: 500,
      };
    }
  }
  tick() {
    /* this.timeoutIds = this.timeoutIds.filter(
      (oneTimeout) => Date.now() < oneTimeout.expires
    ); */
    if (Math.random() * 100 < this.fest.eventChance) {
      const areaIndex = rndBetween(0, this.areas.length - 1);
      this.areas[areaIndex].available += this.areas[areaIndex].direction;
      if (this.areas[areaIndex].available === 0) {
        this.areas[areaIndex].direction = 1;
      } else if (this.areas[areaIndex].available > 20) {
        this.areas[areaIndex].direction = -1;
      }
      /* console.log(
        this.areas.map((a) => a.area + ": " + a.available).join("\n")
      ); */
    }
  }
}
module.exports = { Booking };
