# 验证记录

验证基线为官方 OpenCode 2.1.2，commit `a517687fde98a7329ada3ae644a01a9fc6c4e99e`。环境为 macOS arm64、Bun 1.4.2、系统 Chrome。

## 已通过

- app 包 `bun typecheck`（`tsc -b` 0 errors）。
- 相关模型、适配及字体测试，70 pass、0 fail、118 assertions（含 JSON 协议标题净化、相对时间格式化、worktree 子路径提取、置顶会话、按时间／平铺分组及 `session.viewed` 事件刷新单测）。
- 新侧栏浏览器 keeper（`e2e/regression/tabs.spec.ts --grep "session sidebar"`），覆盖状态／时间／项目分组、置顶与取消置顶、未读会话与全部标为已读（`Mark all as read`）、搜索、导航、归档事件、恢复原布局、开关和刷新后偏好保留。
- 同一会话 P1/P2 同时待批，P2 答复后仍显示 Needs input，P1 答复后转为 Working。
- 独立冷审 PASS。审查发现的问题均经修正后复核。
- 最终桌面 renderer（`packages/desktop/out/renderer`）和网页生产构建（`live-dist` & `dist`）。
- 通过仅绑定 loopback 的验证代理读取真实后台会话，在深色与浅色主题及中文界面下验证状态／项目／时间分组、置顶会话、级联筛选菜单、全部标为已读（108 条未读会话一键清零并发送 `POST /api/session/:id/view`）、悬停快捷操作及恢复标签栏。
- 侧栏滚动条与边界视觉验证：复用 `@opencode/ui/scroll-view` 悬浮胶囊滑块，消除侧栏右边框与主面板左边框的双线空槽感，Playwright 实测胶囊滑块距主面板分割线 `1px`（`thumb::after = 276..280px`，`mainCard.left = 281px`），不遮挡右侧相对时间文字。
- 本机安装后 ASAR SHA256（`f7f9d605f0dba5a83ec56611590f8064570dc0ff2299644ad3dd79cd5029d39c`）、Electron header integrity（`78998e8ed3a898a886e8b57894f8303c285d857f16d4a9765a0b80d4751433fb`）与 `codesign --verify --deep --strict /Applications/OpenCode.app`。
- 原 ASAR payload 的 174175691 字节保留，6449 个非 renderer 文件的 offset/hash 不变。
- 临时恢复验证中，已打开的旧文件句柄继续读取补丁内容，恢复后的路径读取原内容。
- 本机 `/Applications/OpenCode.app` 重启后在真实桌面客户端中完成交互与视觉验收。

## 顶部重复标签与未读状态修复

- 原问题是开启新侧栏后，官方竖标签栏关闭，标题栏回退为横向会话标签。现在仅隐藏桌面横向会话标签，不影响标题栏其他操作和手机布局。
- 新增断言在旧构建中失败，实际可见标签为 1、预期为 0。修复后侧栏 keeper、原横标签行为和两种手机布局共 4 passed。
- 未读历史会话标为已读修复：侧栏通过 `home-sessions` 与 `sidebar-history` 加载的未打开历史会话不在 `context.data.session` 字典内，原先调用 `notification.session.markViewed(id)` 会直接提前返回。现改为在 `controller.ts` 中维护批量乐观 `viewed` 时间戳映射并直接调用 `sdk.api.session.view({ sessionID, idle })`，同时监听 `session.viewed` 事件刷新。
- 本机实际恢复时暴露旧签名目录无法恢复主可执行文件签名。恢复流程现重新生成本机 ad-hoc 签名，实际 restore 和 install 均通过严格 codesign 校验。

## 未通过或未验证

- 整个 tabs keeper 为 19 passed、2 failed，不能宣称全部通过。
- macOS 提示格式差异导致的 vertical tabs 用例，在临时本地适配副本中通过。
- 原有 `Control+Alt+ArrowRight` 导航用例仍在本地失败，未作为本次侧栏已修复项。
- 全仓 typecheck 因其他后端 workspace 依赖尚未完整安装而失败，不能宣称全仓 check 通过。
- 没有其他版本或其他机器兼容性证据。

未上传本机截图、日志、会话数据、授权凭据或应用备份。
