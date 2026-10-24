export type SidebarRow = {
  key: string
  server: string
  session: {
    id: string
    title: string
    parentID?: string
    projectID?: string
    location: { directory: string }
    time: { created: number; updated?: number; archived?: number; idle?: number; viewed?: number }
  }
  project: { id: string; name: string; directory: string }
  state: "input" | "working" | "review" | "idle"
}

export type SidebarFilter = {
  groupBy: "state" | "project"
  status: "active" | "archived"
  search: string
  project: string
  days: number
  sort: "updated" | "created"
}

export type SidebarGroup = {
  id: string
  state?: SidebarRow["state"]
  project?: SidebarRow["project"]
  server?: string
  rows: SidebarRow[]
}

const STATES: readonly SidebarRow["state"][] = ["input", "working", "review", "idle"]
const DAY = 24 * 60 * 60 * 1000

export function sidebarProjectKey(row: SidebarRow): string {
  return JSON.stringify([row.server, row.project.id])
}

export function buildSessionGroups(rows: readonly SidebarRow[], filter: SidebarFilter): SidebarGroup[] {
  const since = Date.now() - filter.days * DAY
  const search = filter.search.trim().toLowerCase()
  const visible = rows
    .filter((row) => {
      if (row.session.parentID) return false
      if ((filter.status === "archived") !== (row.session.time.archived !== undefined)) return false
      if (filter.project && sidebarProjectKey(row) !== filter.project) return false
      if (
        search &&
        ![row.session.title, row.project.name, row.project.directory, row.session.location.directory].some((value) =>
          value.toLowerCase().includes(search),
        )
      )
        return false
      return (
        filter.days <= 0 ||
        row.state === "input" ||
        row.state === "working" ||
        (row.session.time.updated ?? row.session.time.created) >= since
      )
    })
    .sort((a, b) => {
      return (
        (b.session.time[filter.sort] ?? b.session.time.created) -
          (a.session.time[filter.sort] ?? a.session.time.created) ||
        compare(a.session.id, b.session.id) ||
        compare(a.key, b.key)
      )
    })

  const groups = new Map<string, SidebarGroup>()
  for (const row of visible) {
    const id = filter.groupBy === "state" ? row.state : sidebarProjectKey(row)
    let group = groups.get(id)
    if (!group) {
      group =
        filter.groupBy === "state"
          ? { id, state: row.state, rows: [] }
          : { id, project: row.project, server: row.server, rows: [] }
      groups.set(id, group)
    }
    group.rows.push(row)
  }

  return filter.groupBy === "state"
    ? STATES.flatMap((state) => (groups.has(state) ? [groups.get(state)!] : []))
    : [...groups.values()]
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}
