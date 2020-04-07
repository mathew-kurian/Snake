import * as React from "react";
import * as ReactDOM from "react-dom";
import Snake from "./Snake";
import Grid from "react-fast-grid";

const rootElement = document.getElementById("root");

interface Score {
  name: string;
  score: number;
}

interface BoostrapState {
  width: number;
  height: number;
  size: number;
  score: number;
  scores: Score[];
}

class Bootstrap extends React.Component<{}, BoostrapState> {
  state: BoostrapState = {
    width: 0,
    height: 0,
    size: 0,
    score: 0,
    scores: []
  };

  private _getContainerSize(): { width: number; height: number } {
    let width: number = 0,
      height: number = 0;

    const node: HTMLDivElement | null = this._container.current;

    if (node != null) {
      const rect = node.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    return { width, height };
  }

  private _getCheckboxSize(): number {
    let width: number = 0;

    const node: HTMLDivElement | null = this._checkbox.current;

    if (node != null) {
      const rect = node.getBoundingClientRect();
      width = rect.width;
    }

    return width;
  }

  private _setSize = () => {
    this.setState(this._getContainerSize());
  };

  componentDidMount() {
    window.addEventListener("resize", this._setSize);

    this.setState({
      size: this._getCheckboxSize(),
      ...this._getContainerSize(),
      scores: this.getScores()
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._setSize);
  }

  private getScores(): Score[] {
    const scoreStr: string = decodeURIComponent(
      new URLSearchParams(window.location.search.substr(1)).get("s") || ""
    );

    try {
      const scores = JSON.parse(scoreStr);

      if (Array.isArray(scores)) {
        return scores.filter(
          score => score.score > 0 && typeof score.name === "string"
        );
      }
    } catch (e) {
      // ignore
    }

    return [];
  }

  private addScore(score: Score) {
    const { scores } = this.state;

    scores.push(score);
    scores.sort((a, b) => b.score - a.score);

    const searchParams = new URLSearchParams();
    searchParams.set(
      "s",
      encodeURIComponent(JSON.stringify(scores.slice(0, 3)))
    );

    const url = new URL(window.location.href);
    url.search = `?${searchParams.toString()}`;

    window.history.pushState({}, document.title, url.href);

    this.setState({ scores });
  }

  private _container: React.RefObject<HTMLDivElement> = React.createRef();
  private _checkbox: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const { size, width, height, score } = this.state;
    const rows = Math.floor((height - size) / size) || 1;
    const columns = Math.floor((width - size) / size) || 1;

    return (
      <Grid
        container
        direction="column"
        style={{ height: window.innerHeight, width: window.innerWidth }}
      >
        <Grid item>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            style={{
              padding: 5,
              paddingRight: 10,
              background: "orange",
              color: "#fff",
              marginBottom: 10
            }}
          >
            <Grid item>
              <div
                style={{ fontSize: "2em", fontFamily: "Orbitron, san-serif" }}
              >
                COVID-19
              </div>
              Swipe or use the arrow keys to capture the bug!
            </Grid>
            <Grid item>
              <div
                style={{
                  fontSize: "0.9em",
                  fontFamily: "Orbitron, san-serif"
                }}
              >
                SCORE
              </div>
              <div
                style={{
                  fontSize: "1.3em",
                  fontFamily: "Orbitron, san-serif",
                  fontWeight: "bold"
                }}
              >
                {score}
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <div ref={this._container} style={{ width: "100%", height: "100%" }}>
            {width === 0 ||
              (height === 0 && (
                <Grid container alignItems="center" justify="center">
                  <Grid item>Loading...</Grid>
                </Grid>
              ))}
            {size === 0 && <input ref={this._checkbox} type="checkbox" />}
            {size !== 0 && width > 0 && height > 0 && (
              <Snake
                size={size}
                rows={rows}
                columns={columns}
                startLength={3}
                onFinish={() => {
                  throw Error("Finished");
                }}
                onLengthChange={length => this.setState({ score: length - 3 })}
              />
            )}
          </div>
        </Grid>
        <Grid
          item
          alignContent="center"
          style={{
            padding: 5,
            background: "darkorange",
            color: "#fff"
          }}
        >
          <div>
            Stay safe and get updates for 🦠at{" "}
            <a href="https://coronavirus.1point3acres.com/" target="_blank">
              COVID19 US & Canada
            </a>
          </div>
        </Grid>
      </Grid>
    );
  }
}

const exec = () => {
  // @ts-ignore
  ReactDOM.createRoot(rootElement).render(<Bootstrap />);
};

if (["interactive", "complete"].indexOf(document.readyState) > -1) {
  exec();
} else {
  document.addEventListener("DOMContentLoaded", exec);
}
