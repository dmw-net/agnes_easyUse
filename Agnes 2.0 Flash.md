> ## Documentation Index
> Fetch the complete documentation index at: https://wiki.agnes-ai.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Agnes 2.0 Flash

> 面向智能体工作流、工具调用、编码和图像理解的快速高效语言模型。

**Agnes-2.0-Flash** 是由 **Sapiens AI** 开发的快速高效语言模型，专为智能体工作流、工具调用、编码任务、推理、多轮对话、图像理解和高频生产使用场景而设计。

Agnes-2.0-Flash 在 **Claw-Eval** 基准测试中表现出色，在**通用排行榜**上以 **Pass^3 得分 60.9%** 排名**第 9**，在主流语言模型中展现出强大的自主智能体能力。

## 模型概述

Agnes-2.0-Flash 针对快速、可靠、高性价比的语言生成、智能体任务执行和图像理解进行了优化。

该模型支持以下能力：

<CardGroup cols={2}>
  <Card title="聊天补全" icon="message">
    为对话和应用生成高质量响应
  </Card>

  <Card title="多轮对话" icon="comments">
    在多轮交互中保持上下文连续性
  </Card>

  <Card title="图像 URL 输入" icon="link">
    通过公开可访问的图像 URL 接收图像内容
  </Card>

  <Card title="图像理解" icon="eye">
    理解图像内容、分析截图并提取视觉信息
  </Card>

  <Card title="工具调用" icon="wrench">
    为智能体工作流调用外部工具和函数
  </Card>

  <Card title="智能体工作流" icon="robot">
    支持规划、执行和多步骤任务完成
  </Card>

  <Card title="编码任务" icon="code">
    辅助代码生成、调试、解释和重构
  </Card>

  <Card title="推理" icon="brain">
    处理结构化推理、任务分解和决策制定
  </Card>

  <Card title="流式输出" icon="bolt">
    实时返回响应，提供更好的用户体验
  </Card>

  <Card title="OpenAI 兼容 API" icon="plug">
    使用与 OpenAI 聊天补全 API 兼容的请求结构
  </Card>
</CardGroup>

## 使用场景

Agnes-2.0-Flash 适用于以下场景：

<CardGroup cols={2}>
  <Card title="AI 助手" icon="robot">
    通用问答、日常助手、效率支持
  </Card>

  <Card title="自主智能体" icon="diagram-project">
    多步骤任务执行、规划和工具使用
  </Card>

  <Card title="编码助手" icon="laptop-code">
    代码生成、调试、重构和解释
  </Card>

  <Card title="工作流自动化" icon="gears">
    任务分解、流程自动化和执行规划
  </Card>

  <Card title="客户支持" icon="headset">
    常见问题解答、客服聊天机器人、服务自动化
  </Card>

  <Card title="搜索与问答" icon="magnifying-glass">
    基于搜索的回答、摘要生成、信息提取
  </Card>

  <Card title="内容生成" icon="pen">
    营销文案、文章、产品描述、脚本
  </Card>

  <Card title="开发者工具" icon="terminal">
    API 助手、文档助手、编码副驾驶
  </Card>

  <Card title="AI 原生应用" icon="mobile">
    消费级应用、效率工具、智能体应用
  </Card>

  <Card title="图像理解" icon="image">
    图像描述、截图分析、视觉问答、信息提取
  </Card>
</CardGroup>

## API 信息

### 请求地址

