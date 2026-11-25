import { useFinance, useAppDispatch, toggleTheme, reportError } from "../store";
import { request } from "../services/api";
import { Heading, Card } from "../components/ui";
export default function Settings() {
  const { user, theme } = useFinance(),
    dispatch = useAppDispatch();
  return (
    <>
      <Heading title="Settings" subtitle="Manage your preferences" />
      <Card title="Account">
        <p>{user?.name}</p>
        <p>{user?.email}</p>
        <p>Currency: EUR (demo)</p>
        <button onClick={() => dispatch(toggleTheme())}>
          Switch to {theme === "light" ? "dark" : "light"} theme
        </button>
      </Card>
      <Card title="Review tools">
        <p>
          Mock API only. These controls demonstrate centralized error handling.
        </p>
        <div className="actions">
          {[401, 403, 404, 500].map((code) => (
            <button
              key={code}
              onClick={() =>
                void request(`simulate/${code}`).catch((e) =>
                  dispatch(reportError(e.message)),
                )
              }
            >
              Simulate {code}
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}
