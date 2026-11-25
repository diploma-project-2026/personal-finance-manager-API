import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { Data, User } from "../models";
import { request, ApiError } from "../services/api";
export const load = createAsyncThunk("finance/load", () =>
  request<Data>("data"),
);
export const session = createAsyncThunk("finance/session", () =>
  request<User>("auth/me"),
);
export const authenticate = createAsyncThunk(
  "finance/auth",
  async (arg: { path: string; body?: unknown }) =>
    request<User>(arg.path, "POST", arg.body),
);
export const logout = createAsyncThunk("finance/logout", () =>
  request("auth/logout", "POST"),
);
export const mutate = createAsyncThunk(
  "finance/mutate",
  async (
    arg: {
      path: string;
      method: string;
      body?: unknown;
    },
    { rejectWithValue },
  ) => {
    try {
      return await request<Data>(arg.path, arg.method, arg.body);
    } catch (e) {
      return rejectWithValue({
        message: e instanceof Error ? e.message : "Request failed",
        status: e instanceof ApiError ? e.status : 0,
      });
    }
  },
);
interface State {
  data: Data | null;
  user: User | null;
  checking: boolean;
  pending: number;
  error: string;
  theme: "light" | "dark";
}
const initialState: State = {
  data: null,
  user: null,
  checking: true,
  pending: 0,
  error: "",
  theme: localStorage.getItem("pfm-theme") === "dark" ? "dark" : "light",
};
const slice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    clearError: (s) => {
      s.error = "";
    },
    reportError: (
      s,
      a: {
        payload: string;
      },
    ) => {
      s.error = a.payload;
    },
    toggleTheme: (s) => {
      s.theme = s.theme === "light" ? "dark" : "light";
    },
    expire: (s) => {
      s.user = null;
      s.data = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(session.fulfilled, (s, a) => {
      s.user = a.payload;
      s.checking = false;
    })
      .addCase(session.rejected, (s) => {
        s.checking = false;
      })
      .addCase(authenticate.fulfilled, (s, a) => {
        s.user = a.payload;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.data = null;
      })
      .addCase(load.fulfilled, (s, a) => {
        s.data = a.payload;
      })
      .addCase(mutate.fulfilled, (s, a) => {
        s.data = a.payload;
      })
      .addCase(mutate.rejected, (s, a) => {
        const p = a.payload as
          | {
              status?: number;
            }
          | undefined;
        if (p?.status === 401) {
          s.user = null;
          s.data = null;
        }
      })
      .addMatcher(
        (a) => a.type.endsWith("/pending"),
        (s) => {
          s.pending++;
        },
      )
      .addMatcher(
        (a) => a.type.endsWith("/fulfilled") || a.type.endsWith("/rejected"),
        (s, a) => {
          s.pending = Math.max(0, s.pending - 1);
          if (
            a.type.endsWith("/rejected") &&
            a.type !== session.rejected.type
          ) {
            const x = a as unknown as {
              payload?: {
                message: string;
              };
              error?: {
                message: string;
              };
            };
            s.error =
              x.payload?.message || x.error?.message || "Request failed";
          }
        },
      );
  },
});
export const { clearError, reportError, toggleTheme, expire } = slice.actions;
export const store = configureStore({ reducer: { finance: slice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useFinance = () => useSelector((s: RootState) => s.finance);