| 项目           | 说明                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------- |
| API Endpoint | [https://apihub.agnes-ai.com/v1/chat/completions](https://apihub.agnes-ai.com/v1/chat/completions) |
| 请求方法         | POST                                                                                               |
| Content-Type | application/json                                                                                   |
| 认证方式         | Bearer Token                                                                                       |
| 认证头          | Authorization: Bearer YOUR\_API\_KEY                                                               |

## 请求参数

| 参数                     | 类型              | 必填 | 说明                                           |
| ---------------------- | --------------- | -- | -------------------------------------------- |
| model                  | string          | 是  | 模型名称。使用 agnes-2.0-flash                      |
| messages               | array           | 是  | 对话消息数组，包含 system、user 和 assistant 消息         |
| messages\[].content    | string / array  | 是  | 消息内容。可以是纯文本字符串，或者包含 text 和 image\_url 内容块的数组 |
| temperature            | number          | 否  | 控制输出随机性。值越低，结果越确定                            |
| top\_p                 | number          | 否  | 控制核采样。值越低，输出越聚焦                              |
| max\_tokens            | number          | 否  | 响应中生成的最大 token 数量                            |
| stream                 | boolean         | 否  | 是否启用流式输出                                     |
| tools                  | array           | 否  | 工具调用工作流的工具定义                                 |
| tool\_choice           | string / object | 否  | 控制模型是否使用工具以及如何使用工具                           |
| chat\_template\_kwargs | object          | 否  | 扩展字段，用于在 OpenAI 兼容请求中启用 Thinking 等能力         |
| thinking               | object          | 否  | 用于在 Anthropic 兼容请求中启用 Thinking 模式的字段         |

## 图像 URL 输入支持

Agnes-2.0-Flash 支持通过图像 URL 进行图像输入。开发者可以在同一个 `messages` 请求中同时传递文本指令和图像 URL，让模型理解、分析、回答图像相关问题或从图像中提取信息。

支持的输入类型：

| 输入类型   | 格式         | 说明                    |
| ------ | ---------- | --------------------- |
| 文本     | text       | 纯文本指令或问题              |
| 图像 URL | image\_url | 通过公开可访问的图像 URL 传递图像内容 |

### 图像内容结构

使用图像 URL 输入时，`messages[].content` 应使用数组结构。每个内容块代表一种输入类型。

```json theme={null}
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "Describe the content of this image."
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://example.com/image.jpg"
      }
    }
  ]
}
```

## 请求示例

<Tabs>
  <Tab title="1. 基础聊天补全请求">
    使用此请求生成标准的聊天补全响应。

    ```bash theme={null}
    curl https://apihub.agnes-ai.com/v1/chat/completions \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-2.0-flash",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful AI assistant."
          },
          {
            "role": "user",
            "content": "Explain how autonomous agents use tools to complete tasks."
          }
        ],
        "temperature": 0.7,
        "max_tokens": 1024
      }'
    ```
  </Tab>

  <Tab title="2. 流式输出请求">
    使用此请求启用流式输出。

    ```bash theme={null}
    curl https://apihub.agnes-ai.com/v1/chat/completions \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-2.0-flash",
        "messages": [
          {
            "role": "user",
            "content": "Write a short product introduction for an AI assistant app."
          }
        ],
        "stream": true
      }'
    ```
  </Tab>

  <Tab title="3. 工具调用请求">
    对于需要外部工具调用的智能体工作流，请使用此请求。

    ```bash theme={null}
    curl https://apihub.agnes-ai.com/v1/chat/completions \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-2.0-flash",
        "messages": [
          {
            "role": "user",
            "content": "What is the weather like in Singapore today?"
          }
        ],
        "tools": [
          {
            "type": "function",
            "function": {
              "name": "get_weather",
              "description": "Get the current weather for a location",
              "parameters": {
                "type": "object",
                "properties": {
                  "location": {
                    "type": "string",
                    "description": "The city and country"
                  }
                },
                "required": ["location"]
              }
            }
          }
        ]
      }'
    ```
  </Tab>

  <Tab title="4. 图像 URL 输入请求">
    使用此请求通过图像 URL 传入图片，让模型理解或分析图像内容。

    ```bash theme={null}
    curl https://apihub.agnes-ai.com/v1/chat/completions \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "agnes-2.0-flash",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Describe the content of this image."
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": "https://example.com/image.jpg"
                }
              }
            ]
          }
        ]
      }'
    ```
  </Tab>
</Tabs>

## 响应格式

```json theme={null}
{
  "id": "chatcmpl_xxx",
  "object": "chat.completion",
  "created": 1774432125,
  "model": "agnes-2.0-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Autonomous agents use tools by understanding the user's goal, breaking it into steps, selecting the right tools, executing actions, and using the results to complete the task."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 58,
    "total_tokens": 93
  }
}
```

## 响应字段

| 字段                         | 类型      | 说明                       |
| -------------------------- | ------- | ------------------------ |
| id                         | string  | 补全请求的唯一 ID               |
| object                     | string  | 对象类型，通常为 chat.completion |
| created                    | integer | 请求时间戳                    |
| model                      | string  | 请求所使用的模型                 |
| choices                    | array   | 生成的响应结果列表                |
| choices\[].index           | integer | 响应结果的索引                  |
| choices\[].message         | object  | 助手消息对象                   |
| choices\[].message.role    | string  | 消息发送者的角色                 |
| choices\[].message.content | string  | 模型生成的响应内容                |
| choices\[].finish\_reason  | string  | 生成停止的原因                  |
| usage                      | object  | Token 使用情况信息             |
| usage.prompt\_tokens       | integer | 输入 token 数量              |
| usage.completion\_tokens   | integer | 输出 token 数量              |
| usage.total\_tokens        | integer | 使用的总 token 数量            |

## 为编码任务启用 Thinking 模式

对于编码、调试、推理和智能体工作流，建议启用 Thinking 模式以提升代码质量、任务分解和问题解决性能。

### OpenAI 兼容请求

使用 OpenAI 兼容 API 格式时，在请求体中添加 `chat_template_kwargs.enable_thinking`：

```json theme={null}
{
  "model": "agnes-2.0-flash",
  "messages": [
    {
      "role": "user",
      "content": "Help me write a Python script to process a CSV file."
    }
  ],
  "chat_template_kwargs": {
    "enable_thinking": true
  }
}
```

### Anthropic 兼容请求

使用 Anthropic 兼容 API 格式时，在请求体中添加 `thinking` 字段：

```json theme={null}
{
  "model": "agnes-2.0-flash",
  "messages": [
    {
      "role": "user",
      "content": "Help me refactor this TypeScript function and explain the changes."
    }
  ],
  "thinking": {
    "type": "enabled",
    "budget_tokens": 2048
  }
}
```

`budget_tokens` 控制 Thinking 的最大 token 预算。对于常规编码任务，建议从 `2048` 开始。对于更复杂的调试、重构或多步骤智能体任务，可根据需要增大该值。

## 功能与兼容性

Agnes-2.0-Flash 支持以下能力：

* 聊天补全
* 多轮对话
* 系统提示词
* 图像 URL 输入
* 图像理解
* 流式输出
* 工具调用
* 智能体工作流
* 编码任务
* 推理任务
* JSON 风格输出
* 兼容 OpenAI 聊天补全 API 的请求结构

## 最佳实践

### 提示词编写技巧

为获得更好的结果，请提供清晰的指令、充分的上下文以及期望的输出格式。

### 示例：产品文案生成

```text theme={null}
You are a product marketing expert. Write a concise App Store description for an AI assistant app. The tone should be clear, professional, and user-friendly.
```

### 示例：编码任务

对于编码任务，请提供编程语言、框架、错误信息和预期行为。

```text theme={null}
Help me debug this React component. The issue is that the button state does not update after clicking. Explain the cause and provide the corrected code.
```

### 示例：智能体工作流

对于智能体工作流，请清晰描述目标、可用工具和任务约束。

```text theme={null}
You are an autonomous research agent. Search for relevant information, summarize the key findings, and return the result in a structured format with source links.
```

### 示例：图像理解任务

对于图像理解任务，请明确说明模型应关注的重点，例如整体描述、文本提取、UI 分析、物体识别或结构化输出。

```text theme={null}
Analyze this screenshot. Identify the main UI elements, explain the possible issue, and provide suggestions to improve the user experience.
```

## 推荐的提示词结构

使用以下结构组织提示词：

```text theme={null}
[角色] + [任务] + [上下文] + [要求] + [输出格式]
```

### 示例

```text theme={null}
You are a senior product manager. Analyze this feature idea for an AI assistant app. Consider user value, implementation complexity, risks, and return the result in a structured table.
```

### 图像理解提示词示例

```text theme={null}
You are an image analysis assistant. Analyze the provided image URL, summarize the key information, identify potential issues, and return the result in a structured table.
```

## 图像 URL 使用提示

* 图像 URL 必须可公开访问。
* 如果图像 URL 需要登录、认证或存在防盗链保护，模型可能无法读取。
* 建议使用 JPG、JPEG、PNG 或 WebP 等标准图像格式。
* 对于截图、错误截图或产品 UI 图片，请添加文本说明以明确模型应关注的重点。
* 图像 URL 输入可与工具调用、流式输出和智能体工作流配合使用。

## 模型限制

| 项目   | 数值    |
| ---- | ----- |
| 上下文  | 512K  |
| 最大输出 | 65.5K |

## 定价

| 类型       | 价格                 | 当前价格            |
| -------- | ------------------ | --------------- |
| 输入 Token | \$0.03 / 1M tokens | \$0 / 1M tokens |
| 输出 Token | \$0.15 / 1M tokens | \$0 / 1M tokens |

## 注意事项

<Check>
  * 使用 `agnes-2.0-flash` 作为模型名称。
  * 基础聊天补全请求必须包含 `model` 和 `messages`。
  * `messages[].content` 可以是纯文本字符串，也可以是包含文本和图像 URL 的数组。
  * 要输入图像，请使用 `image_url` 并提供公开可访问的图像 URL。
  * 要启用流式响应，请将 `stream` 设置为 `true`。
  * 对于工具调用工作流，请提供 `tools`，并可选提供 `tool_choice`。
  * `temperature` 控制随机性。较低的值更适合确定性任务，较高的值更适合创意生成。
  * Agnes-2.0-Flash 适用于需要快速响应、强大任务完成能力、图像理解和可靠智能体性能的生产应用。
</Check>
