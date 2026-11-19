import { useState } from "react";
import { Terminal, Play } from "lucide-react";
import { Panel } from "../../../components/ui/Shared";
import { ui } from "../../../styles/ui";
import { isHost, type LabNode } from "../data/types";
import { useNetworkStore } from "../store/useNetworkStore";
import { initialCLI, executeCLI, cliPrompt, cliHelp } from "../engine/cli";

function TerminalSession({ node }: { node: LabNode }) {
  const [session, setSession] = useState(initialCLI);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [output, setOutput] = useState(
    "Device console connected. Type help or ? for supported commands.",
  );
  function run() {
    const lines = command
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return;
    if (lines.length > 60) {
      setOutput("Maximum 60 commands per batch.");
      return;
    }
    let current = session,
      transcript = output;
    for (const line of lines) {
      const store = useNetworkStore.getState(),
        device = store.nodes.find((n) => n.id === node.id);
      if (!device) break;
      const prompt = cliPrompt(device, current),
        result = executeCLI(line, device, store.nodes, store.edges, current);
      if (result.patch) store.update(node.id, result.patch);
      current = result.session;
      transcript = /^(clear|cls)$/i.test(line)
        ? ""
        : `${transcript}\n${prompt} ${line}\n${result.output}`;
    }
    setSession(current);
    setOutput(transcript.slice(-24000));
    setCommand("");
    const next = [...history, ...lines].slice(-100);
    setHistory(next);
    setHistoryIndex(next.length);
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="text-sm text-lab-accent">
          {node.data.name} ·{" "}
          {isHost(node) ? "Host terminal" : "IOS-style console"}
        </span>
        <button className={ui("button ghost")} onClick={() => setOutput("")}>
          Clear console
        </button>
      </div>
      <pre
        aria-label="Console output"
        tabIndex={0}
        className="max-h-80 min-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-lab-border bg-[#080e15] p-4 text-xs font-mono leading-6 text-cyan-100"
      >
        {output}
      </pre>
      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label
          className="block text-xs font-mono text-lab-accent mb-2"
          htmlFor="device-command"
        >
          {cliPrompt(node, session)}
        </label>
        <textarea
          id="device-command"
          aria-label="Device command"
          rows={3}
          maxLength={12000}
          spellCheck={false}
          autoComplete="off"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="w-full rounded border border-lab-border bg-lab-bg p-3 text-xs font-mono text-cyan-100 focus:outline-none focus:border-lab-accent"
          placeholder={isHost(node) ? "ipconfig" : "enable"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              run();
            }
            if (
              !command.includes("\n") &&
              (e.key === "ArrowUp" || e.key === "ArrowDown")
            ) {
              e.preventDefault();
              const i = Math.max(
                0,
                Math.min(
                  history.length,
                  historyIndex + (e.key === "ArrowUp" ? -1 : 1),
                ),
              );
              setHistoryIndex(i);
              setCommand(history[i] ?? "");
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <button className={ui("button primary")} type="submit">
            <Play size={14} />
            Run commands
          </button>
          <span className="text-xs text-lab-muted">
            Enter runs · Shift+Enter adds a line · ↑ / ↓ history
          </span>
        </div>
      </form>
      <details className={ui("hint mt-4")}>
        <summary className="cursor-pointer">
          Commands and interface mapping
        </summary>
        <pre className="whitespace-pre-wrap text-xs leading-6 mt-3">
          {cliHelp(node, session)}
        </pre>
        <p>
          Canvas names are canonical. On routed devices, GigabitEthernet0/0
          (g0/0) maps to eth0 and g0/1 to eth1. On access switches,
          FastEthernet0/1–4 maps to p1–4. Existing ports start enabled to
          preserve sandbox behavior.
        </p>
        <p>
          Changes apply immediately to the canvas and missions. Console mode and
          history reset when selecting another device; configuration remains.
          Save topology persists configuration, including shutdown ports.
        </p>
      </details>
      {!isHost(node) && (
        <details className={ui("hint")}>
          <summary className="cursor-pointer">
            Example: configure a routed LAN interface
          </summary>
          <pre className="text-xs whitespace-pre-wrap mt-3">
            {
              "enable\nconfigure terminal\ninterface g0/0\nip address 10.10.10.1 255.255.255.0\nno shutdown\nend\nshow ip interface brief"
            }
          </pre>
          <p>
            Choose a routed device for this example. Layer 2 switch ports do not
            accept IP addresses. VLANs, dynamic routing, real packet timing, and
            complete vendor operating systems are outside this command subset.
          </p>
          <a
            className="underline"
            href="https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-addressing/b-ip-addressing/m_config-ipv4-addr-0.html"
            target="_blank"
            rel="noreferrer"
          >
            Cisco IPv4 interface configuration reference
          </a>
        </details>
      )}
    </>
  );
}
export default function DeviceCLI({ node }: { node: LabNode | undefined }) {
  return (
    <Panel title="Device CLI">
      <div className="flex items-center gap-2 mb-4 text-xs text-lab-muted">
        <Terminal size={16} />
        Interactive command console · deterministic lab model
      </div>
      {node ? (
        <TerminalSession key={node.id} node={node} />
      ) : (
        <p className="text-sm text-lab-muted">
          Select a device on the canvas to open its command console. Routers and
          switches use IOS-style modes; computers have a host terminal.
        </p>
      )}
    </Panel>
  );
}
