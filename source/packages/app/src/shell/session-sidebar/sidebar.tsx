import { For, Show, createEffect, createMemo, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import { useLocation } from "@solidjs/router"
import { Button } from "@opencode/ui/button"
import { useLanguage } from "@/runtime/i18n/language"
import { ServerConnection, serverName, useServers } from "@/runtime/server/registry"
import { sessionHref } from "@/shell/routes/session"
import { buildSessionGroups, sidebarProjectKey, type SidebarFilter, type SidebarRow } from "./model"
import { createServerSidebar } from "./controller"

export function SessionSidebar(props: {
  filter: SidebarFilter
  setFilter: SetStoreFunction<SidebarFilter & { enabled: boolean }>
  close: () => void
}) {
  const language = useLanguage()
  const servers = useServers()
  const [state, setState] = createStore<{ rows: Record<string, SidebarRow[]> }>({ rows: {} })
  const projects = createMemo(() => [
    ...new Map(
      Object.values(state.rows)
        .flat()
        .map((row) => [sidebarProjectKey(row), row]),
    ).entries(),
  ])
  const control =
    "h-8 min-w-0 rounded-md border border-v2-border-border-base bg-v2-background-bg-base px-2 text-[12px] text-v2-text-text-base outline-none focus-visible:ring-2 focus-visible:ring-v2-border-border-focus"

  return (
    <aside
      aria-label={language.t("sessionSidebar.title")}
      class="flex w-[280px] shrink-0 min-h-0 flex-col gap-3 ps-2 pe-2 pb-2 pt-[var(--shell-top-inset,8px)] border-e border-v2-border-border-base"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-[13px] leading-[var(--line-height-compact)] font-medium text-v2-text-text-base">
          {language.t("sessionSidebar.title")}
        </h2>
        <Button variant="ghost" size="small" onClick={props.close}>
          {language.t("sessionSidebar.restore")}
        </Button>
      </div>
      <input
        class={control}
        type="search"
        aria-label={language.t("sessionSidebar.search")}
        placeholder={language.t("sessionSidebar.search")}
        value={props.filter.search}
        onInput={(event) => props.setFilter("search", event.currentTarget.value)}
      />
      <div class="grid grid-cols-2 gap-2">
        <select
          class={control}
          aria-label={language.t("sessionSidebar.groupBy")}
          value={props.filter.groupBy}
          onChange={(event) =>
            props.setFilter("groupBy", event.currentTarget.value === "project" ? "project" : "state")
          }
        >
          <option value="state">{language.t("sessionSidebar.group.state")}</option>
          <option value="project">{language.t("sessionSidebar.group.project")}</option>
        </select>
        <select
          class={control}
          aria-label={language.t("sessionSidebar.status")}
          value={props.filter.status}
          onChange={(event) =>
            props.setFilter("status", event.currentTarget.value === "archived" ? "archived" : "active")
          }
        >
          <option value="active">{language.t("sessionSidebar.active")}</option>
          <option value="archived">{language.t("sessionSidebar.archived")}</option>
        </select>
        <select
          class={`${control} col-span-2`}
          aria-label={language.t("sessionSidebar.project")}
          value={props.filter.project}
          onChange={(event) => props.setFilter("project", event.currentTarget.value)}
        >
          <option value="">{language.t("sessionSidebar.allProjects")}</option>
          <For each={projects()}>
            {([key, row]) => (
              <option value={key}>
                {row.project.name} · {row.project.directory}
              </option>
            )}
          </For>
        </select>
        <select
          class={control}
          aria-label={language.t("sessionSidebar.period")}
          value={props.filter.days}
          onChange={(event) => props.setFilter("days", Number(event.currentTarget.value))}
        >
          <option value="0">{language.t("sessionSidebar.allTime")}</option>
          <option value="1">{language.t("sessionSidebar.day")}</option>
          <option value="7">{language.t("sessionSidebar.week")}</option>
          <option value="30">{language.t("sessionSidebar.month")}</option>
        </select>
        <select
          class={control}
          aria-label={language.t("sessionSidebar.sort")}
          value={props.filter.sort}
          onChange={(event) => props.setFilter("sort", event.currentTarget.value === "created" ? "created" : "updated")}
        >
          <option value="updated">{language.t("sessionSidebar.updated")}</option>
          <option value="created">{language.t("sessionSidebar.created")}</option>
        </select>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <Show
          when={servers.visible.length}
          fallback={<p class="text-[12px] text-v2-text-text-muted">{language.t("sessionSidebar.noServers")}</p>}
        >
          <For each={servers.visible}>
            {(connection) => (
              <ServerSessions
                connection={connection}
                filter={props.filter}
                onRows={(rows) => setState("rows", ServerConnection.key(connection), rows)}
                onDispose={() => setState("rows", ServerConnection.key(connection), [])}
              />
            )}
          </For>
        </Show>
      </div>
    </aside>
  )
}

function ServerSessions(props: {
  connection: ServerConnection.Any
  filter: SidebarFilter
  onRows: (rows: SidebarRow[]) => void
  onDispose: () => void
}) {
  const language = useLanguage()
  const location = useLocation()
  const controller = createServerSidebar(props.connection, () => props.filter)
  const groups = createMemo(() => buildSessionGroups(controller.rows(), props.filter))
  const labels = () => ({
    input: language.t("sessionSidebar.state.input"),
    working: language.t("sessionSidebar.state.working"),
    review: language.t("sessionSidebar.state.review"),
    idle: language.t("sessionSidebar.state.idle"),
  })
  createEffect(() => props.onRows(controller.rows()))
  onCleanup(props.onDispose)

  return (
    <section class="mb-3 flex flex-col gap-2">
      <h3 class="truncate text-[12px] text-v2-text-text-muted" dir="auto">
        {serverName(props.connection)}
      </h3>
      <Show when={!controller.connected()}>
        <p role="status" class="text-[12px] text-v2-text-text-muted">
          {language.t("sessionSidebar.disconnected")}
        </p>
      </Show>
      <Show when={controller.connected() && controller.loading()}>
        <p role="status" class="text-[12px] text-v2-text-text-muted">
          {language.t("sessionSidebar.loading")}
        </p>
      </Show>
      <Show when={controller.failed()}>
        <div role="alert" class="text-[12px] text-v2-text-text-muted">
          <p>{language.t("sessionSidebar.failed")}</p>
          <Button variant="ghost" size="small" onClick={controller.retry}>
            {language.t("sessionSidebar.retry")}
          </Button>
        </div>
      </Show>
      <For each={groups()}>
        {(group) => (
          <div class="flex flex-col gap-1">
            <h4 class="truncate text-[12px] font-medium text-v2-text-text-muted" dir="auto">
              {group.state ? labels()[group.state] : group.rows[0]?.project.name}
            </h4>
            <For each={group.rows}>
              {(row) => (
                <button
                  type="button"
                  class="flex min-h-12 w-full min-w-0 flex-col gap-1 rounded-md px-2 py-1.5 text-start hover:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-border-border-focus"
                  classList={{
                    "bg-v2-overlay-simple-overlay-hover":
                      location.pathname === sessionHref(ServerConnection.key(props.connection), row.session.id),
                  }}
                  aria-current={
                    location.pathname === sessionHref(ServerConnection.key(props.connection), row.session.id)
                      ? "page"
                      : undefined
                  }
                  title={`${row.session.title || language.t("sessionSidebar.untitled")}\n${row.project.directory}`}
                  onClick={() => controller.open(row)}
                >
                  <span
                    class="w-full truncate text-[13px] leading-[var(--line-height-compact)] text-v2-text-text-base"
                    dir="auto"
                  >
                    {row.session.title || language.t("sessionSidebar.untitled")}
                  </span>
                  <span class="flex w-full min-w-0 items-center gap-2 text-[12px] text-v2-text-text-muted">
                    <span class="shrink-0">{labels()[row.state]}</span>
                    <span class="truncate" dir="auto">
                      {row.project.name}
                    </span>
                  </span>
                </button>
              )}
            </For>
          </div>
        )}
      </For>
      <Show when={!controller.loading() && !groups().length}>
        <p class="text-[12px] text-v2-text-text-muted">{language.t("sessionSidebar.empty")}</p>
      </Show>
      <Show when={controller.more()}>
        <Button
          variant="ghost"
          size="small"
          disabled={controller.fetching() || !controller.connected()}
          onClick={controller.loadMore}
        >
          {language.t("sessionSidebar.more")}
        </Button>
      </Show>
    </section>
  )
}
