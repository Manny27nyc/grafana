// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export class Profiler {
  panelsRendered = 0;
  enabled?: boolean = undefined;

  renderingCompleted() {
    // add render counter to root scope
    // used by image renderer to know when panel has rendered
    this.panelsRendered += 1;

    // this window variable is used by backend rendering tools to know
    // all panels have completed rendering
    (window as any).panelsRendered = this.panelsRendered;
  }
}

const profiler = new Profiler();
export { profiler };
