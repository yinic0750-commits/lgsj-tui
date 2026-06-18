# LGcode — 中文 AI 编程助手

> 基于配置和插件驱动的多模型 coding agent，支持终端 TUI、HTTP 服务、桌面 GUI 和 IM Bot。
> **本 fork 已完整汉化**，所有 UI 界面、状态栏、提示信息均为中文。

---

## 核心功能

- **交互式 TUI**：`lgcode chat` 启动中文终端界面，支持连续对话、流式输出、工具调用、审批卡片、历史恢复
- **一次性任务**：`lgcode run "任务描述"` 适合脚本化使用，从参数或 stdin 接收任务
- **代码读写与验证**：内置文件操作、搜索、bash 执行、网页抓取等工具
- **多模型支持**：DeepSeek、MiMo、Claude 或任意 OpenAI 兼容接口，运行时 `/model` 切换
- **计划/自动/YOLO 模式**：只读计划模式、自动审批、完全自动三种工具执行强度
- **项目记忆**：`LGCODE.md` / `AGENTS.md` 长期指令，`/memory` 管理跨会话记忆
- **MCP 插件**：连接外部工具、数据库、内部系统，扩展模型能力
- **桌面 GUI**：Wails + React 构建，带标签页、项目树、设置面板
- **IM Bot**：支持 QQ、飞书、Lark、微信等渠道远程触发

---

## 安装

### 方式一：直接下载二进制（推荐）

从 [Releases](https://github.com/yinic0750-commits/lgsj-tui/releases) 下载对应平台的二进制文件，放到 `PATH` 中：

```bash
# macOS/Linux
chmod +x lgcode
sudo mv lgcode /usr/local/bin/

# 验证
lgcode version
```

### 方式二：从源码编译

**前置要求**：Go 1.22+

```bash
# 1. 克隆仓库
git clone https://github.com/yinic0750-commits/lgsj-tui.git
cd lgsj-tui

# 2. 编译
make build

# 3. 验证
./bin/lgcode version

# 4. 安装到系统（可选）
sudo cp ./bin/lgcode /usr/local/bin/
```

**交叉编译多个平台**：
```bash
make cross
```

### 方式三：桌面端构建

```bash
cd desktop
wails dev    # 开发模式
wails build  # 生产构建
```

---

## 快速开始

### 1. 配置 API 密钥

```bash
# DeepSeek
export DEEPSEEK_API_KEY=sk-...

# 或写入 .env 文件
echo "DEEPSEEK_API_KEY=sk-..." > .env
```

### 2. 生成配置文件

```bash
lgcode setup
```

按提示选择：
- 语言：**中文**
- 模型提供商：DeepSeek / Claude / 自定义
- 主题：自动/深色/浅色

这会生成 `lgcode.toml` 和 `.env`。

### 3. 启动交互式会话

```bash
cd /path/to/your-project
lgcode chat
```

### 4. 初始化项目记忆（可选）

在会话中输入：
```
/init
```

模型会分析代码库并生成 `AGENTS.md` 作为项目长期指令。

### 5. 执行一次性任务

```bash
# 直接运行
lgcode run "阅读这个项目并总结主要模块"

# 从管道输入
echo "解释这段报错" | lgcode run

# 指定模型
lgcode run --model mimo-pro "给这个函数补单元测试"
```

---

## 常用命令

| 命令 | 作用 |
|------|------|
| `lgcode chat` | 启动交互式 TUI |
| `lgcode chat --continue` | 继续上次会话 |
| `lgcode run "任务"` | 执行一次性任务 |
| `lgcode serve` | 启动 HTTP/SSE 服务 |
| `lgcode setup` | 交互式配置向导 |
| `lgcode config auto-plan on` | 开启自动计划模式 |
| `lgcode config reasoning-language zh` | 设置思考语言为中文 |
| `lgcode mcp list` | 查看 MCP 连接 |
| `lgcode doctor` | 环境诊断 |
| `lgcode upgrade` | 检查更新 |
| `lgcode version` | 查看版本 |

---

## TUI 快捷键与命令

### 状态栏操作
- `Shift+Tab`：切换**计划模式**
- `Ctrl+Y`：切换**自动审批模式**（YOLO）
- `Ctrl+B`：折叠/展开长输出
- `Ctrl+O`：切换详细思考显示

### 斜杠命令
- `/help`：查看全部命令
- `/model`：切换模型
- `/mcp`：管理 MCP 插件
- `/skills`：管理技能
- `/memory`：查看项目记忆
- `/rewind`：从检查点恢复
- `/clear`、`/new`、`/compact`：清空/新建/压缩会话
- `/language zh`：切换为中文界面
- `/quit`：退出会话

---

## 配置说明

`lgcode.toml` 优先级：命令行 flag > 项目 `./lgcode.toml` > 用户配置 > 内置默认值。

```toml
# 默认模型
default_model = "deepseek-flash"

# 界面语言（zh = 中文）
language = "zh"

[ui]
theme = "auto"        # auto | dark | light
theme_style = "graphite"

[agent]
# 系统提示词（已预置中文要求）
system_prompt = """
你是 LGcode，一个专注于执行代码任务的编程助手。
所有用户可见的 UI 文本、状态标签、提示信息必须使用中文。
"""
max_steps = 0
planner_max_steps = 12
auto_plan = "off"
reasoning_language = "zh"

# DeepSeek 提供商
[[providers]]
name = "deepseek"
kind = "openai"
base_url = "https://api.deepseek.com"
models = ["deepseek-v4-flash", "deepseek-v4-pro"]
default = "deepseek-v4-flash"
api_key_env = "DEEPSEEK_API_KEY"
context_window = 1000000

# Claude 提供商
[[providers]]
name = "claude"
kind = "anthropic"
model = "claude-opus-4-8"
api_key_env = "ANTHROPIC_API_KEY"
context_window = 1000000

[tools]
bash_timeout_seconds = 120

# MCP 插件示例
[[plugins]]
name = "example"
command = "lgcode-plugin-example"
```

完整配置示例见 [`lgcode.example.toml`](./lgcode.example.toml)。

---

## 权限与安全

- **询问模式**：写文件、执行命令前会询问确认
- **自动模式**：自动放行普通操作，显式拒绝仍生效
- **YOLO 模式**：跳过普通审批，适合受信任的临时任务
- **文件写入限制**：可限制在 workspace root 内
- **macOS 沙盒**：bash 命令可使用 Seatbelt 沙盒限制范围

---

## 项目结构

```text
cmd/lgcode/              CLI 入口
internal/cli/            TUI、子命令、渲染
internal/control/        传输无关的 controller 核心
internal/agent/          agent 会话、压缩、任务循环
internal/provider/       模型 provider（OpenAI/Anthropic）
internal/tool/builtin/   内置工具（文件、搜索、bash）
internal/plugin/         MCP 插件运行时
internal/skill/          Skills 索引与调用
internal/memory/         项目记忆
internal/i18n/           国际化（中文/英文/繁体中文）
internal/serve/          HTTP/SSE 服务
desktop/                 Wails 桌面端
docs/                    使用指南与规格文档
```

---

## 文档

- [中文使用指南](./docs/GUIDE.zh-CN.md)
- [Bot 使用指南](./docs/BOT_GUIDE.zh-CN.md)
- [Checkpoints 与 rewind](./docs/CHECKPOINTS.md)
- [工程规格](./docs/SPEC.md)
- [桌面端说明](./desktop/README.md)

---

## 许可证

MIT License，见 [LICENSE](./LICENSE)。
