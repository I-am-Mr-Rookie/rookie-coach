// The small part of the Chrome extension API this extension uses.
declare namespace chrome {
  namespace tabs {
    interface Tab { id?: number; url?: string }
    function query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Tab[]>;
    function update(tabId: number, properties: { url: string }): Promise<Tab>;
  }
  namespace scripting {
    interface InjectionResult<T> { result?: T }
    function executeScript<Args extends unknown[], Result>(injection: {
      target: { tabId: number };
      func: (...args: Args) => Result;
      args?: Args;
    }): Promise<InjectionResult<Awaited<Result>>[]>;
    function executeScript(injection: { target: { tabId: number }; files: string[] }): Promise<InjectionResult<unknown>[]>;
  }
}
