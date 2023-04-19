import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
  user?: { username: string };
  login({ username }: { username: string }): void;
  logout(): void;
  addBrowserInfo(browserInfo: UAParser.IResult): void;
  addTimezone(timezone: string): void;
  timezone?: string;
  browserInfo?: {
    browser?: string;
    engine?: string;
    operatingSystem?: string;
    device?: string;
    cpu?: string;
    userAgent?: string;
  };
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        addTimezone(timezone) {
          set({
            timezone,
          });
        },
        login({ username: _username }: { username: string }) {
          set({
            user: {
              username: _username,
            },
          });
        },
        logout() {
          set({ user: undefined });
        },
        addBrowserInfo(browserInfo: UAParser.IResult) {
          const { browser, engine, ua, os, device, cpu } = browserInfo;
          set({
            browserInfo: {
              browser: browser.name,
              engine: engine.name,
              userAgent: ua,
              operatingSystem: os.name,
              device: device.model,
              cpu: cpu.architecture,
            },
          });
        },
      }),
      {
        name: "app-storage",
      }
    )
  )
);

// export const useAppStoreBear = create<AppState>((set, get) => ({
//   user: undefined,
//   login({ username: _username }: { username: string }) {
//     set({
//       user: {
//         username: _username,
//       },
//     });
//   },
//   logout() {
//     set({ user: null });
//   },
//   addBrowserInfo(browserInfo: {
//     browser: string;
//     engine: string;
//     ua: string;
//     os: string;
//     device: string;
//     cpu: string;
//   }) {
//     const { browser, engine, ua, os, device, cpu } = browserInfo;
//     set({
//       browser,
//       engine,
//       userAgent: ua,
//       operatingSystem: os,
//       device,
//       cpu,
//     });
//   },
//   browser: null,
//   engine: null,
//   operatingSystem: null,
//   device: null,
//   cpu: null,
//   userAgent: null,
//   debugAllowList: [],
//   location: null,
//   updateAllowList(_allowList: string[]) {
//     set({ debugAllowList: _allowList });
//   },
//   allState() {
//     const state = get();
//     const stateEntries = Object.entries(state);
//     const debugAllowList = get().debugAllowList;
//     const entries = stateEntries
//       .filter((entry) => {
//         const [key, value] = entry;
//         return (
//           debugAllowList.includes(key) &&
//           typeof value !== "function" &&
//           key.match(/^[a-z\d]/i) &&
//           !key.startsWith("allState")
//         );
//       })
//       .map((entry) => {
//         const [key, value] = entry;
//         return {
//           key,
//           value,
//         };
//       });
//     return entries;
//   },
// }));
