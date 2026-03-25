// Advanced Analytics with Charts and Metrics
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Analytics() {
  const { dashboardConfig } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [activeChart, setActiveChart] = useState('revenue');
  const [metrics, setMetrics] = useState({});

  // Mock analytics data
  const mockMetrics = {
    totalRevenue: 124500,
    activeProjects: 89,
    totalUsers: 1247,
    completionRate: 87,
    avgProjectValue: 1400,
    monthlyGrowth: 12.5,
    systemHealth: 99.9,
    responseTime: 124
  };

  const mockChartData = {
    revenue: [
      { month: 'Jan', revenue: 85000, projects: 12 },
      { month: 'Feb', revenue: 92000, projects: 15 },
      { month: 'Mar', revenue: 124500, projects: 18 }
    ],
    users: [
      { month: 'Jan', users: 980, newUsers: 45 },
      { month: 'Feb', users: 1100, newUsers: 120 },
      { month: 'Mar', users: 1247, newUsers: 147 }
    ],
    projects: [
      { month: 'Jan', completed: 8, ongoing: 12 },
      { month: 'Feb', completed: 11, ongoing: 15 },
      { month: 'Mar', completed: 14, ongoing: 18 }
    ],
    performance: [
      { metric: 'Response Time', value: 124, target: 150, unit: 'ms' },
      { metric: 'Uptime', value: 99.9, target: 99.5, unit: '%' },
      { metric: 'Error Rate', value: 0.8, target: 1.0, unit: '%' },
      { metric: 'Satisfaction', value: 4.6, target: 4.5, unit: '⭐' }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return <RevenueChart data={mockChartData.revenue} />;
      case 'users':
        return <UsersChart data={mockChartData.users} />;
      case 'projects':
        return <ProjectsChart data={mockChartData.projects} />;
      case 'performance':
        return <PerformanceChart data={mockChartData.performance} />;
      default:
        return <RevenueChart data={mockChartData.revenue} />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics Dashboard</h1>
        <p style={styles.subtitle}>Comprehensive insights and performance metrics</p>
      </div>

      {/* Time Range Selector */}
      <div style={styles.timeRangeSelector}>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={styles.timeRangeSelect}
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="1year">Last year</option>
        </select>
        <button style={styles.exportButton}>Export Report</button>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <h3 style={styles.metricTitle}>Total Revenue</h3>
            <span style={styles.metricIcon}>💰</span>
          </div>
          <div style={styles.metricValue}>${metrics.totalRevenue.toLocaleString()}</div>
          <div style={styles.metricChange}>+12.5% from last month</div>
          <div style={styles.metricSparkline}>
            <div style={styles.sparklinePositive} />
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <h3 style={styles.metricTitle}>Active Projects</h3>
            <span style={styles.metricIcon}>🏗️</span>
          </div>
          <div style={styles.metricValue}>{metrics.activeProjects}</div>
          <div style={styles.metricChange}>+23% from last month</div>
          <div style={styles.metricSparkline}>
            <div style={styles.sparklinePositive} />
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <h3 style={styles.metricTitle}>Total Users</h3>
            <span style={styles.metricIcon}>👥</span>
          </div>
          <div style={styles.metricValue}>{metrics.totalUsers.toLocaleString()}</div>
          <div style={styles.metricChange}>+8.2% from last month</div>
          <div style={styles.metricSparkline}>
            <div style={styles.sparklinePositive} />
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <h3 style={styles.metricTitle}>Completion Rate</h3>
            <span style={styles.metricIcon}>✅</span>
          </div>
          <div style={styles.metricValue}>{metrics.completionRate}%</div>
          <div style={styles.metricChange}>+3.1% from last month</div>
          <div style={styles.metricSparkline}>
            <div style={styles.sparklinePositive} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.chartsSection}>
        {/* Chart Tabs */}
        <div style={styles.chartTabs}>
          <button
            style={{
              ...styles.chartTab,
              ...(activeChart === 'revenue' && styles.chartTabActive)
            }}
            onClick={() => setActiveChart('revenue')}
          >
            📈 Revenue
          </button>
          <button
            style={{
              ...styles.chartTab,
              ...(activeChart === 'users' && styles.chartTabActive)
            }}
            onClick={() => setActiveChart('users')}
          >
            👥 Users
          </button>
          <button
            style={{
              ...styles.chartTab,
              ...(activeChart === 'projects' && styles.chartTabActive)
            }}
            onClick={() => setActiveChart('projects')}
          >
            🏗️ Projects
          </button>
          <button
            style={{
              ...styles.chartTab,
              ...(activeChart === 'performance' && styles.chartTabActive)
            }}
            onClick={() => setActiveChart('performance')}
          >
            ⚡ Performance
          </button>
        </div>

        {/* Chart Content */}
        <div style={styles.chartContent}>
          {renderChart()}
        </div>
      </div>

      {/* Additional Analytics */}
      <div style={styles.analyticsGrid}>
        {/* Top Projects */}
        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>Top Projects</h3>
          <div style={styles.topProjects}>
            <div style={styles.projectItem}>
              <div style={styles.projectRank}>1</div>
              <div style={styles.projectInfo}>
                <div style={styles.projectName}>Bridge Design Project</div>
                <div style={styles.projectValue}>$50,000</div>
              </div>
              <div style={styles.projectProgress}>100%</div>
            </div>
            <div style={styles.projectItem}>
              <div style={styles.projectRank}>2</div>
              <div style={styles.projectInfo}>
                <div style={styles.projectName}>Road Construction</div>
                <div style={styles.projectValue}>$120,000</div>
              </div>
              <div style={styles.projectProgress}>75%</div>
            </div>
            <div style={styles.projectItem}>
              <div style={styles.projectRank}>3</div>
              <div style={styles.projectInfo}>
                <div style={styles.projectName}>Infrastructure Audit</div>
                <div style={styles.projectValue}>$30,000</div>
              </div>
              <div style={styles.projectProgress}>90%</div>
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>User Activity</h3>
          <div style={styles.userActivity}>
            <div style={styles.activityItem}>
              <div style={styles.activityIcon}>👤</div>
              <div style={styles.activityInfo}>
                <div style={styles.activityLabel}>New Registrations</div>
                <div style={styles.activityValue}>147 this month</div>
              </div>
            </div>
            <div style={styles.activityItem}>
              <div style={styles.activityIcon}>🔄</div>
              <div style={styles.activityInfo}>
                <div style={styles.activityLabel}>Daily Active Users</div>
                <div style={styles.activityValue}>342</div>
              </div>
            </div>
            <div style={styles.activityItem}>
              <div style={styles.activityIcon}>⏱️</div>
              <div style={styles.activityInfo}>
                <div style={styles.activityLabel}>Avg Session Time</div>
                <div style={styles.activityValue}>24 min</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div style={styles.analyticsCard}>
          <h3 style={styles.analyticsTitle}>System Performance</h3>
          <div style={styles.performanceMetrics}>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>System Health</div>
              <div style={styles.performanceValue}>{metrics.systemHealth}%</div>
              <div style={styles.performanceBar}>
                <div style={{ ...styles.performanceBarFill, width: `${metrics.systemHealth}%` }} />
              </div>
            </div>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>Response Time</div>
              <div style={styles.performanceValue}>{metrics.responseTime}ms</div>
              <div style={styles.performanceBar}>
                <div style={{ ...styles.performanceBarFill, width: '80%' }} />
              </div>
            </div>
            <div style={styles.performanceItem}>
              <div style={styles.performanceLabel}>Error Rate</div>
              <div style={styles.performanceValue}>0.8%</div>
              <div style={styles.performanceBar}>
                <div style={{ ...styles.performanceBarFill, width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Revenue Chart Component
function RevenueChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>Revenue Trend</h4>
      <div style={styles.chartArea}>
        <div style={styles.yAxis}>
          <div style={styles.yAxisLabel}>${(maxValue / 1000).toFixed(0)}k</div>
          <div style={styles.yAxisLabel}>${(maxValue / 2000).toFixed(0)}k</div>
          <div style={styles.yAxisLabel}>0</div>
        </div>
        <div style={styles.chartBars}>
          {data.map((item, index) => (
            <div key={index} style={styles.barContainer}>
              <div style={styles.barLabel}>{item.month}</div>
              <div style={styles.barWrapper}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${(item.revenue / maxValue) * 200}px`,
                    backgroundColor: '#00f2ff'
                  }}
                />
              </div>
              <div style={styles.barValue}>${(item.revenue / 1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Users Chart Component
function UsersChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.users));
  
  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>User Growth</h4>
      <div style={styles.chartArea}>
        <div style={styles.yAxis}>
          <div style={styles.yAxisLabel}>{maxValue}</div>
          <div style={styles.yAxisLabel}>{Math.floor(maxValue / 2)}</div>
          <div style={styles.yAxisLabel}>0</div>
        </div>
        <div style={styles.chartBars}>
          {data.map((item, index) => (
            <div key={index} style={styles.barContainer}>
              <div style={styles.barLabel}>{item.month}</div>
              <div style={styles.barWrapper}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${(item.users / maxValue) * 200}px`,
                    backgroundColor: '#22c55e'
                  }}
                />
              </div>
              <div style={styles.barValue}>{item.users}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Projects Chart Component
function ProjectsChart({ data }) {
  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>Project Status</h4>
      <div style={styles.chartArea}>
        <div style={styles.projectBars}>
          {data.map((item, index) => (
            <div key={index} style={styles.projectBarContainer}>
              <div style={styles.projectBarLabel}>{item.month}</div>
              <div style={styles.projectBarsWrapper}>
                <div style={styles.projectBarGroup}>
                  <div style={styles.projectBarLabelInline}>Completed</div>
                  <div style={styles.projectBarWrapper}>
                    <div
                      style={{
                        ...styles.projectBar,
                        height: '20px',
                        width: `${(item.completed / (item.completed + item.ongoing)) * 100}%`,
                        backgroundColor: '#22c55e'
                      }}
                    />
                  </div>
                  <div style={styles.projectBarValue}>{item.completed}</div>
                </div>
                <div style={styles.projectBarGroup}>
                  <div style={styles.projectBarLabelInline}>Ongoing</div>
                  <div style={styles.projectBarWrapper}>
                    <div
                      style={{
                        ...styles.projectBar,
                        height: '20px',
                        width: `${(item.ongoing / (item.completed + item.ongoing)) * 100}%`,
                        backgroundColor: '#f59e0b'
                      }}
                    />
                  </div>
                  <div style={styles.projectBarValue}>{item.ongoing}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance Chart Component
function PerformanceChart({ data }) {
  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>Performance Metrics</h4>
      <div style={styles.performanceChart}>
        {data.map((item, index) => (
          <div key={index} style={styles.performanceMetric}>
            <div style={styles.performanceMetricHeader}>
              <div style={styles.performanceMetricName}>{item.metric}</div>
              <div style={styles.performanceMetricValue}>
                {item.value}{item.unit}
              </div>
            </div>
            <div style={styles.performanceMetricBar}>
              <div
                style={{
                  ...styles.performanceMetricBarFill,
                  width: `${(item.value / item.target) * 100}%`,
                  backgroundColor: item.value <= item.target ? '#22c55e' : '#f59e0b'
                }}
              />
            </div>
            <div style={styles.performanceMetricTarget}>
              Target: {item.target}{item.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    color: 'var(--text-muted)'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  metricCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  metricTitle: {
    margin: '0 0 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-muted)'
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#00f2ff',
    marginBottom: '8px'
  },
  metricChange: {
    fontSize: '12px',
    color: '#22c55e'
  },
  chartsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  chartCard: {
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px'
  },
  chartTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-color)'
  },
  chartPlaceholder: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    fontSize: '14px'
  }
};
