# LGcode

LGcode 是一个面向开发者的 AI coding agent。它以 Go 实现核心运行时，提供终端 TUI、一次性命令执行、HTTP/SSE 服务、桌面 GUI 和 IM Bot 等多种入口，让模型可以在你的本地项目中读代码、改文件、运行命令、管理任务，并通过权限与沙盒控制风险。

这个项目的重点不是单纯聊天，而是把模型变成可协作的工程助手：它能理解项目上下文，调用内置工具和 MCP 插件，按计划执行代码任务，保存会话与项目记忆，并在需要写文件或执行命令时请求审批。

## 核心功能

- **终端 AI 编程助手**：`lgcode chat` 启动交互式 TUI，支持连续对话、流式输出、工具调用轨迹、审批卡片、历史恢复、分支和 rewind。
- **一次性任务执行**：`lgcode run "..."` 适合脚本化使用，可从参数或 stdin 接收任务，并把结果输出到终端。
- **本地代码读写与验证**：内置 `read_file`、`write_file`、`edit_file`、`multi_edit`、`move_file`、`grep`、`glob`、`ls`、`bash`、`web_fetch` 等工具，覆盖读代码、搜索、修改、运行测试和抓取网页。
- **配置驱动的多模型系统**：通过 `lgcode.toml` 配置 DeepSeek、MiMo、Claude 或任意 OpenAI 兼容接口；支持一个 provider 暴露多个模型，也支持运行时 `/model` 切换。
- **DeepSeek 前缀缓存友好**：系统提示、工具描述和项目记忆保持稳定，适合长会话中复用模型 prefix cache，降低重复上下文成本。
- **Plan / Ask / Auto / YOLO 模式**：可手动进入只读计划模式，也可在不同审批强度之间切换；YOLO 会跳过普通工具审批，但不会绕过硬性 deny 规则。
- **权限与沙盒**：写文件、移动文件、执行 shell 等敏感操作会经过权限策略；文件写入可限制在 workspace root 内，macOS 下 bash 可使用 Seatbelt 沙盒。
- **会话保存、恢复与 rewind**：聊天记录会保存为 session；可继续最近会话、选择历史会话、从 checkpoint 恢复代码或对话，也可以从旧 turn 分支。
- **项目记忆与自动记忆**：支持 `LGCODE.md` / `AGENTS.md` 作为项目长期指令；`/memory` 和 memory 工具可管理跨会话事实，`#note` 可快速写入记忆。
- **`@` 引用上下文**：在消息中写 `@path/to/file`、`@dir` 或 `@<mcp-server>:<resource>`，LGcode 会在发送前把文件、目录或 MCP 资源注入上下文。
- **MCP 插件系统**：可连接 stdio 或 HTTP MCP server，插件工具以 `mcp__server__tool` 形式暴露给模型；MCP prompts 会变成斜杠命令，resources 可通过 `@` 引用。
- **Skills 工作流**：支持项目级和用户级 skills，内置 explore、research、review、security-review、test 等可复用流程，也可通过 `/skill` 管理自定义技能。
- **CodeGraph 代码智能**：可启用内置 CodeGraph MCP，让模型使用符号搜索、调用图、上下文探索等结构化代码检索能力。
- **Hooks 与状态栏扩展**：支持 PreToolUse、PostToolUse、PermissionRequest、UserPromptSubmit、Stop 等 hook，也可配置自定义 status line。
- **桌面 GUI**：`desktop/` 提供 Wails + React 前端，复用同一套 Go controller，带标签页、项目树、工具卡片、设置面板、模型切换、MCP 面板、Bot 管理和更新提示。
- **IM Bot 网关**：支持 QQ、飞书、Lark、微信等渠道，把本机 LGcode 暴露为聊天机器人；远端消息仍走同一套模型、工具、权限、审批和沙盒逻辑。
- **HTTP/SSE 服务模式**：`lgcode serve` 可把 controller 通过 HTTP + Server-Sent Events 暴露给自定义前端或集成系统。

## 适合什么场景

- 在终端里让 AI 阅读项目、解释代码、补测试、修 bug、重构小模块。
- 让模型按计划修改文件，并在每一步执行测试或命令验证。
- 把常用代码审查、测试、调研流程固化成 skills 或 slash commands。
- 通过 MCP 接入数据库、内部系统、设计工具或其他工程服务。
- 在桌面端用更完整的 GUI 管理多项目会话、模型配置、MCP 连接和 IM Bot。
- 在飞书、Lark、微信等 IM 中远程触发本机代码助手，并保留审批控制。

## 安装与构建

如果使用 npm 分发包：

```sh
npm i -g lgcode
```

从源码构建：

```sh
make build
./bin/lgcode --version
```

交叉编译多个平台：

```sh
make cross
```

桌面端构建在 `desktop/` 子模块中：

```sh
cd desktop
wails dev
wails build
```

## 快速开始

1. 生成或编辑配置：

```sh
lgcode setup
```

2. 设置模型密钥，例如 DeepSeek：

```sh
export DEEPSEEK_API_KEY=sk-...
```

3. 进入项目并启动交互式会话：

```sh
cd /path/to/project
lgcode chat
```

4. 在会话里初始化项目记忆：

```text
/init
```

5. 直接执行一次性任务：

