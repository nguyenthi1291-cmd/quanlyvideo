# DASHBOARD.md

## KPI 1 — Total Videos

Query active videos count.

Display:

```text
1,248
Total Videos
```

## KPI 2 — Total Views

Display formatted number:

```text
2.45M
Total Views
```

## KPI 3 — Storage

Convert bytes:

```text
1.2 GB
Storage Used
```

## Bar chart

Dataset:

```javascript
{
  labels: ["Video A", "Video B", "..."],
  datasets: [{
    label: "Views",
    data: [12000, 9800, ...]
  }]
}
```

Sort descending and keep maximum 10.

## Line chart

Dataset:

```javascript
{
  labels: ["01/10", "02/10", "03/10"],
  datasets: [{
    label: "Views",
    data: [120, 340, 290]
  }]
}
```

Filters:
- 7D
- 30D
- 90D
- Monthly

## Chart library

Use Chart.js through a CDN initially.

Keep chart initialization isolated in `dashboard.js`.

## Loading

Initial page:

```text
Loading dashboard...
```

Do not render fake KPI numbers.

## Error

If a query fails:

```text
Unable to load dashboard data.
Please try again.
```
