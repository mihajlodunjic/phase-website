export function LoopFallback() {
  return (
    <svg className="loop-fallback" viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="loop-silver" x1="95" y1="120" x2="470" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#373f3b" /><stop offset=".16" stopColor="#c5cec7" /><stop offset=".3" stopColor="#6b766f" /><stop offset=".49" stopColor="#424c46" /><stop offset=".64" stopColor="#181f1b" /><stop offset=".8" stopColor="#a3b0a7" /><stop offset="1" stopColor="#29332d" />
        </linearGradient>
        <linearGradient id="loop-edge" x1="100" y1="100" x2="450" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="#dbe1da" /><stop offset=".5" stopColor="#758379" /><stop offset=".8" stopColor="#c9d3cb" /><stop offset="1" stopColor="#4d5a50" /></linearGradient>
      </defs>
      <path fillRule="evenodd" fill="url(#loop-silver)" d="M220 58C131 27 61 105 62 229c0 136 33 245 132 285 107 44 279 12 326-89 55-121-114-294-300-367ZM224 146c-56-22-92 40-90 133 1 90 25 154 70 166 65 18 188-60 227-118 29-47-69-124-207-181Z" />
      <path stroke="url(#loop-edge)" strokeWidth="2" d="M221 66C132 37 72 106 72 231c0 131 30 234 125 274M223 178c-36-18-60 30-60 103 0 69 15 126 46 136 45 14 138-43 193-96" />
      <path stroke="#e5e9e2" strokeWidth="3" strokeLinecap="round" d="M100 171c-13 85 0 220 56 282M233 83c101 29 215 118 249 202" opacity=".64" />
      <path stroke="#c2ccc3" strokeWidth="1" d="M107 174c-11 88 3 220 59 276M113 176c-9 87 5 215 59 270M119 178c-8 86 7 212 59 262" opacity=".13" />
    </svg>
  )
}