```sh
lgcode run "阅读这个项目并总结主要模块"
lgcode run "修复 failing tests，并说明改动"
echo "解释这段报错" | lgcode run
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `lgcode chat` | 启动交互式 TUI，会保存上下文和历史。 |
| `lgcode run "任务"` | 执行一次性任务，适合脚本或 CI 辅助。 |
| `lgcode serve` | 启动 HTTP/SSE 服务。 |
| `lgcode setup` | 交互式生成配置。 |
| `lgcode config` | 查看或编辑配置。 |
| `lgcode mcp` | 管理 MCP 连接。 |
| `lgcode codegraph` | 管理 CodeGraph 集成。 |
| `lgcode review` | 运行代码审查相关流程。 |
| `lgcode doctor` | 检查环境、配置和依赖状态。 |
| `lgcode bot start` | 启动 IM Bot 网关。 |
| `lgcode upgrade` | 检查或执行升级。 |

## TUI 内置能力

在 `lgcode chat` 中可以使用斜杠命令和快捷键管理会话：

- `/help`：查看全部内置命令。
- `/model`：切换模型或 provider。
- `/mcp`：查看、刷新、禁用或重连 MCP server。
- `/skills` / `/skill`：查看和管理 skills。
- `/memory`：查看项目记忆和自动记忆。
- `/rewind` 或空输入双击 `Esc`：从 checkpoint 恢复代码、对话或创建分支。
- `/tree`、`/branch`、`/switch`：查看和切换会话分支。
- `/todo`：查看当前任务列表。
- `/clear`、`/new`、`/compact`：清空、开启新会话或压缩上下文。
- `/language`、`/reasoning-language`、`/output-style`：调整显示语言、思考语言和输出风格。
- `Shift+Tab`：切换 Plan 模式。
- `Ctrl+Y`：切换 YOLO 模式。
- `Ctrl+B`：折叠或展开长 shell 输出。
- `Ctrl+O`：切换详细 reasoning 显示。

## 配置示例

`lgcode.toml` 的优先级为：命令行 flag > 当前项目 `./lgcode.toml` > 用户配置 > 内置默认值。密钥通过环境变量读取，不建议写进配置文件。

```toml
default_model = "deepseek"
language = "zh"

[ui]
theme = "auto"
theme_style = "graphite"

[agent]
max_steps = 0
planner_max_steps = 12
auto_plan = "off"
reasoning_language = "auto"

[[providers]]
name = "deepseek"
kind = "openai"
base_url = "https://api.deepseek.com"
models = ["deepseek-v4-flash", "deepseek-v4-pro"]
default = "deepseek-v4-flash"
api_key_env = "DEEPSEEK_API_KEY"
context_window = 1000000
effort = "high"

[[providers]]
name = "claude"
kind = "anthropic"
model = "claude-opus-4-8"
api_key_env = "ANTHROPIC_API_KEY"
context_window = 1000000

[tools]
enabled = []
bash_timeout_seconds = 120

[[plugins]]
name = "example"
command = "lgcode-plugin-example"
```

更完整的配置样例见 [`lgcode.example.toml`](./lgcode.example.toml)。

## 权限、安全与审批

LGcode 的工具调用会经过权限层：

- `deny` 规则优先级最高，任何模式都不能绕过。
- Ask 模式会在写文件、执行命令等操作前询问。
- Auto 模式会自动放行兜底审批，但显式 ask / deny 仍生效。
- YOLO 模式会跳过普通工具审批，适合受信任的临时任务。
- 文件写工具可限制在 workspace root 内，防止越界修改。
- macOS 下 bash 可以进入 Seatbelt 沙盒，限制写入范围和网络访问。

这意味着你可以让模型高效执行任务，同时把高风险命令、敏感目录和持久授权控制在配置中。

## 插件、Skills 与 CodeGraph

LGcode 的扩展能力主要有三层：

- **MCP 插件**：接入外部工具、服务、数据库或内部系统；stdio 和 HTTP 传输都支持。
- **Skills**：把固定工作流写成可复用 playbook，例如 review、test、security-review。
- **CodeGraph**：通过符号、调用关系和上下文检索帮助模型理解大型代码库。

这些能力既能在 TUI 中使用，也能被桌面端和 Bot 复用。

## 桌面端与 Bot

桌面端位于 [`desktop/`](./desktop)，使用 Wails + React 构建，但底层仍然调用同一个 `internal/control.Controller`。因此 CLI、HTTP 服务、桌面端和 Bot 拥有一致的模型、工具、权限、沙盒、记忆和事件流。

Bot 能把 LGcode 接到 QQ、飞书、Lark、微信等 IM 渠道。远端用户发来的消息会进入本机 LGcode runtime；如果模型需要写文件或运行命令，审批请求也会回到 IM 中。

## 项目结构

```text
cmd/lgcode/                 CLI 入口
internal/cli/               TUI、子命令、渲染和交互
internal/control/           传输无关的 controller 核心
internal/agent/             agent 会话、压缩、任务循环和保存
internal/provider/          OpenAI / Anthropic 等模型 provider
internal/tool/builtin/      内置文件、搜索、bash、web_fetch 等工具
internal/plugin/            MCP 插件运行时
internal/skill/             Skills 索引与调用
internal/memory/            项目记忆与自动记忆
internal/codegraph/         CodeGraph 集成
internal/bot/               QQ / 飞书 / Lark / 微信 Bot 网关
internal/serve/             HTTP/SSE 服务
desktop/                    Wails 桌面端
docs/                       使用指南、规格、Bot 和 checkpoint 文档
```

## 文档入口

- [中文使用指南](./docs/GUIDE.zh-CN.md)
- [Bot 使用指南](./docs/BOT_GUIDE.zh-CN.md)
- [Checkpoints 与 rewind](./docs/CHECKPOINTS.md)
- [工程规格](./docs/SPEC.md)
- [迁移指南](./docs/MIGRATING.md)
- [桌面端说明](./desktop/README.md)

## 许可证

本项目使用 MIT License，见 [LICENSE](./LICENSE)。
