# OpenCode Session Sidebar

面向 **OpenCode Desktop 2.1.2** 的本地界面补丁。提供可开关的常驻会话侧栏，不修改后台服务、CLI、数据库或模型配置。

这不是官方发布，也不是完整 OpenCode fork。此仓库保存本次改动的完整文件、可应用补丁、测试与安装恢复工具。官方升级可能覆盖补丁。

## 功能

- **紧凑高密度顶部导航（参考 Claude Desktop + ZCode + ATG）**：
  - 顶部主动作栏整合 `+ New session`（带快捷键徽章 `⌘T`）与 `Restore tabs` 侧栏折叠切换按钮，移除旧版冗余的 5 个原生 `<select>` 下拉框堆积。
  - 紧凑圆角搜索框（支持 `Esc` 与一键清空），下方提供 `Sessions` + 当前视图胶囊徽章与右侧级联筛选菜单（`Group sessions by` / `Sort sessions by` / `Filter by time` / `Filter by project` / `Display` / `Archived only` / `Mark all as read` / `Reset filters`）及 `+ Add project` 按钮。
  - 存在激活筛选条件时自动展示可点击移除的筛选胶囊（Filter Pills），同时保留隐藏 `<select>` 以兼容无障碍与自动化测试。
- **置顶会话区（`Pinned`）与多维分组（`By status` / `By project` / `By time` / `None`）**：
  - 支持将常用会话置顶到顶部可折叠 `Pinned` 分区。
  - 支持按状态（`Needs input`、`Working`、`Ready to review`、`Idle`）、按项目（带文件夹图标与悬停 `+` 快速在该项目新建会话）、按时间（`Today`、`Yesterday`、`Previous 7 days`、`Previous 30 days`、`Older`）或平铺列表切换。
  - 所有分组支持点击折叠／展开并持久化折叠状态，折叠分组内若有待处理或未读会话自动显示提示圆点。
- **底层协议 JSON 标题净化与紧凑行设计**：
  - 自动解析并提取底层协议偶发写入的原始 JSON 会话标题（如 `{"text":"继续对话"}`、`{"prompt":"..."}` 或 Part 数组），并剥离 `New session - 2026-...` 兜底时间戳后缀。
  - 每行左侧标题对齐，右侧展示实时状态指示（`Working` 旋转进度、`Needs input` 琥珀色圆点与标签、`Ready to review` 蓝色未读圆点）与紧凑相对时间（`now`、`9m`、`5h`、`2d`）。
  - 副标题展示项目名与子目录／worktree 相对路径（在按项目分组视图下自动去重仅显示 worktree 子路径，并可在 `Display -> Show project path` 中开关）。
- **悬停快捷操作与右键上下文菜单**：
  - 悬停行显示 `More actions`（`...`）、`Pin / Unpin` 及运行中会话的 `Stop session` 快捷按钮，支持右键任意会话行直接唤起上下文菜单。
  - 支持行内重命名（`Rename`）、新标签页后台打开（`Open in new tab`）、停止运行（`Stop session`）、标记已读（`Mark as read`）、归档／取消归档（`Archive / Unarchive`）、删除会话（`Delete`）、复制 Session ID 与工作目录。
- **可拖拽调整侧栏宽度**：
  - 内置 `ResizeHandle` 支持在 `220px`–`480px` 范围内拖拽调整侧栏宽度并持久化。
- **系统级集成**：
  - 复用官方会话导航和完整 permission/form 请求缓存，跟随跨客户端状态事件更新。
  - macOS 使用 `Cmd+Shift+B`，或命令面板 `Toggle session sidebar` 开关。
  - 点击 `Restore tabs` 恢复原横向／纵向标签栏。窄屏保留原界面。
  - 新侧栏开启时隐藏顶部会话标签，只保留左侧竖向列表，避免两套会话导航重复显示。新建会话等标题栏操作保留。

搜索与排序针对已加载数据。内置英文（`en`）、简体中文（`zh`）与繁体中文（`zht`）完整国际化文案，其他语言使用运行时回退。

## 来源与授权

源码基于 [anomalyco/opencode](https://github.com/anomalyco/opencode) 的 `v2.1.2`，固定 commit 为 `a517687fde98a7329ada3ae644a01a9fc6c4e99e`。

主要参考 [mv2a/opencode 的 sessions-by-state 实现](https://github.com/mv2a/opencode/tree/faaf2ece89d783faf2d02c330e4b86b23b240104/packages/gui-extensions/src/sessions)，包括状态优先级、项目分组、时间筛选与排序设计。此次适配为 shell 原生常驻侧栏，没有引入通用 GUI 插件加载框架，也没有直接安装该 fork。

上游及参考仓库均采用 MIT License，原始版权声明保留在 [LICENSE](LICENSE)。本次适配增加了原布局恢复、持久化偏好、实时事件刷新、完整请求缓存同步及回归测试。

## 文件布局

- `source/`：全部改动文件的最终版本，沿用上游相对路径。
- `patches/tracked.patch`：上游已有文件的差异。
- `tools/apply.py`：校验固定基线后应用已有文件差异并添加新文件。
- `tools/manage.py`：macOS 本地 ASAR prepare/install/restore 工具。
- `docs/verification.md`：验证结果和未通过项。

同时保留了原安装已有的 Absolutely 主题和 Noto Serif SC 字体定制。这些不是侧栏本身必需的功能。

## 应用源码改动

先克隆官方仓库并切到固定基线。目标 checkout 必须干净，脚本不会自动安装依赖或修改客户端。

```sh
git clone https://github.com/anomalyco/opencode.git opencode
git -C opencode checkout a517687fde98a7329ada3ae644a01a9fc6c4e99e
python3 tools/apply.py /path/to/opencode
```

使用上游指定的 Bun 1.4.2 安装依赖。包内执行 `bun typecheck`，app 包内执行 `bun run test:unit`。完整检查命令是仓库根目录的 `bun run check`。

本次只构建 renderer，直接在 `packages/desktop` 执行 `OPENCODE_VERSION=2.1.2 OPENCODE_CHANNEL=latest bun x --no-install electron-vite build`。`bun run build` 会额外触发 CLI 打包 prebuild，不属于本地界面替换所需步骤。

## 安装与恢复边界

**`tools/manage.py` 是本次本机安装工具，不是一键通用安装器。** 它要求事先完成原应用备份，并在脚本同目录准备 `current-backup.txt` 和备份目录中的 `manifest.json`，不会自动创建这些内容。本仓库不包含应用包、备份、签名文件或用户数据。

备份目录需包含 `Resources/app.asar`、`Info.plist`、`_CodeSignature/`。`current-backup.txt` 保存该目录的绝对路径，`manifest.json` 的 `asar_sha256` 必须为备份 ASAR 的 SHA256。先独立核对备份有效，再调用工具，勿对其他版本盲用。

```sh
python3 tools/manage.py prepare --renderer /path/to/opencode/packages/desktop/out/renderer
python3 tools/manage.py install
# 需要撤回时
python3 tools/manage.py restore
```

工具固定目标为 `/Applications/OpenCode.app`，仅支持 2.1.2。安装前核对原文件哈希，更新 ASAR 完整性和本机 ad-hoc 签名。安装与恢复均原子替换 ASAR，并重新生成本机 ad-hoc 签名后严格校验。仅复制旧签名目录不能恢复已被重新签名的可执行文件签名。保留运行进程已打开的旧文件内容，不主动重启应用或后台服务。新界面在下一次正常启动生效。

尚未对其他机器、其他 Desktop 版本或不同的现有定制环境完成验证。
