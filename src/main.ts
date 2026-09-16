import "./styles.css";

type Direction = "higher" | "lower";

interface ForecastSummary {
  horizon: string;
  choice: Direction;
  probabilities: Record<Direction, number>;
}

interface DashboardSummary {
  latest_forecasts: ForecastSummary[];
}

function label(direction: Direction): string {
  return direction === "higher" ? "Higher" : "Lower";
}

async function updateLatestCall(): Promise<void> {
  const target = document.querySelector<HTMLElement>("#latest-call");
  if (!target) return;

  try {
    const response = await fetch("/btc-jev/api/dashboard", { cache: "no-store" });
    if (!response.ok) throw new Error(`Dashboard request failed (${response.status})`);
    const data = (await response.json()) as DashboardSummary;
    const forecast = data.latest_forecasts.find((item) => item.horizon === "15m");
    if (!forecast) return;
    target.textContent = `${label(forecast.choice)} ${Math.round(forecast.probabilities[forecast.choice] * 100)}%`;
  } catch {
    target.textContent = "Temporarily unavailable";
  }
}

void updateLatestCall();

