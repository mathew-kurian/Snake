import * as React from "react";
import "./styles.css";
import { Swipeable } from "react-swipeable";
import FocusLock from "react-focus-lock";

function getRandomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function clamp(point: number, max: number) {
  return point < 0 ? max + (point % max) : point % max;
}

interface Point {
  x: number;
  y: number;
}

interface State {
  points: Point[];
  direction: number[];
  food: Point;
}

const directions = {
  "38": [0, -1],
  "40": [0, 1],
  "37": [-1, 0],
  "39": [1, 0],
};

interface CheckboxProps {
  checked: boolean;
}

class Checkbox extends React.Component<CheckboxProps> {
  shouldComponentUpdate(nextProps: CheckboxProps) {
    return this.props.checked !== nextProps.checked;
  }

  render() {
    const { checked } = this.props;

    return (
      // <span className="pretty p-icon p-curve p-jelly">
      <input type="checkbox" readOnly checked={checked} />
      //   <span className="state p-danger">
      //     <i className="icon mdi mdi-bug" />
      //   </span>
      // </span>
    );
  }
}

export default class Snake extends React.Component<
  {
    size: number;
    rows: number;
    columns: number;
    startLength: number;
    onFinish: () => void;
    onLengthChange: (length: number) => void;
    foodSize: number;
  },
  State
> {
  state: State = {
    points: [],
    direction: directions[39],
    food: { x: 0, y: 0 },
  };

  componentDidMount() {
    const { startLength } = this.props;
    const points = [];

    for (let i = startLength - 1; i >= 0; i--) {
      points.push({ x: i, y: 0 });
    }

    this.setState(
      {
        points,
        food: this.getRandomPos_(),
      },
      this.animate_
    );
  }

  private lastAnimate: number = 0;
  private _finished: boolean = false;
  private animate_ = () => {
    if (this._finished === true) {
      return;
    }

    const now = Date.now();
    const last = this.lastAnimate;

    if (now - last < 50) {
      return requestAnimationFrame(this.animate_);
    }

    this.computeState_();
    this.lastAnimate = now;

    requestAnimationFrame(this.animate_);
  };

  componentWillUnmount() {
    this._finished = true;
  }

  private giveFood_(): Point {
    let pos = this.getRandomPos_();

    return pos;
  }

  private getRandomPos_(): Point {
    const { rows, columns } = this.props;
    const x = getRandomBetween(0, columns - 1);
    const y = getRandomBetween(0, rows - 1);
    return { x, y };
  }

  private gameOver_(newHead: Point) {
    const { points } = this.state;
    const some = points
      .slice(1)
      .some((point) => point.x === newHead.x && point.y === newHead.y);
    if (some) {
      console.log("game over");
    }
  }

  private computeState_ = () => {
    const { points, direction, food } = this.state;
    const { rows, columns, onLengthChange, onFinish, foodSize } = this.props;

    const oldHead = points[0];
    // this.gameOver_(oldHead);

    const newHead: Point = {
      x: oldHead.x + direction[0],
      y: oldHead.y + direction[1],
    };

    let newFood = food;
    let newPoints = [newHead];

    if (food.x === newHead.x && food.y === newHead.y) {
      // for Testing
      for (let i = 1; i < foodSize; i++) {
        newPoints.push({
          x: newPoints[i - 1].x + direction[0],
          y: newPoints[i - 1].y + direction[1],
        });
      }

      newPoints = [...newPoints.reverse(), ...points];
      newFood = this.getRandomPos_();

      onLengthChange(newPoints.length);
    } else {
      newPoints = [...newPoints, ...points.slice(0, points.length - 1)];
    }

    for (const point of newPoints) {
      point.x = clamp(point.x, columns);
      point.y = clamp(point.y, rows);
    }

    const head = newPoints[0];

    for (let i = 1; i < newPoints.length; i++) {
      const point = newPoints[i];

      if (head.x === point.x && head.y === point.y) {
        this._finished = true;
        onFinish();
      }
    }

    this.setState({ points: newPoints, food: newFood });
  };

  private setDirection(directionNum: number) {
    const currDirection = this.state.direction;
    // @ts-ignore
    const nextDirection = directions[directionNum];

    if (
      currDirection[0] + nextDirection[0] === 0 &&
      +currDirection[1] + nextDirection[1] === 0
    ) {
      return;
    }

    this.setState({ direction: nextDirection });
  }

  render() {
    const { points, food, direction } = this.state;
    const { rows, size = 12, columns } = this.props;
    const elementRows: React.ReactElement[] = [];

    for (let y = 0; y < rows; y++) {
      const elementRow: React.ReactElement[] = [];

      for (let x = 0; x < columns; x++) {
        const point = points.filter((point) => point.x === x && point.y === y);

        elementRow.push(
          <Checkbox
            key={(x + 1) * (y + 1)}
            checked={point.length > 0 || (food.x === x && food.y === y)}
          />
        );
      }

      elementRows.push(
        <div className="canvas" style={{ height: size }} key={y}>
          {elementRow}
        </div>
      );
    }

    const WrapComponent = FocusLock;

    return (
      <Swipeable
        style={{ textAlign: "center" }}
        onSwipedLeft={() => this.setDirection(37)}
        onSwipedRight={() => this.setDirection(39)}
        onSwipedUp={() => this.setDirection(38)}
        onSwipedDown={() => this.setDirection(40)}
      >
        <WrapComponent>
          <div
            onKeyDown={({ keyCode }: React.KeyboardEvent) => {
              if (37 <= keyCode && keyCode <= 40) {
                this.setDirection(keyCode);
              }
            }}
            style={{
              width: size * columns,
              height: size * rows,
              margin: "0 auto",
            }}
          >
            {elementRows}
          </div>
        </WrapComponent>
      </Swipeable>
    );
  }
}
