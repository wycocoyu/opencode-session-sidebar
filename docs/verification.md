# 验证记录

验证基线为官方 OpenCode 2.1.2，commit `a517687fde98a7329ada3ae644a01a9fc6c4e99e`。环境为 macOS arm64、Bun 1.4.2、系统 Chrome。

## 已通过

- app 包 `bun typecheck`（`tsc -b` 0 errors）。
- 相关模型、适配及字体测试，68 pass、0 fail、116 assertions（含 JSON 协议标题净化、相对时间格式化、worktree 子路径提取、置顶会话与按时间／平铺分组单测）。
- 新侧栏浏览器 keeper（`e2e/regression/tabs.spec.ts --grep "session sidebar"`），覆盖状态／时间／项目分组、置顶与取消置顶、搜索、导航、归档事件、恢复原布局、开关和刷新后偏好保留。
- 同一会话 P1/P2 同时待批，P2 答复后仍显示 Needs input，P1 答复后转为 Working。
- 独立冷审 PASS。审查发现的问题均经修正后复核。
- 最终桌面 renderer（`packages/desktop/out/renderer`）和网页生产构建（`live-dist` & `dist`）。
- 通过仅绑定 loopback 的验证代理读取真实后台会话，在深色与浅色主题及中文界面下验证状态／项目／时间分组、置顶会话、级联筛选菜单、悬停快捷操作及恢复标签栏。
- 本机安装后 ASAR SHA256（`4b1c4c55e73e80797c7a5196367764cd33af9baf5042d7cfc04bc7e5ae2d176f`）、Electron header integrity（`8914cea5d9cbd8803f3be8ed06a758058f4225d46c9e158a2a3c2a33eac7851d`）与 `codesign --verify --deep --strict /Applications/OpenCode.app`。
- 原 ASAR payload 的 174175691 字节保留，6449 个非 renderer 文件的 offset/hash 不变。
- 临时恢复验证中，已打开的旧文件句柄继续读取补丁内容，恢复后的路径读取原内容。

## 顶部重复标签修复

- 原问题是开启新侧栏后，官方竖标签栏关闭，标题栏回退为横向会话标签。现在仅隐藏桌面横向会话标签，不影响标题栏其他操作和手机布局。
- 新增断言在旧构建中失败，实际可见标签为 1、预期为 0。修复后侧栏 keeper、原横标签行为和两种手机布局共 4 passed。
- app 类型检查、网页和桌面 renderer 构建通过。
- 本机实际恢复时暴露旧签名目录无法恢复主可执行文件签名。恢复流程现重新生成本机 ad-hoc 签名，实际 restore 和 install 均通过严格 codesign 校验。

## 未通过或未验证

- 整个 tabs keeper 为 19 passed、2 failed，不能宣称全部通过。
- macOS 提示格式差异导致的 vertical tabs 用例，在临时本地适配副本中通过。
- 原有 `Control+Alt+ArrowRight` 导航用例仍在本地失败，未作为本次侧栏已修复项。
- 全仓 typecheck 因其他后端 workspace 依赖尚未完整安装而失败，不能宣称全仓 check 通过。
- 安装时未重启正在使用的 Desktop 或后台服务，实际 Desktop 新进程中的生效情况尚未验收。
- 没有其他版本或其他机器兼容性证据。

未上传本机截图、日志、会话数据、授权凭据或应用备份。
