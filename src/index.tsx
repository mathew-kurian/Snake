import * as React from "react";
import * as ReactDOM from "react-dom";
import Snake from "./Snake";
import Grid from "react-fast-grid";
//@ts-ignore
import GitHubButton from "react-github-button";

require("react-github-button/assets/style.css");

const rootElement = document.getElementById("root");

const MAX_HIGH_SCORES = 3;

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
  dialogType: "score" | null;
}

class Bootstrap extends React.Component<{}, BoostrapState> {
  state: BoostrapState = {
    width: 0,
    height: 0,
    size: 0,
    score: 0,
    scores: [],
    dialogType: "score",
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
      scores: this.getScores(),
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
          (score) => score.score > -1 && typeof score.name === "string"
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
      encodeURIComponent(JSON.stringify(scores.slice(0, MAX_HIGH_SCORES)))
    );

    const url = new URL(window.location.href);
    url.search = `?${searchParams.toString()}`;

    window.history.pushState({}, document.title, url.href);

    this.setState({ scores });
  }

  private _container: React.RefObject<HTMLDivElement> = React.createRef();
  private _checkbox: React.RefObject<HTMLInputElement> = React.createRef();
  private _name: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const { size, width, height, score, dialogType, scores } = this.state;
    const rows = Math.floor((height - size) / size) || 1;
    const columns = Math.floor((width - size) / size) || 1;

    return (
      <Grid
        container
        direction="column"
        style={{
          height: window.innerHeight,
          width: window.innerWidth,
          backgroundColor: dialogType ? "orange" : "white",
        }}
      >
        <Grid item>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            style={{
              padding: 15,
              background: "orange",
              color: "#fff",
            }}
          >
            <Grid item xs={6}>
              <div className="h1">COVID-19</div>
              Swipe or use the arrow keys to capture the bug!
            </Grid>
            <Grid item xs={6} justify="space-between" alignItems="center">
              <Grid container>
                <Grid item xs>
                  <div className="h3">SCORE</div>
                  <div className="h1">{score}</div>
                </Grid>
                <Grid item xs={4}>
                  <button
                    className="button"
                    onClick={() => this.setState({ dialogType: "score" })}
                  >
                    Scores
                  </button>
                </Grid>
              </Grid>
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
            {size !== 0 && width > 0 && height > 0 && dialogType === null && (
              <Snake
                size={size}
                rows={rows}
                columns={columns}
                startLength={3}
                onFinish={() => {
                  this.setState({ dialogType: "score" });
                }}
                onLengthChange={(length) =>
                  this.setState({ score: length - 3 })
                }
              />
            )}
            {size !== 0 && width > 0 && height > 0 && dialogType !== null && (
              <Grid
                container
                className="scores"
                alignItems="center"
                justify="flex-end"
              >
                <Grid item xs={12}></Grid>
                {scores.map((score, index) => (
                  <Grid container key={index} alignItems="stretch">
                    <Grid
                      className="name"
                      item
                      alignItems="center"
                      md={6}
                      xs={10}
                    >
                      {score.name}
                    </Grid>
                    <Grid
                      className="score"
                      alignItems="center"
                      justify="center"
                      item
                      md={6}
                      xs={2}
                    >
                      {score.score}
                    </Grid>
                  </Grid>
                ))}
                {scores.length < MAX_HIGH_SCORES ||
                scores.filter((s) => s.score < score).length > 0 ? (
                  <Grid container alignItems="stretch" justify="flex-end">
                    <Grid className="submit" item alignItems="center" xs={6}>
                      <input
                        placeholder="Enter your name"
                        defaultValue="Anonymous"
                        ref={this._name}
                      />
                    </Grid>
                    <Grid
                      className="score"
                      alignItems="center"
                      justify="center"
                      item
                      xs={2}
                    >
                      {score}
                    </Grid>
                    <Grid
                      className="submit"
                      justify="center"
                      alignItems="center"
                      item
                      md={3}
                      xs={4}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <button
                            onClick={() =>
                              this.addScore({
                                score,
                                name: this._name.current?.value || "Anonymous",
                              })
                            }
                          >
                            Submit
                          </button>
                        </Grid>
                        <Grid item xs={6}>
                          <button
                            onClick={() => this.setState({ dialogType: null })}
                          >
                            Restart
                          </button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container alignItems="stretch">
                    <Grid className="submit" item xs={12}>
                      <button
                        onClick={() => this.setState({ dialogType: null })}
                      >
                        Restart
                      </button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            )}
          </div>
        </Grid>
        <Grid
          item
          alignContent="center"
          style={{
            padding: 5,
            background: "darkorange",
            color: "#fff",
          }}
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
            justify="space-between"
          >
            <Grid item>
              Stay safe and get updates for 🦠at{" "}
              <a href="https://coronavirus.1point3acres.com/" target="_blank">
                COVID19 US & Canada;
              </a>
            </Grid>
            <Grid item>
              <GitHubButton
                type="stargazers"
                size="small"
                namespace="mathew-kurian"
                repo="Snake"
              />
            </Grid>
          </Grid>
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
