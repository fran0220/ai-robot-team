# OpenClaw Agent Runtime and Agent Loop Research Report

## 1. Core Concepts and Functionality

The OpenClaw Agent Loop is the complete, end-to-end process that an agent follows to execute a task. It is a serialized, single run per session that ensures consistency and prevents race conditions. The loop encompasses the following stages:

1.  **Intake**: Receiving the initial message or prompt.
2.  **Context Assembly**: Gathering relevant information, including session history, skills, and bootstrap files, to form the system prompt.
3.  **Model Inference**: Sending the assembled context to the language model for processing.
4.  **Tool Execution**: If the model decides to use a tool, the agent executes it and captures the output.
5.  **Streaming Replies**: The agent streams the model's thinking process, tool usage, and final response back to the user in real-time.
6.  **Persistence**: Saving the final state and conversation history to the session.

### Agent Runtime

The Agent Runtime is the environment where the Agent Loop executes. It is responsible for managing the entire lifecycle of the agent, including:

*   **Session Management**: Creating, resolving, and managing sessions.
*   **Queueing and Concurrency**: Serializing agent runs to maintain data integrity.
*   **Workspace Preparation**: Setting up the agent's working directory and environment.
*   **Prompt Engineering**: Assembling the system prompt with all the necessary context.
*   **Event Handling**: Emitting and subscribing to lifecycle, tool, and assistant events.
*   **Timeout Enforcement**: Terminating runs that exceed the configured timeout.

## 2. Configuration Options and Parameters

Based on the documentation, the primary configuration option related to the Agent Loop is the timeout setting:

*   `agents.defaults.timeoutSeconds`: This setting in the OpenClaw configuration file determines the default timeout for the agent runtime in seconds. The default value is 600 seconds (10 minutes).

## 3. JSON Configuration Example

While the documentation does not provide a specific JSON configuration example for the Agent Loop, a typical configuration in `~/.openclaw/gateway.json` might look like this, with the `timeoutSeconds` parameter adjusted:

```json
{
  "agents": {
    "defaults": {
      "timeoutSeconds": 300
    }
  }
}
```

This example sets the default agent runtime timeout to 300 seconds (5 minutes).

## 4. CLI Command Examples

The primary CLI command for interacting with the Agent Loop is `openclaw agent`:

```bash
# Execute a simple agent run
openclaw agent "What is the weather in San Francisco?"

# Execute an agent run and wait for the result
openclaw agent.wait "Summarize the latest news headlines."
```

## 5. Best Practices

*   **Use Hooks for Customization**: Leverage internal (Gateway) and plugin hooks to extend and customize the agent's behavior without modifying the core code. For example, use the `before_agent_start` hook to inject custom context or the `after_tool_call` hook to modify tool results.
*   **Manage Timeouts**: Adjust the `agents.defaults.timeoutSeconds` setting based on the complexity of the tasks your agents will be performing. For long-running tasks, you may need to increase the timeout to prevent premature termination.
*   **Leverage Asynchronous Execution**: Use `openclaw agent` for fire-and-forget tasks and `openclaw agent.wait` when you need to wait for the agent to complete its run and receive the final status.
*   **Monitor Event Streams**: Subscribe to the `lifecycle`, `assistant`, and `tool` event streams to monitor the agent's progress and gain insights into its behavior.

## 6. Integration with Other Features

The Agent Loop is tightly integrated with several other core features of OpenClaw:

*   **System Prompt**: The Agent Loop is responsible for assembling the system prompt, which is the primary input to the language model.
*   **Skills**: Skills are loaded and injected into the system prompt during the session and workspace preparation phase of the Agent Loop.
*   **Memory**: The Agent Loop interacts with the memory system to persist session history and retrieve context.
*   **Command Queue**: The Command Queue feeds into the Agent Loop's queuing system, allowing for different modes of message handling (collect, steer, followup).
*   **Plugins**: Plugins can hook into various stages of the Agent Loop to modify its behavior and add new functionality.
