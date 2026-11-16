/** Static Tailwind recipes. Full class names stay visible to the Tailwind scanner.
 * Semantic hooks are retained for canvas integration and browser tests. */
const recipes: Record<string, string> = {
  "text-muted": "text-lab-muted",
  "text-cyan": "text-lab-success!",
  "text-amber": "text-lab-warning!",
  "app-shell":
    "grid grid-cols-[224px_minmax(0,_1fr)] min-h-screen max-[1250px]:grid-cols-[190px_minmax(0,_1fr)] max-[980px]:grid-cols-[76px_minmax(0,_1fr)] max-[680px]:grid-cols-1",
  sidebar:
    "sticky top-0 h-screen bg-lab-sidebar border-r border-r-[#25303d] p-[30px_16px_14px] flex flex-col z-[20] max-[1250px]:pl-[10px] max-[1250px]:pr-[10px] max-[980px]:p-[25px_10px_14px] max-[980px]:[&_.nav-copy]:hidden max-[680px]:static max-[680px]:h-auto max-[680px]:flex-row max-[680px]:items-center max-[680px]:p-[12px] max-[680px]:border-b max-[680px]:border-b-[#2b3c49] max-[680px]:border-r-0 max-[680px]:gap-[12px] max-[680px]:[&_nav]:flex max-[680px]:[&_nav]:gap-[4px] max-[680px]:[&_nav]:flex-1 max-[680px]:[&_nav]:justify-center",
  brand:
    "flex items-center gap-[12px] text-[19px] tracking-[2px] font-bold p-[0_13px] max-[980px]:p-[0_9px] max-[980px]:mb-[45px] max-[680px]:m-0 max-[680px]:p-0",
  "brand-mark":
    "w-[37px] h-[40px] grid place-items-center text-[#89e2d4] border border-[#438078] rounded-[10px] bg-[#1b3637] [transform:rotate(-4deg)] max-[680px]:h-[32px] max-[680px]:w-[32px]",
  "brand-sub":
    "block text-[9px] tracking-[3px] font-normal text-[#8197a6] mt-[2px]",
  "nav-section":
    "text-[#62768a] text-[9px] font-semibold tracking-[1.8px] m-[52px_16px_13px]",
  "nav-item":
    "flex items-center gap-[12px] p-[12px_14px] m-[5px_0] rounded-[6px] text-[#8d9eaf] text-[13px] whitespace-nowrap [&:hover]:bg-[#1a2531] [&:hover]:text-[#e6eff5] [&.active]:text-[#8ce3d4] [&.active]:bg-[#1b3338] [&.active]:shadow-[inset_2px_0_#77dfd0] max-[1250px]:gap-[9px] max-[1250px]:p-[12px_10px] max-[980px]:justify-center max-[980px]:p-[12px] max-[680px]:m-0 max-[680px]:p-[9px]",
  "nav-tag":
    "ml-auto text-[9px] text-[#698797] border border-[#344c58] rounded-[3px] p-[1px_4px]",
  "sidebar-bottom":
    "mt-auto max-[680px]:m-0 max-[680px]:flex max-[680px]:[&_.nav-item]:p-[9px]",
  "local-note":
    "m-[30px_11px_20px] text-[11px] text-[#a6b8c4] [&_p]:text-[#63788a] [&_p]:text-[10px] [&_p]:pl-[14px] [&_p]:mt-[6px]",
  "status-dot":
    "inline-block w-[6px] h-[6px] rounded-[50%] bg-[#78d6b5] mr-[8px]",
  "collapse-button":
    "border-t border-t-[#26313b] w-full flex items-center justify-center gap-[9px] text-[#698092] text-[10px] mt-[12px] pt-[16px] max-[680px]:hidden",
  "sidebar-collapsed":
    "[&.sidebar-collapsed]:grid-cols-[76px_minmax(0,_1fr)] [&_.nav-copy]:hidden [&_.sidebar]:p-[30px_10px_14px] [&_.brand]:p-[0_9px] [&_.brand]:mb-[48px] [&_.nav-item]:justify-center [&_.nav-item]:p-[12px] max-[1250px]:[&.sidebar-collapsed]:grid-cols-[76px_minmax(0,_1fr)] max-[680px]:[&.sidebar-collapsed]:grid-cols-1 max-[680px]:[&_.brand]:m-0 max-[680px]:[&_.brand]:p-0",
  "main-shell": "min-w-0 flex flex-col",
  topbar:
    "h-[66px] border-b border-b-[#25303d] p-[0_38px] flex items-center justify-between text-[12px] max-[980px]:p-[0_24px] max-[680px]:h-[48px] max-[680px]:p-[0_18px]",
  breadcrumb: "p-[0_15px] text-[#3b4b5a]",
  environment:
    "text-[#8d9dab] text-[11px] flex items-center max-[980px]:text-[10px]",
  version:
    "text-[9px] ml-[16px] p-[3px_7px] border border-[#2b3744] rounded-[4px] text-[#718595] max-[680px]:hidden",
  "lab-main": "flex-1 min-w-0",
  page: "max-w-[1600px] m-[0_auto] p-[37px_38px_28px] max-[1250px]:pl-[26px] max-[1250px]:pr-[26px] max-[980px]:p-[28px_22px] max-[680px]:p-[24px_16px]",
  "page-heading":
    "flex items-center justify-between gap-[20px] mb-[32px] [&_.eyebrow]:text-[#6cbaad] [&_.eyebrow]:mb-[12px] [&_p]:text-[#8c9dac] [&_p]:text-[13px] [&_p]:mt-[12px] [&_p]:max-w-[640px] max-[980px]:items-start max-[980px]:flex-wrap max-[680px]:mb-[25px] max-[680px]:[&_h1]:text-[25px] max-[680px]:[&_p]:text-[12px]",
  eyebrow:
    "[font-family:ui-monospace,_Consolas,_monospace] text-[9px] font-medium text-[#849eaf] tracking-[1.6px] flex items-center gap-[7px]",
  dashboard:
    "[&_.page-heading]:mt-[6px] [&_.page-heading]:mb-[38px] max-[680px]:[&_.page-heading]:mb-[28px]",
  "section-label":
    "flex items-center justify-between text-[#97a8b9] text-[10px] tracking-[1.5px] m-[0_0_16px] [&_span_+_span]:text-[#62788a] [&_span_+_span]:text-[11px] [&_span_+_span]:tracking-[0px] max-[680px]:[&_span_+_span]:hidden",
  "lab-cards":
    "grid grid-cols-2 gap-[22px] max-[680px]:grid-cols-1 max-[680px]:gap-[18px]",
  "lab-card":
    "border border-[#2a3948] bg-lab-panel rounded-[10px] overflow-hidden [transition:border-color_0.2s] [&:hover]:border-[#466574] [&_h2]:text-[23px] [&_h2]:mb-[12px] [&_h2]:tracking-[-0.6px] [&_p]:text-[#8a9daa] [&_p]:text-[12px] [&_p]:max-w-[430px] [&_p]:min-h-[61px] [&_.button]:w-full max-[1250px]:[&_h2]:text-[21px] max-[1250px]:[&_p]:min-h-[81px] max-[980px]:[&_h2]:text-[19px] max-[980px]:[&_p]:min-h-[100px] max-[680px]:[&_h2]:text-[22px] max-[680px]:[&_p]:min-h-0",
  "art-wrap":
    "relative bg-[#14212a] border-b border-b-[#293a47] pt-[8px] [&.blue]:bg-[#14202c]",
  "art-badge":
    "absolute top-[18px] left-[22px] flex gap-[7px] items-center [font-family:monospace] text-[9px] tracking-[1px] text-[#a9c3cf] z-[1]",
  "lab-art":
    "w-full h-[232px] block min-[1700px]:h-[270px] max-[1250px]:h-[210px] max-[980px]:h-[185px] max-[680px]:h-[225px]",
  "lab-card-content": "p-[25px_26px_18px] max-[1250px]:p-[22px_20px_17px]",
  "card-kicker":
    "flex justify-between items-center text-[#79bdba] text-[9px] tracking-[1.6px] mb-[12px] [&_span]:[font-family:monospace] [&_span]:text-[#556d80] [&_span]:text-[12px]",
  "feature-tags":
    "flex flex-wrap gap-[7px] m-[21px_0_24px] [&_span]:text-[9px] [&_span]:p-[4px_7px] [&_span]:bg-[#1b2733] [&_span]:text-[#a3b5c3] [&_span]:border [&_span]:border-[#2c3a47] [&_span]:rounded-[4px] max-[980px]:min-h-[50px] max-[680px]:min-h-0",
  button:
    "inline-flex items-center justify-center gap-[9px] min-h-[38px] p-[9px_15px] border border-[#3a4d60] rounded-[5px] text-[12px] font-semibold whitespace-nowrap [&.primary]:bg-lab-accent [&.primary]:border-[#7cdfcd] [&.primary]:text-[#102c2c] [&.primary:hover]:bg-[#a0eddf] [&.primary:hover]:border-[#a0eddf] [&.secondary]:bg-[#213242] [&.secondary]:text-[#b9d5e4] [&.secondary]:border-[#3d5c74] [&.secondary:hover]:bg-[#2d4659] [&.ghost]:bg-[#151e28] [&.ghost]:border-[#2b3b49] [&.ghost]:text-[#a4b5c3] [&.ghost:hover]:bg-[#23313e] [&.danger]:bg-[#47282a] [&.danger]:border-[#9c5557] [&.danger]:text-[#ffd2cc] [&.full]:w-full",
  "card-foot":
    "flex items-center text-[9px] text-[#7f95a5] mt-[17px] [&_span:last-child]:ml-auto [&_span:last-child]:text-[#647b8d] [&_.status-dot]:w-[5px] [&_.status-dot]:h-[5px]",
  "learning-strip":
    "flex items-center gap-[16px] p-[21px_23px] border border-[#2a3643] bg-[#131c25] rounded-[7px] m-[26px_0_35px] [&_h3]:text-[13px] [&_h3]:mb-[5px] [&_p]:text-[#8095a7] [&_p]:text-[11px] [&_a]:ml-auto [&_a]:flex [&_a]:gap-[12px] [&_a]:items-center [&_a]:text-[11px] [&_a]:text-[#a6c7d3] [&_a]:whitespace-nowrap max-[1250px]:[&_a]:max-w-[150px] max-[1250px]:[&_a]:[white-space:normal] max-[1250px]:[&_a]:text-[10px] max-[980px]:flex-wrap max-[980px]:[&_a]:max-w-none max-[980px]:[&_a]:whitespace-nowrap max-[980px]:[&_a]:ml-[64px] max-[680px]:p-[16px] max-[680px]:gap-[12px] max-[680px]:[&_>_div]:flex-1 max-[680px]:[&_>_div]:min-w-[190px] max-[680px]:[&_a]:ml-0",
  "learning-icon": "bg-[#1d3037] text-[#79cbbd] p-[12px] rounded-[7px]",
  principles:
    "grid grid-cols-4 gap-[26px] m-[23px_0] [&_svg]:text-[#7b9faf] [&_svg]:mb-[12px] [&_h3]:text-[12px] [&_h3]:font-medium [&_h3]:mb-[8px] [&_p]:text-[#788e9f] [&_p]:text-[11px] [&_p]:leading-[1.8] max-[980px]:grid-cols-2 max-[680px]:gap-[22px]",
  "dashboard-note":
    "flex gap-[8px] items-center text-[#668193] text-[10px] mt-[31px] max-[680px]:text-[9px] max-[680px]:leading-[1.7]",
  "lab-footer":
    "flex justify-between gap-[15px] p-[18px_38px] border-t border-t-[#222f3c] text-[9px] tracking-[0.5px] text-[#6f8597] [&_>_span:last-child]:flex [&_>_span:last-child]:gap-[7px] [&_>_span:last-child]:items-center max-[680px]:p-[16px] max-[680px]:text-[8px] max-[680px]:flex-wrap",
  panel: "border border-lab-border rounded-[7px] bg-lab-panel overflow-hidden",
  "panel-heading":
    "min-h-[45px] flex items-center justify-between p-[10px_16px] border-b border-b-[#293745] [&_h2]:text-[12px] [&_h2]:tracking-[0.1px] [&_h2]:font-semibold",
  "panel-body": "p-[16px]",
  "panel-description": "text-[11px] text-[#869aaa] m-[10px_0_15px]",
  "heading-actions":
    "flex gap-[8px] max-[680px]:flex-wrap max-[680px]:gap-[6px] max-[680px]:[&_.button]:text-[10px] max-[680px]:[&_.button]:p-[8px_10px]",
  "simulator-page":
    "min-[981px]:p-[28px_26px] [&.simulator-page]:max-w-[1800px] [&_.page-heading]:mb-[24px] [&_h1]:text-[27px] [&_.page-heading_p]:mt-[6px] [&_.page-heading_p]:text-[12px] [&_.page-heading_.eyebrow]:mb-[7px] max-[680px]:[&_.page-heading]:gap-[14px]",
  "pc-layout":
    "grid grid-cols-[238px_minmax(320px,_1fr)_254px] gap-[16px] [align-items:start] max-[1250px]:grid-cols-[220px_minmax(300px,_1fr)] max-[1250px]:[&_>_.right-stack]:[grid-column:1/-1] max-[1250px]:[&_>_.right-stack]:grid max-[1250px]:[&_>_.right-stack]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:[&_>_.right-stack]:col-auto max-[680px]:[&_>_.right-stack]:flex",
  "inventory-panel": "[&_.panel-body]:p-[12px] max-[680px]:row-start-[2]",
  "search-field":
    "flex items-center gap-[9px] bg-[#0f1822] border border-[#30414e] rounded-[5px] p-[10px_12px] text-[#70899c] max-w-[450px] mb-[22px] [&_input]:min-w-0 [&_input]:w-full [&_input]:bg-[none] [&_input]:[border:none] [&_input]:text-[#cfdae3] [&_input]:outline-none [&_input]:text-[12px] [&:focus-within]:border-[#77dfd0] [&.compact]:p-[8px] [&.compact]:mb-[13px] [&.compact_input]:text-[10px]",
  "category-tabs":
    "flex flex-wrap gap-[5px] border-b border-b-[#2a3947] pb-[13px] mb-[12px] [&_button]:text-[9px] [&_button]:text-[#8fa4b5] [&_button]:border [&_button]:border-[#2d3c49] [&_button]:p-[5px_7px] [&_button]:rounded-[4px] [&_button.selected]:bg-[#243c40] [&_button.selected]:border-[#4e827c] [&_button.selected]:text-[#9ee4d7]",
  "inventory-list":
    "flex flex-col gap-[7px] max-[680px]:grid max-[680px]:grid-cols-2",
  "inventory-item":
    "flex items-center text-left gap-[9px] p-[10px_8px] bg-[#17232e] border border-[#2d3c49] rounded-[5px] w-full [&:hover]:bg-[#20313e] [&.selected]:border-[#73c9bd] [&.selected]:bg-[#203738] [&_strong]:block [&_strong]:text-[10px] [&_strong]:font-semibold [&_small]:block [&_small]:text-[9px] [&_small]:text-[#859baa] [&_small]:mt-[5px] [&_small]:[overflow-wrap:anywhere] [&_>_svg]:ml-auto",
  "part-icon": "flex p-[7px] bg-[#243541] text-[#8caab6] rounded-[4px]",
  "part-details":
    "mt-[21px] border-t border-t-[#2c3b49] pt-[17px] [&_h3]:text-[13px] [&_h3]:mt-[8px] [&_.button]:text-[10px] [&_.button]:mt-[12px]",
  hint: "p-[12px] bg-[#192d35] border border-[#2c4b57] rounded-[5px] text-[#9cb8c4] text-[10px] leading-[1.7] mt-[14px] [&_strong]:text-[#b5dedc] [&_strong]:text-[11px] [&_p]:m-[5px_0] [&_a]:text-[#7bddd0] [&_a]:text-[10px] [&_a]:block [&_a]:mt-[8px]",
  "inventory-help":
    "flex items-center flex-col text-center gap-[12px] p-[26px_8px] text-[#6f8a9e] text-[11px] max-[680px]:p-[15px]",
  workbench:
    "border border-[#304250] rounded-[7px] overflow-hidden bg-[#121d27]",
  "workspace-toolbar":
    "h-[44px] flex items-center justify-between p-[0_14px] border-b border-b-[#283b49] text-[10px] text-[#b5c4cf] [&_.text-muted]:text-[9px]",
  "icon-button":
    "inline-flex items-center justify-center w-[27px] h-[27px] rounded-[4px] text-[#8ca5b6] [&:hover]:bg-[#30414d] [&:hover]:text-[#b9ece4]",
  scene:
    "h-[467px] relative [&_canvas]:touch-none min-[1700px]:h-[550px] max-[1250px]:h-[430px] max-[680px]:h-[395px]",
  "scene-caption":
    "absolute pointer-events-none top-[17px] left-[16px] text-[8px] tracking-[1.5px] text-[#7f9bac] [&_span]:block [&_span]:text-[7px] [&_span]:text-[#668699] [&_span]:mt-[5px]",
  "workspace-controls":
    "flex justify-center gap-[18px] border-t border-t-[#283947] p-[10px_8px] text-[#7b95a7] text-[9px] bg-[#121e29] [&_span:before]:content-['·'] [&_span:before]:text-[#678d9b] [&_span:before]:mr-[7px] max-[680px]:text-[8px] max-[680px]:gap-[8px]",
  "slot-label":
    "text-[#c8fff2] bg-[#194a48] border border-[#83ead8] p-[7px_10px] rounded-[5px] whitespace-nowrap text-[10px] shadow-[0_4px_18px_#0008]",
  "status-message":
    "flex gap-[9px] items-start p-[14px] text-[#91afbe] text-[10px] leading-[1.7] border-t border-t-[#2b3b49] min-h-[60px] bg-[#172732] [&_svg]:text-[#77c9c2] [&_svg]:mt-[2px]",
  "build-summary":
    "grid grid-cols-[repeat(3,_1fr)] gap-[5px] p-[19px_14px] border-t border-t-[#293c4b] [&_.eyebrow]:text-[7px] [&_.eyebrow]:tracking-[1px] [&_strong]:block [&_strong]:text-[18px] [&_strong]:font-medium [&_strong]:mt-[8px] [&_strong_small]:text-[9px] [&_strong_small]:text-[#7892a5] [&_>_div:last-child_strong]:text-[13px] [&_>_div:last-child_strong]:mt-[12px]",
  "right-stack":
    "flex flex-col gap-[16px] [&_h3]:text-[14px] [&_h3]:leading-[1.5]",
  "mission-badge":
    "inline-block text-[8px] tracking-[1.2px] text-[#79cfc0] border border-[#365951] rounded-[3px] bg-[#1b332f] p-[4px_6px] mb-[13px]",
  checklist: "flex flex-col gap-[12px] m-[19px_0]",
  "check-item":
    "flex items-center gap-[9px] text-[10px] leading-[1.5] text-[#8da3b4] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:justify-center [&_>_span]:shrink-0 [&_>_span]:w-[16px] [&_>_span]:h-[16px] [&_>_span]:border [&_>_span]:border-[#3e5464] [&_>_span]:rounded-[50%] [&.done]:text-[#b0d5cd] [&.done_>_span]:bg-[#24453f] [&.done_>_span]:border-[#579d8e] [&.done_>_span]:text-[#8ae6cc]",
  "installed-row":
    "flex items-center justify-between border-b border-b-[#283745] p-[10px_0] text-[10px] [&:first-child]:pt-0 [&:last-child]:border-b-0 [&_small]:block [&_small]:text-[8px] [&_small]:tracking-[1px] [&_small]:text-[#6f8a9b] [&_small]:mb-[6px]",
  "diagnostic-panel": "mt-[20px]",
  "diagnostic-grid": "flex gap-[20px] max-[980px]:flex-col",
  "diagnostic-list": "flex-1 min-w-0",
  diagnostic:
    "flex items-start gap-[10px] p-[12px_8px] border-b border-b-[#273845] text-[11px] [&:last-child]:border-0 [&_>_svg]:text-[#7c9bb0] [&_>_svg]:mt-[1px] [&_strong]:text-[11px] [&_strong]:font-medium [&_p]:text-[10px] [&_p]:text-[#829bab] [&_p]:mt-[3px] [&_>_span]:ml-auto [&_>_span]:text-[8px] [&_>_span]:uppercase [&_>_span]:text-[#718b9d] [&_>_span]:pt-[2px] [&.error_>_svg]:text-[#ed9d8f] [&.error_>_span]:text-[#ed9d8f] [&.warning_>_svg]:text-[#e2b97e] [&.warning_>_span]:text-[#e2b97e] [&.valid_>_svg]:text-[#79d4b9] [&.valid_>_span]:text-[#79d4b9] max-[680px]:[&_>_span]:hidden",
  feedback:
    "p-[11px] rounded-[4px] m-[12px_0] text-[10px] leading-[1.7] [&_p_+_p]:mt-[8px] [&.error]:bg-[#342729] [&.error]:text-[#e6b7ab] [&.error]:border [&.error]:border-[#67423e] [&.success]:bg-[#1c3931] [&.success]:text-[#8cd8b9] [&.success]:flex [&.success]:gap-[8px] [&.success]:items-center [&.success]:border [&.success]:border-[#365d4b]",
  "post-console":
    "bg-[#0d1720] p-[20px] [font-family:monospace] min-w-[265px] text-[10px] leading-[2.4] border border-[#2b414e] rounded-[5px] [&_.eyebrow]:text-[8px] [&_.eyebrow]:mb-[14px] [&_strong]:block [&_strong]:text-[10px] [&_strong]:mt-[15px] [&_strong]:max-w-[250px] max-[980px]:w-full",
  "muted-note": "text-[#6c8496] text-[10px] mt-[18px]",
  "confirm-bar":
    "flex items-center gap-[12px] p-[14px] bg-[#352d27] border border-[#6c5742] rounded-[5px] mb-[18px] text-[12px] max-[680px]:flex-wrap",
  narrow: "[&.narrow]:max-w-[1000px] ml-0",
  "setting-row":
    "flex items-center justify-between gap-[22px] p-[22px_5px] border-b border-b-[#2c3a47] [&:last-child]:border-0 [&_strong]:text-[13px] [&_strong]:font-medium [&_p]:text-[#839aac] [&_p]:text-[11px] [&_p]:mt-[7px] [&_input]:w-[19px] [&_input]:h-[19px] [&_input]:accent-lab-accent",
  "lesson-grid": "grid grid-cols-2 gap-[18px] max-[680px]:grid-cols-1",
  lesson:
    "p-[24px] scroll-mt-[24px] [&_.eyebrow]:text-[#76baaf] [&_.eyebrow]:text-[9px] [&_h2]:text-[18px] [&_h2]:m-[16px_0_12px] [&_p]:text-[12px] [&_p]:text-[#91a5b5] [&_.hint]:text-[11px]",
  "empty-state": "p-[50px] text-center text-[13px] text-[#8ea8b8]",
  "network-layout":
    "grid grid-cols-[minmax(400px,_1fr)_270px] gap-[18px] mb-[20px] max-[1250px]:grid-cols-[minmax(300px,_1fr)_240px] max-[980px]:grid-cols-1 max-[980px]:[&_>_.right-stack]:grid max-[980px]:[&_>_.right-stack]:grid-cols-2 max-[680px]:[&_>_.right-stack]:flex",
  "network-main": "min-w-0",
  "device-palette":
    "flex items-center flex-wrap gap-[7px] p-[13px] bg-[#17232e] border border-[#2b3d4b] rounded-[7px_7px_0_0] [&_.eyebrow]:text-[8px] [&_.eyebrow]:mr-[6px] [&_button]:flex [&_button]:items-center [&_button]:gap-[7px] [&_button]:text-[10px] [&_button]:p-[8px] [&_button]:bg-[#213441] [&_button]:border [&_button]:border-[#395263] [&_button]:rounded-[4px] [&_button]:text-[#b4cdd6] [&_button:hover]:bg-[#304b5a] [&_button:hover]:border-[#7fbeb9] [&_button_>_span]:text-[#6f9da5] max-[1250px]:[&_.eyebrow]:w-full max-[680px]:[&_button]:text-[9px] max-[680px]:gap-[6px] max-[680px]:p-[10px]",
  "network-canvas":
    "h-[510px] relative border border-[#2c3e4e] border-t-0 bg-[#101923] min-[1700px]:h-[580px] max-[680px]:h-[430px]",
  "device-node":
    "w-[155px] p-[14px_14px_23px] bg-[#192b39] border border-[#476174] rounded-[7px] shadow-[0_5px_15px_#0002] text-[11px] [&.selected]:border-[#8fe0d0] [&.selected]:shadow-[0_0_0_2px_#72cabc30] [&.switch]:bg-[#1b3237] [&.switch]:border-[#3e716f] [&.router]:bg-[#2a2b3c] [&.router]:border-[#68658a] [&_strong]:block [&_strong]:[overflow-wrap:anywhere] [&_strong]:font-medium",
  "device-node-top": "flex justify-between items-center mb-[8px]",
  "device-icon": "text-[#8bc6d1]",
  "node-kind":
    "[font-family:monospace] text-[8px] uppercase text-[#6f9eac] tracking-[1px]",
  "node-ip": "block [font-family:monospace] text-[9px] mt-[7px] text-[#8ea9b9]",
  "node-ports": "absolute bottom-0 left-0 right-0 h-[16px]",
  "port-label":
    "absolute bottom-0 text-[7px] [transform:translateX(-50%)] pb-[7px] text-[#89aeb7]",
  "canvas-empty":
    "absolute left-[50%] top-[47%] [transform:translate(-50%,_-50%)] w-[85%] pointer-events-none text-center text-[#547589] [&_svg]:m-[0_auto_16px] [&_svg]:text-[#426a7c] [&_h3]:text-[16px] [&_h3]:text-[#8fabbb] [&_h3]:font-normal [&_p]:text-[11px] [&_p]:m-[10px_0] [&_>_span]:text-[9px] [&_>_span]:text-[#5e8295]",
  "canvas-label":
    "absolute top-[16px] left-[15px] pointer-events-none [font-family:monospace] text-[8px] tracking-[1px] text-[#5a7b90] [&_span]:block [&_span]:mt-[5px] [&_span]:text-[8px] [&_span]:tracking-[0px]",
  "form-field":
    "flex flex-col gap-[7px] text-[#8da4b6] text-[10px] m-[13px_0] [&_input]:bg-[#0f1b25] [&_input]:border [&_input]:border-[#304655] [&_input]:rounded-[4px] [&_input]:p-[9px_10px] [&_input]:text-[#c5dce6] [&_input]:outline-none [&_input]:w-full [&_input]:text-[11px] [&_select]:bg-[#0f1b25] [&_select]:border [&_select]:border-[#304655] [&_select]:rounded-[4px] [&_select]:p-[9px_10px] [&_select]:text-[#c5dce6] [&_select]:outline-none [&_select]:w-full [&_select]:text-[11px] [&_input:focus]:border-[#77d8c7] [&_select:focus]:border-[#77d8c7]",
  "config-title":
    "flex items-center gap-[9px] text-[12px] text-[#b2d2de] [&_.icon-button]:ml-auto",
  "saved-label": "text-[9px] text-[#658a8d] leading-[1.6] mt-[16px]",
  "ping-panel": "mt-[18px]",
  "ping-controls":
    "flex gap-[13px] items-end [&_.form-field]:flex-1 [&_.form-field]:m-0 [&_.button]:h-[35px] [&_.button]:min-h-[35px] max-[680px]:flex-wrap max-[680px]:gap-[8px] max-[680px]:[&_.form-field]:min-w-[100px] max-[680px]:[&_.button]:w-full max-[680px]:[&_.button]:mt-[5px]",
  "ping-arrow": "self-center pt-[17px] text-[#6b92a6]",
  "ping-console":
    "bg-[#0d1821] border border-[#2b414e] rounded-[4px] mt-[16px] p-[16px] [font-family:monospace] text-[10px] leading-[1.8] text-[#7692a5] min-h-[70px] [&_p]:text-[#94adbb] [&_p]:mt-[7px]",
  "path-line": "text-[#6fa99e] mt-[12px]",
  "reduce-motion": "[&_*]:[animation:none]! [&_*]:[transition:none]!",
};

/** Combine reusable component recipes, modifiers, and ordinary utility classes. */
export function ui(classes: string): string {
  const expanded = classes
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((name) =>
      recipes[name] ? [name, ...recipes[name].split(" ")] : [name],
    );
  return [...new Set(expanded)].join(" ");
}
