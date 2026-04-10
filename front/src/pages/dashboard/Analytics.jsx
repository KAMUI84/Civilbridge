import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui";
import adminAnalyticsService from "../../services/adminAnalyticsService";
import SEO from "../../components/seo/SEO";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function LoadingSkeleton() {
  return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={styles.skeletonCard} />
        ))}
      </div>
      <div style={styles.skeletonChart} />
      <div style={styles.skeletonPanels}>
        <div style={styles.skeletonPanel} />
        <div style={styles.skeletonPanel} />
        <div style={styles.skeletonPanel} />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>!</div>
      <h3 style={styles.stateTitle}>Failed to load analytics</h3>
      <p style={styles.stateText}>{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyState({ message, onRetry }) {
  return (
    <div style={styles.stateCard}>
      <div style={styles.stateIcon}>0</div>
      <h3 style={styles.stateTitle}>No analytics data yet</h3>
      <p style={styles.stateText}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>Refresh</Button>
    </div>
  );
}

function MetricCard({ title, value, helper, icon }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricHeader}>
        <h3 style={styles.metricTitle}>{title}</h3>
        <span style={styles.metricIcon}>{icon}</span>
      </div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricChange}>{helper}</div>
      <div style={styles.metricSparkline}>
        <div style={styles.sparklinePositive} />
      </div>
    </div>
  );
}

