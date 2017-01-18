const star = '*, ST_AsGeoJSON(the_geom)::json AS the_geom'

module.exports = [
  {
    label: 'select: multiple fields',
    input: `$select=foo, bar`,
    expect: `SELECT foo, bar`
  },
  {
    label: 'select: wildcard converts geometry type',
    input: `$select=*`,
    expect: `SELECT ${star}`
  },
  {
    label: 'select: convex hull',
    input: `$select=convex_hull(geom)`,
    expect: `SELECT ST_ConvexHull(ST_Collect(geom))`
  },
  {
    label: 'select: field alias',
    input: `$select=foo, bar as baz`,
    expect: `SELECT foo, bar AS baz`
  },
  {
    label: 'select: date truncate',
    input: `$select=date_trunc_ym(datetime) as month`,
    expect: `SELECT date_trunc(datetime, 'month')`,
    skip: true
  },
  {
    label: 'select: operators',
    input: `$select=location, depth * 3.28 AS depth_feet, end - start AS duration`,
    expect: `SELECT location, depth * 3.28 AS depth_feet, end - start AS duration`
  },
  {
    label: 'where: operator',
    input: `$where=foo < 3`,
    expect: `SELECT ${star} WHERE foo < 3`
  },
  {
    label: 'where: and/or',
    input: `$where=magnitude > 3.1 and source = 'pr'`,
    expect: `SELECT ${star} WHERE magnitude > 3.1 AND source = 'pr'`
  },
  {
    label: 'where: named filters set types',
    input: `foo=1&bar=quz`,
    expect: `SELECT ${star} WHERE foo = 1 AND bar = 'quz'`
  },
  {
    label: 'where: named filters with where clause',
    input: `foo=1&$where=bar = 2`,
    expect: `SELECT ${star} WHERE bar = 2 AND foo = 1`
  },
  {
    label: 'where: within box',
    input: `$where=within_box(geom, 47.5, -122.3, 47.5, -122.3)`,
    expect: `SELECT ${star} WHERE geom && ST_MakeEnvelope(47.5, -122.3, 47.5, -122.3, 4326)`
  },
  {
    label: 'where: within circle',
    input: `$where=within_circle(geom, 47.59815, -122.33454, 500)`,
    expect: `SELECT ${star} WHERE ST_Point_Inside_Circle(geom, 47.59815, -122.33454, 0.005)`
  },
  {
    label: 'where: within polygon',
    input: `$where=within_polygon(geom, 'MULTIPOLYGON (((-87.637714 41.887275, -87.613681 41.886892, -87.625526 41.871555, -87.637714 41.887275)))')`,
    expect: `SELECT ${star} WHERE ST_Within(geom, ST_GeometryFromText('MULTIPOLYGON (((-87.637714 41.887275, -87.613681 41.886892, -87.625526 41.871555, -87.637714 41.887275)))'))`
  },
  {
    label: 'where: geometry and basic filters together',
    input: `$where=foo < 2 and within_box(geom, 47.5, -122.3, 47.5, -122.3) AND bar = 'test'`,
    expect: `SELECT ${star} WHERE foo < 2 AND geom && ST_MakeEnvelope(47.5, -122.3, 47.5, -122.3, 4326) AND bar = 'test'`
  },
  {
    label: 'where: full text search', // seems to require table name
    input: `$q=foo bar`, // need to pass table name for this one
    expect: `SELECT ${star} WHERE crimes::text ILIKE '%foo bar%'`,
    skip: true
  },
  {
    label: 'group: date truncate',
    input: `$group=date_trunc_ym(datetime)`,
    expect: `SELECT ${star} GROUP BY date_trunc(datetime, 'month')`,
    skip: true
  },
  {
    label: 'limit',
    input: `$limit=10`,
    expect: `SELECT ${star} LIMIT 10`,
    skip: true
  }
]