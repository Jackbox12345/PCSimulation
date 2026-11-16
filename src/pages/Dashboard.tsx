import { ui } from "../styles/ui";
import {
  ArrowRight,
  Box,
  Cable,
  CheckCheck,
  Cpu,
  FlaskConical,
  MousePointer2,
  Network,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeading } from "../components/ui/Shared";
import { PCArtwork, NetworkArtwork } from "../components/ui/LabArtwork";
export default function Dashboard() {
  return (
    <div className={ui("page dashboard")}>
      <PageHeading
        eyebrow="YOUR VIRTUAL WORKBENCH"
        title="A little curiosity. A lot to build."
        description="Get hands-on with hardware and networks. Experiment, troubleshoot, and learn at your own pace."
      />
      <div className={ui("section-label")}>
        <span>CHOOSE YOUR LAB</span>
        <span>Two environments. Real understanding.</span>
      </div>
      <div className={ui("lab-cards")}>
        <article className={ui("lab-card")}>
          <div className={ui("art-wrap")}>
            <span className={ui("art-badge")}>
              <Box size={13} /> INTERACTIVE 3D
            </span>
            <PCArtwork />
          </div>
          <div className={ui("lab-card-content")}>
            <div className={ui("card-kicker")}>
              HARDWARE LAB <span>01</span>
            </div>
            <h2>Build it. Boot it. Understand it.</h2>
            <p>
              Step inside a computer. Choose your components, assemble a
              compatible PC, and bring your first build to life.
            </p>
            <div className={ui("feature-tags")}>
              <span>3D workbench</span>
              <span>Compatibility checks</span>
              <span>Simulated POST</span>
            </div>
            <Link className={ui("button primary")} to="/pc-builder">
              Start PC simulation <ArrowRight size={16} />
            </Link>
            <div className={ui("card-foot")}>
              <span className={ui("status-dot")} /> Beginner friendly{" "}
              <span>Mission 01 included</span>
            </div>
          </div>
        </article>
        <article className={ui("lab-card")}>
          <div className={ui("art-wrap blue")}>
            <span className={ui("art-badge")}>
              <Network size={13} /> INTERACTIVE 2D
            </span>
            <NetworkArtwork />
          </div>
          <div className={ui("lab-card-content")}>
            <div className={ui("card-kicker")}>
              NETWORK LAB <span>02</span>
            </div>
            <h2>Make the connection.</h2>
            <p>
              Turn individual devices into a working network. Wire a topology,
              configure IP addresses, and find out what makes a ping succeed.
            </p>
            <div className={ui("feature-tags")}>
              <span>Topology canvas</span>
              <span>IPv4 configuration</span>
              <span>Ping diagnostics</span>
            </div>
            <Link className={ui("button secondary")} to="/network-lab">
              Start network simulation <ArrowRight size={16} />
            </Link>
            <div className={ui("card-foot")}>
              <span className={ui("status-dot")} /> Beginner friendly{" "}
              <span>Mission 02 included</span>
            </div>
          </div>
        </article>
      </div>
      <div className={ui("learning-strip")}>
        <span className={ui("learning-icon")}>
          <FlaskConical size={24} />
        </span>
        <div>
          <h3>Your lab. Your experiments.</h3>
          <p>
            No broken parts or tangled cables. Reset anytime and try a different
            approach.
          </p>
        </div>
        <Link to="/guide">
          Explore the learning guide <ArrowRight size={15} />
        </Link>
      </div>
      <div className={ui("section-label")}>
        <span>LEARN THROUGH DOING</span>
      </div>
      <div className={ui("principles")}>
        {[
          {
            icon: MousePointer2,
            title: "Hands-on by design",
            text: "Install components and connect devices yourself.",
          },
          {
            icon: CheckCheck,
            title: "Feedback that explains",
            text: "Understand why a configuration works—or why it doesn’t.",
          },
          {
            icon: Terminal,
            title: "Practice troubleshooting",
            text: "Use POST and ping to work through real concepts.",
          },
          {
            icon: Cable,
            title: "Start with the essentials",
            text: "Guided missions turn first steps into working systems.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon size={19} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className={ui("dashboard-note")}>
        <Cpu size={14} /> Simplified hardware. Deterministic simulations.
        Practical foundations.
      </div>
    </div>
  );
}