function BarChart({ title, rows, valueKey, labelKey, formatter = (value) => value }) {
  const maxValue = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>{title}</h4>
      <div style={styles.chartArea}>
        <div style={styles.yAxis}>
          <div style={styles.yAxisLabel}>{formatter(maxValue)}</div>
          <div style={styles.yAxisLabel}>{formatter(Math.round(maxValue / 2))}</div>
          <div style={styles.yAxisLabel}>{formatter(0)}</div>
        </div>
        <div style={styles.chartBars}>
          {rows.map((row) => (
            <div key={row[labelKey]} style={styles.barContainer}>
              <div style={styles.barLabel}>{row[labelKey]}</div>
              <div style={styles.barWrapper}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${(Number(row[valueKey] || 0) / maxValue) * 200}px`,
                    backgroundColor: "#00f2ff",
                  }}
                />
              </div>
              <div style={styles.barValue}>{formatter(row[valueKey])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30days");
  const [activeChart, setActiveChart] = useState("revenue");
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  const loadAnalytics = useCallback(async () => {
    try {
      setState({ loading: true, error: "" });
      const [overviewResponse, healthResponse] = await Promise.all([
        adminAnalyticsService.getOverview(),
        adminAnalyticsService.getPlatformHealth(),
      ]);

      setOverview(overviewResponse);
      setHealth(healthResponse);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({
        loading: false,
        error: error.message || "Unable to fetch analytics right now.",
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAnalytics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics, timeRange]);

  const metrics = useMemo(() => {
    if (!overview) return null;

    const totalRevenue = Number(overview.revenue?.totalConfirmedRWF || 0);
    const totalProjects = Number(overview.projects?.total || 0);
    const completedProjects =
      overview.projects?.byStatus?.find((item) => item.status === "COMPLETED")?.count || 0;

    return {
      totalRevenue,
      activeProjects:
        overview.projects?.byStatus?.find((item) => item.status === "IN_PROGRESS")?.count ||
        totalProjects,
      totalUsers: Number(overview.users?.total || 0),
      completionRate: totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0,
      avgProjectValue: totalProjects ? Math.round(totalRevenue / totalProjects) : 0,
      monthlyGrowth: Number(overview.users?.newThisMonth || 0),
      systemHealth: Number(health?.transactions24h?.successRate?.replace("%", "") || 100),
      responseTime: Number(health?.node?.memoryMB || 0),
    };
  }, [health, overview]);

  const chartData = useMemo(() => {
    if (!overview) {
      return {
        revenue: [],
        users: [],
        projects: [],
        performance: [],
      };
    }

    return {
      revenue: (overview.revenue?.byProvider || []).map((item) => ({
        label: item.provider || "unknown",
        value: Number(item.total || 0),
      })),
      users: (overview.users?.byRole || []).map((item) => ({
        label: item.role,
        value: Number(item.count || 0),
      })),
      projects: (overview.projects?.byStatus || []).map((item) => ({
        label: item.status,
        value: Number(item.count || 0),
      })),
      performance: [
        {
          metric: "Transaction Success",
          value: health?.transactions24h?.successRate || "0%",
          helper: `${health?.transactions24h?.succeeded || 0} succeeded`,
        },
        {
          metric: "Active Users 24h",
          value: health?.activeUsers24h || 0,
          helper: "Users logged in during the last day",
        },
        {
          metric: "Server Uptime",
          value: `${health?.uptime?.days || 0}d`,
          helper: `${health?.uptime?.seconds || 0} seconds`,
        },
      ],
    };
  }, [health, overview]);

  const topProjectLikeRows = overview?.projects?.byType || [];
  const activityRows = overview?.users?.byRole || [];

  if (state.loading) return <LoadingSkeleton />;
  if (state.error) return <ErrorState message={state.error} onRetry={loadAnalytics} />;
  if (!overview || !metrics) {
    return (
      <EmptyState
        message="Analytics will appear here once users, projects, and transactions start flowing through the platform."
        onRetry={loadAnalytics}
      />
    );
  }

  const isEmpty =
    !overview.users?.total &&
    !overview.projects?.total &&
    !overview.revenue?.totalConfirmedRWF;

  if (isEmpty) {
    return (
      <EmptyState
        message="The admin analytics endpoint responded, but there is not enough activity to populate the dashboard yet."
        onRetry={loadAnalytics}
      />
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case "users":
        return (
          <BarChart
            title="Users by Role"
            rows={chartData.users}
            labelKey="label"
            valueKey="value"
          />
        );
      case "projects":
        return (
          <BarChart
            title="Projects by Status"
            rows={chartData.projects}
            labelKey="label"
            valueKey="value"
          />
        );
      case "performance":
        return (
          <div style={styles.performanceChart}>
            {chartData.performance.map((item) => (
              <div key={item.metric} style={styles.performanceMetric}>
                <div style={styles.performanceMetricHeader}>
                  <div style={styles.performanceMetricName}>{item.metric}</div>
                  <div style={styles.performanceMetricValue}>{item.value}</div>
                </div>
                <div style={styles.performanceMetricTarget}>{item.helper}</div>
              </div>
            ))}
          </div>
        );
      case "revenue":
      default:
        return (
          <BarChart
            title="Revenue by Provider"
            rows={chartData.revenue}
            labelKey="label"
            valueKey="value"
            formatter={(value) => {
              if (typeof value === "number") {
                return `${Math.round(value / 1000)}k`;
              }
              return value;
            }}
          />
        );
    }
  };

  return (
    <div style={styles.container}>
      <SEO title="Analytics" noindex />
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics Dashboard</h1>
        <p style={styles.subtitle}>Comprehensive insights and performance metrics</p>
      </div>

      <div style={styles.timeRangeSelector}>
        <select
          value={timeRange}
          onChange={(event) => setTimeRange(event.target.value)}
          style={styles.timeRangeSelect}
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="1year">Last year</option>
        </select>
        <Button variant="secondary" onClick={loadAnalytics}>Refresh</Button>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          helper={`${overview.revenue?.byStatus?.length || 0} transaction states tracked`}
          icon="$$"
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          helper={`${overview.projects?.total || 0} total projects`}
          icon="PM"
        />
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          helper={`${overview.users?.newThisWeek || 0} new this week`}
          icon="US"
        />
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          helper={`${overview.projects?.byStatus?.find((item) => item.status === "COMPLETED")?.count || 0} completed`}
          icon="OK"
        />
      </div>

      <div style={styles.chartsSection}>
        <div style={styles.chartTabs}>
          {[
            ["revenue", "Revenue"],
            ["users", "Users"],
            ["projects", "Projects"],
            ["performance", "Performance"],
          ].map(([key, label]) => (
            <button
              key={key}
              style={{
                ...styles.chartTab,
                ...(activeChart === key ? styles.chartTabActive : {}),
              }}
              onClick={() => setActiveChart(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={styles.chartContent}>{renderChart()}</div>
      </div>

      <div style={styles.analyticsGrid}>
        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>Project Distribution</h3>
          <div style={styles.topProjects}>
            {topProjectLikeRows.length ? (
              topProjectLikeRows.map((item, index) => (
                <div key={item.type} style={styles.projectItem}>
                  <div style={styles.projectRank}>{index + 1}</div>
                  <div style={styles.projectInfo}>
                    <div style={styles.projectName}>{item.type}</div>
                    <div style={styles.projectValue}>{item.count} projects</div>
                  </div>
                  <div style={styles.projectProgress}>
                    {overview.projects?.total
                      ? `${Math.round((item.count / overview.projects.total) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.inlineEmpty}>No project distribution data yet.</div>
            )}
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>User Activity</h3>
          <div style={styles.userActivity}>
            {activityRows.length ? (
              activityRows.map((item) => (
                <div key={item.role} style={styles.activityItem}>
                  <div style={styles.activityIcon}>{item.role.slice(0, 2)}</div>
                  <div style={styles.activityInfo}>
                    <div style={styles.activityLabel}>{item.role}</div>
                    <div style={styles.activityValue}>{item.count} users</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.inlineEmpty}>No user activity data yet.</div>
            )}
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>System Performance</h3>
          <div style={styles.performanceMetrics}>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>Transaction Success</div>
              <div style={styles.performanceValue}>{health?.transactions24h?.successRate || "0%"}</div>
              <div style={styles.performanceBar}>
                <div
                  style={{
                    ...styles.performanceBarFill,
                    width: `${Number(health?.transactions24h?.successRate?.replace("%", "") || 0)}%`,
                  }}
                />
              </div>
            </div>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>Active Users 24h</div>
              <div style={styles.performanceValue}>{health?.activeUsers24h || 0}</div>
              <div style={styles.performanceBar}>
                <div
                  style={{
                    ...styles.performanceBarFill,
                    width: `${Math.min(100, Number(health?.activeUsers24h || 0))}%`,
                  }}
                />
              </div>
            </div>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>Recent Audit Events</div>
              <div style={styles.performanceValue}>{health?.recentAuditActivity?.last60min || 0}</div>
              <div style={styles.performanceBar}>
                <div
                  style={{
                    ...styles.performanceBarFill,
                    width: `${Math.min(100, Number(health?.recentAuditActivity?.last60min || 0) * 5)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "100%",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--text-color)",
  },
  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "var(--text-muted)",
  },
  timeRangeSelector: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  timeRangeSelect: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #1a1a1a",
    background: "var(--card-bg)",
    color: "var(--text-color)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  metricCard: {
    background: "var(--card-bg)",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  metricTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-muted)",
  },
  metricIcon: {
    fontSize: "12px",
    color: "#00f2ff",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  metricValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#00f2ff",
    marginBottom: "8px",
  },
  metricChange: {
    fontSize: "12px",
    color: "#22c55e",
  },
  metricSparkline: {
    marginTop: "12px",
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  sparklinePositive: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, #00f2ff, #22c55e)",
  },
  chartsSection: {
    background: "var(--card-bg)",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
  },
  chartTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },
  chartTab: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #1a1a1a",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  chartTabActive: {
    color: "#00f2ff",
    borderColor: "#00f2ff",
  },
  chartContent: {
    minHeight: "280px",
  },
  chartContainer: {
    width: "100%",
  },
  chartTitle: {
    margin: "0 0 20px",
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--text-color)",
  },
  chartArea: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    gap: "16px",
    alignItems: "end",
  },
  yAxis: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "220px",
  },
  yAxisLabel: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  chartBars: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "16px",
    alignItems: "end",
  },
  barContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  barLabel: {
    fontSize: "12px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  barWrapper: {
    width: "100%",
    minHeight: "200px",
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
  },
  bar: {
    width: "48px",
    borderRadius: "12px 12px 0 0",
    minHeight: "8px",
  },
  barValue: {
    fontSize: "12px",
    color: "var(--text-color)",
    fontWeight: 600,
  },
  performanceChart: {
    display: "grid",
    gap: "16px",
  },
  performanceMetric: {
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    padding: "16px",
  },
  performanceMetricHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
  },
  performanceMetricName: {
    color: "var(--text-color)",
    fontWeight: 600,
  },
  performanceMetricValue: {
    color: "#00f2ff",
    fontWeight: 700,
  },
  performanceMetricTarget: {
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  analyticsCard: {
    background: "var(--card-bg)",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    padding: "24px",
  },
  analyticsTitle: {
    margin: "0 0 20px",
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--text-color)",
  },
  topProjects: {
    display: "grid",
    gap: "12px",
  },
  projectItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  projectRank: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(0, 242, 255, 0.1)",
    color: "#00f2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    color: "var(--text-color)",
    fontWeight: 600,
    marginBottom: "4px",
  },
  projectValue: {
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  projectProgress: {
    color: "#22c55e",
    fontWeight: 700,
  },
  userActivity: {
    display: "grid",
    gap: "12px",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  activityIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00f2ff",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    color: "var(--text-color)",
    marginBottom: "4px",
  },
  activityValue: {
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  performanceMetrics: {
    display: "grid",
    gap: "16px",
  },
  performanceItem: {
    display: "grid",
    gap: "8px",
  },
  performanceLabel: {
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  performanceValue: {
    color: "var(--text-color)",
    fontWeight: 600,
  },
  performanceBar: {
    height: "8px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  performanceBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00f2ff, #6366f1)",
  },
  loadingWrap: {
    display: "grid",
    gap: "24px",
  },
  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  skeletonCard: {
    height: "140px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  },
  skeletonChart: {
    height: "320px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  },
  skeletonPanels: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  skeletonPanel: {
    height: "220px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  },
  stateCard: {
    minHeight: "360px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    textAlign: "center",
    background: "var(--card-bg)",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    padding: "32px",
  },
  stateIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "1px solid #1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00f2ff",
    fontWeight: 700,
    fontSize: "24px",
  },
  stateTitle: {
    margin: 0,
    color: "var(--text-color)",
  },
  stateText: {
    margin: 0,
    color: "var(--text-muted)",
    maxWidth: "480px",
  },
  inlineEmpty: {
    color: "var(--text-muted)",
    fontSize: "14px",
  },
};
