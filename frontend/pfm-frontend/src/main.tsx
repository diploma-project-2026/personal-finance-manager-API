import React, {
  useEffect,
  Suspense,
  lazy,
  Component,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  store,
  useFinance,
  useAppDispatch,
  session,
  load,
  clearError,
  expire,
} from "./store";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import { Loading } from "./components/ui";
import "./styles/main.css";
const Overview = lazy(() => import("./pages/Overview")),
  Transactions = lazy(() => import("./pages/Transactions")),
  Record = lazy(() => import("./pages/Record")),
  Receipts = lazy(() => import("./pages/Receipts")),
  Budgets = lazy(() => import("./pages/Budgets")),
  Goals = lazy(() => import("./pages/Goals")),
  Categories = lazy(() => import("./pages/Categories")),
  Settings = lazy(() => import("./pages/Settings"));
class ErrorBoundary extends Component<
  {
    children: ReactNode;
  },
  {
    failed: boolean;
  }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: Error) {
    console.error(e);
  }
  render() {
    return this.state.failed ? (
      <main>
        <h1>Something went wrong</h1>
        <p>Reload to try again.</p>
        <button onClick={() => location.reload()}>Reload</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const { user, data, checking, pending, error, theme } = useFinance(),
    dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(session());
    const expired = () => dispatch(expire());
    window.addEventListener("pfm:session-expired", expired);
    return () => window.removeEventListener("pfm:session-expired", expired);
  }, [dispatch]);
  useEffect(() => {
    if (user) void dispatch(load());
  }, [user, dispatch]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pfm-theme", theme);
  }, [theme]);
  return (
    <>
      {pending > 0 && (
        <div
          className="global-loading"
          role="status"
          aria-label="Request in progress"
        />
      )}
      {error && (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button
            aria-label="Dismiss error"
            onClick={() => dispatch(clearError())}
          >
            ×
          </button>
        </div>
      )}
      {checking ? (
        <Loading />
      ) : !user ? (
        <Auth />
      ) : !data ? (
        <div className="auth">
          <Loading />
          {pending === 0 && (
            <button onClick={() => dispatch(load())}>Retry loading data</button>
          )}
        </div>
      ) : (
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="record" element={<Record />} />
              <Route path="receipts" element={<Receipts />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="goals" element={<Goals />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <>
                    <h1>Page not found</h1>
                    <Link to="/">Back to overview</Link>
                  </>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);
