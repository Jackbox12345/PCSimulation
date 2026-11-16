import { ui } from "../../styles/ui";
export function PCArtwork() {
  return (
    <svg
      viewBox="0 0 500 260"
      role="img"
      aria-label="Technical illustration of an open desktop computer"
      className={ui("lab-art")}
    >
      <defs>
        <pattern
          id="pc-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="#253343"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect width="500" height="260" fill="url(#pc-grid)" />
      <g transform="translate(175,23)">
        <path
          d="M0 25 L115 0 L203 36 L88 64Z"
          fill="#303e4d"
          stroke="#718294"
        />
        <path
          d="M88 64 L203 36 L203 205 L88 238Z"
          fill="#1b2633"
          stroke="#718294"
        />
        <path
          d="M0 25 L88 64 L88 238 L0 194Z"
          fill="#111c28"
          stroke="#718294"
        />
        <path
          d="M10 47 L76 76 L76 207 L10 176Z"
          fill="#19373e"
          stroke="#326572"
        />
        <path
          d="M24 70 L52 83 L52 118 L24 105Z"
          fill="#45606b"
          stroke="#67d9d1"
        />
        <path
          d="M30 79 L46 86 L46 108 L30 101Z"
          fill="#14222f"
          stroke="#94b7bf"
        />
        <path
          d="M59 86 L63 88 L63 143 L59 141Z M67 89 L71 91 L71 146 L67 144Z"
          fill="#5ad4c9"
        />
        <path
          d="M10 134 L72 162 L82 151 L20 123Z"
          fill="#3b5264"
          stroke="#7d9eb1"
        />
        <path
          d="M10 134 L72 162 L72 177 L10 148Z"
          fill="#182836"
          stroke="#647d8d"
        />
        <path
          d="M10 161 L72 190 L72 211 L10 181Z"
          fill="#304252"
          stroke="#637b8d"
        />
        <ellipse
          cx="145"
          cy="100"
          rx="29"
          ry="32"
          fill="#121c27"
          stroke="#3b6576"
        />
        <ellipse
          cx="145"
          cy="100"
          rx="20"
          ry="23"
          fill="none"
          stroke="#61cec6"
          strokeWidth="2"
        />
        <ellipse
          cx="145"
          cy="171"
          rx="29"
          ry="32"
          fill="#121c27"
          stroke="#3b6576"
        />
        <ellipse
          cx="145"
          cy="171"
          rx="20"
          ry="23"
          fill="none"
          stroke="#61cec6"
          strokeWidth="2"
        />
        <circle cx="145" cy="100" r="7" fill="#547a86" />
        <circle cx="145" cy="171" r="7" fill="#547a86" />
      </g>
      <path
        d="M205 109 H111 L95 93 M244 184 H115"
        fill="none"
        stroke="#4a697e"
      />
      <circle cx="205" cy="109" r="3" fill="#71e1d5" />
      <text x="38" y="87" fill="#8ba4b6" fontSize="9" fontFamily="monospace">
        CPU SOCKET
      </text>
      <text x="38" y="188" fill="#8ba4b6" fontSize="9" fontFamily="monospace">
        EXPANSION
      </text>
      <text x="410" y="230" fill="#536c80" fontSize="10" fontFamily="monospace">
        FIG. 01
      </text>
    </svg>
  );
}
export function NetworkArtwork() {
  return (
    <svg
      viewBox="0 0 500 260"
      role="img"
      aria-label="Diagram of computers connected through a network switch"
      className={ui("lab-art")}
    >
      <defs>
        <pattern
          id="net-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".8" fill="#344351" />
        </pattern>
      </defs>
      <rect width="500" height="260" fill="url(#net-grid)" />
      <g stroke="#4a7ca3" strokeWidth="1.5" fill="none">
        <path d="M125 79 H250 V124 M375 79 H250 M125 204 H250 V146 M375 204 H250" />
        <path d="M250 50 V123" strokeDasharray="4 5" />
      </g>
      <g fill="#172838" stroke="#4c7a9c">
        <rect x="203" y="116" width="94" height="37" rx="6" />
        {[216, 232, 248, 264, 280].map((x) => (
          <rect
            key={x}
            x={x}
            y="130"
            width="8"
            height="9"
            rx="1"
            fill="#72b5db"
          />
        ))}
        {[
          [90, 50],
          [340, 50],
          [90, 175],
          [340, 175],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="70" height="47" rx="5" />
            <rect
              x={x + 7}
              y={y + 7}
              width="56"
              height="31"
              rx="2"
              fill="#1c3546"
            />
            <path d={`M${x + 35} ${y + 47}v8 m-13 0h26`} />
            <circle cx={x + 57} cy={y + 14} r="2" fill="#6addc1" />
          </g>
        ))}
      </g>
      <text x="215" y="174" fill="#849cae" fontSize="9" fontFamily="monospace">
        L2 SWITCH
      </text>
      <text x="93" y="122" fill="#6d8da5" fontSize="9" fontFamily="monospace">
        192.168.1.10
      </text>
      <text x="343" y="122" fill="#6d8da5" fontSize="9" fontFamily="monospace">
        192.168.1.20
      </text>
      <text x="410" y="245" fill="#536c80" fontSize="10" fontFamily="monospace">
        FIG. 02
      </text>
    </svg>
  );
}
