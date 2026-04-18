import "./Banner.css";

type Props = {
    title?: string;
    subtitle?: string;
    tags?: string[];
    activeTag?: string;
    onTagClick?: (tag: string) => void;
};

export default function Banner({
                                        title = "发现好视频",
                                        subtitle = "每天更新 · 精选内容 · 无限探索",
                                        tags = ["全部", "游戏", "音乐", "科技", "生活", "动漫", "美食"],
                                        activeTag = "全部",
                                        onTagClick,
                                    }: Props) {
    return (
        <div className="ab-root">
            {/* SVG 插画背景 */}
            <svg
                className="ab-illustration"
                viewBox="0 0 680 200"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="ab-sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d0a2e"/>
                        <stop offset="40%" stopColor="#1a1150"/>
                        <stop offset="100%" stopColor="#2d1b6e"/>
                    </linearGradient>
                    <linearGradient id="ab-moon-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff8e7"/>
                        <stop offset="100%" stopColor="#ffeaa0"/>
                    </linearGradient>
                    <linearGradient id="ab-moon-halo" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6a4fc8" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#3a2088" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="ab-city-far" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e1460"/>
                        <stop offset="100%" stopColor="#120d40"/>
                    </linearGradient>
                    <linearGradient id="ab-city-mid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16103d"/>
                        <stop offset="100%" stopColor="#0a0820"/>
                    </linearGradient>
                    <linearGradient id="ab-ground" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0e0b28"/>
                        <stop offset="100%" stopColor="#050310"/>
                    </linearGradient>
                    <clipPath id="ab-clip">
                        <rect width="680" height="200" rx="0"/>
                    </clipPath>
                </defs>

                <g clipPath="url(#ab-clip)">
                    {/* 天空 */}
                    <rect width="680" height="200" fill="url(#ab-sky)"/>

                    {/* 月亮 */}
                    <circle cx="120" cy="52" r="55" fill="#2a1878" opacity="0.5"/>
                    <circle cx="120" cy="52" r="38" fill="url(#ab-moon-halo)" opacity="0.6"/>
                    <circle cx="120" cy="52" r="26" fill="url(#ab-moon-glow)"/>
                    <circle cx="111" cy="44" r="7" fill="#f5dfa0" opacity="0.35"/>
                    <circle cx="126" cy="58" r="4" fill="#f5dfa0" opacity="0.2"/>

                    {/* 星星 */}
                    {[
                        [22,18,1.2,0.9,"#fff"],[55,8,0.8,0.7,"#fff"],[80,22,1,0.8,"#fff"],
                        [170,12,1.3,0.85,"#fff"],[210,6,0.7,0.6,"#fff"],[240,20,1.1,0.75,"#fff"],
                        [290,10,0.9,0.65,"#fff"],[330,18,1.4,0.9,"#c8aaff"],[370,5,0.8,0.7,"#fff"],
                        [410,15,1,0.8,"#fff"],[450,8,1.2,0.85,"#aaddff"],[490,22,0.7,0.6,"#fff"],
                        [530,10,1.1,0.75,"#fff"],[565,18,0.9,0.8,"#c8aaff"],[600,6,1.3,0.7,"#fff"],
                        [635,14,0.8,0.65,"#fff"],[660,24,1,0.8,"#aaddff"],[38,35,0.7,0.5,"#fff"],
                        [195,32,0.9,0.55,"#fff"],[315,30,0.7,0.6,"#c8aaff"],[500,35,0.8,0.5,"#fff"],
                        [620,32,1,0.6,"#fff"],
                    ].map(([cx,cy,r,op,fill], i) => (
                        <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={fill as string} opacity={op as number}/>
                    ))}

                    {/* 飘落花瓣 */}
                    {[
                        [200,44,"#ffb7c5"],[470,30,"#ffb7c5"],[350,20,"#c8aaff"],
                        [580,16,"#ffccd5"],[260,38,"#c8aaff"],
                    ].map(([cx,cy,fill],i) => (
                        <g key={i}>
                            <circle cx={cx as number} cy={cy as number} r="1.8" fill={fill as string} opacity="0.9"/>
                            <line x1={cx as number} y1={(cy as number)-2} x2={(cx as number)-4} y2={(cy as number)-8} stroke={fill as string} strokeWidth="0.8" opacity="0.6"/>
                            <line x1={cx as number} y1={(cy as number)-2} x2={(cx as number)+4} y2={(cy as number)-8} stroke={fill as string} strokeWidth="0.8" opacity="0.6"/>
                            <line x1={cx as number} y1={cy as number} x2={(cx as number)-6} y2={(cy as number)+4} stroke={fill as string} strokeWidth="0.8" opacity="0.5"/>
                            <line x1={cx as number} y1={cy as number} x2={(cx as number)+6} y2={(cy as number)+4} stroke={fill as string} strokeWidth="0.8" opacity="0.5"/>
                        </g>
                    ))}

                    {/* 远景建筑 */}
                    {[
                        [180,90,18,60],[200,100,14,50],[216,82,22,68],[240,95,16,55],
                        [258,78,20,72],[280,88,25,62],[307,98,12,52],[321,72,18,78],
                        [341,92,20,58],[363,85,16,65],[381,76,24,74],[407,94,14,56],
                        [423,68,20,82],[445,88,18,62],[465,96,16,54],[483,80,22,70],
                    ].map(([x,y,w,h],i) => (
                        <rect key={i} x={x} y={y} width={w} height={h} fill="url(#ab-city-far)"/>
                    ))}

                    {/* 远景窗口灯 */}
                    {[
                        [188,96,"#ffe066",0.6],[222,88,"#ffe066",0.7],[228,98,"#aaddff",0.6],
                        [263,84,"#ffe066",0.6],[285,92,"#ffe066",0.55],[326,78,"#aaddff",0.7],
                        [332,88,"#ffe066",0.5],[386,82,"#aaddff",0.65],[428,74,"#ffe066",0.7],
                        [450,92,"#aaddff",0.6],[488,86,"#ffe066",0.65],
                    ].map(([x,y,fill,op],i) => (
                        <rect key={i} x={x as number} y={y as number} width="3" height="2" fill={fill as string} opacity={op as number}/>
                    ))}

                    {/* 中景建筑 */}
                    {[
                        [0,108,30,92],[32,96,24,104],[58,115,20,85],[80,88,28,112],
                        [110,104,18,96],[130,78,32,122],[164,100,20,100],
                        [500,102,22,98],[524,86,30,114],[556,110,18,90],
                        [576,94,26,106],[604,82,32,118],[638,106,20,94],[660,90,20,110],
                    ].map(([x,y,w,h],i) => (
                        <rect key={i} x={x} y={y} width={w} height={h} fill="url(#ab-city-mid)"/>
                    ))}

                    {/* 中景窗口灯 */}
                    {[
                        [36,100,"#ffe066",0.8],[44,110,"#ffe066",0.6],[84,92,"#aaddff",0.75],
                        [92,106,"#ffe066",0.65],[134,84,"#ffe066",0.8],[144,96,"#aaddff",0.6],
                        [152,108,"#ffe066",0.7],[504,106,"#ffe066",0.75],[528,90,"#aaddff",0.7],
                        [536,104,"#ffe066",0.6],[580,98,"#ffe066",0.8],[588,112,"#aaddff",0.65],
                        [608,86,"#ffe066",0.75],[618,100,"#ffe066",0.6],[642,110,"#aaddff",0.7],
                    ].map(([x,y,fill,op],i) => (
                        <rect key={i} x={x as number} y={y as number} width="4" height="3" fill={fill as string} opacity={op as number}/>
                    ))}

                    {/* 路灯左 */}
                    <line x1="40" y1="120" x2="40" y2="200" stroke="#2a1a5e" strokeWidth="1.5"/>
                    <circle cx="40" cy="122" r="3" fill="#ffe066" opacity="0.9"/>
                    <circle cx="40" cy="140" r="1.5" fill="#ffe066" opacity="0.5"/>
                    <circle cx="40" cy="158" r="1.5" fill="#ffe066" opacity="0.5"/>

                    {/* 路灯右 */}
                    <line x1="640" y1="115" x2="640" y2="200" stroke="#2a1a5e" strokeWidth="1.5"/>
                    <circle cx="640" cy="117" r="3" fill="#aaddff" opacity="0.9"/>
                    <circle cx="640" cy="135" r="1.5" fill="#aaddff" opacity="0.5"/>
                    <circle cx="640" cy="153" r="1.5" fill="#aaddff" opacity="0.5"/>

                    {/* 樱花树左 */}
                    <line x1="10" y1="148" x2="10" y2="30" stroke="#2a1860" strokeWidth="1.2"/>
                    <path d="M10,148 Q-4,128 10,115 Q24,102 10,85" stroke="#2a1860" strokeWidth="1.2" fill="none"/>
                    <ellipse cx="10" cy="85" rx="12" ry="32" fill="#1a0f40" opacity="0.9"/>
                    <path d="M10,60 Q4,72 -2,65 Q6,58 10,60Z" fill="#ffb7c5" opacity="0.85"/>
                    <path d="M10,55 Q16,68 22,60 Q14,56 10,55Z" fill="#ffb7c5" opacity="0.85"/>
                    <path d="M10,70 Q2,80 -5,74 Q4,68 10,70Z" fill="#ffccd5" opacity="0.75"/>
                    <path d="M10,68 Q18,78 25,72 Q16,66 10,68Z" fill="#ffccd5" opacity="0.75"/>
                    <circle cx="10" cy="62" r="3" fill="#fff0f3"/>
                    <path d="M10,85 Q2,100 6,115 Q14,100 10,85Z" fill="#3a2488" opacity="0.9"/>
                    <path d="M10,85 Q18,100 14,115 Q6,100 10,85Z" fill="#2a1878" opacity="0.9"/>

                    {/* 樱花树右 */}
                    <line x1="670" y1="148" x2="670" y2="25" stroke="#2a1860" strokeWidth="1.2"/>
                    <path d="M670,148 Q684,128 670,110 Q656,92 670,72" stroke="#2a1860" strokeWidth="1.2" fill="none"/>
                    <ellipse cx="670" cy="72" rx="12" ry="35" fill="#1a0f40" opacity="0.9"/>
                    <path d="M670,45 Q664,58 658,50 Q666,44 670,45Z" fill="#ffb7c5" opacity="0.85"/>
                    <path d="M670,42 Q676,55 682,48 Q674,42 670,42Z" fill="#ffb7c5" opacity="0.85"/>
                    <path d="M670,55 Q662,66 655,60 Q664,54 670,55Z" fill="#ffccd5" opacity="0.75"/>
                    <path d="M670,53 Q678,64 685,58 Q676,52 670,53Z" fill="#ffccd5" opacity="0.75"/>
                    <circle cx="670" cy="48" r="3" fill="#fff0f3"/>
                    <path d="M670,72 Q662,88 666,105 Q674,88 670,72Z" fill="#3a2488" opacity="0.9"/>
                    <path d="M670,72 Q678,88 674,105 Q666,88 670,72Z" fill="#2a1878" opacity="0.9"/>

                    {/* 地面 */}
                    <rect x="0" y="148" width="680" height="52" fill="url(#ab-ground)"/>
                    <rect x="0" y="158" width="680" height="42" fill="#030210" opacity="0.85"/>
                    <line x1="0" y1="158" x2="680" y2="158" stroke="#3a2888" strokeWidth="0.5" opacity="0.8"/>
                    <path d="M0,148 Q170,138 340,142 Q510,146 680,140 L680,200 L0,200 Z" fill="#030210"/>
                </g>
            </svg>

            {/* 内容叠加层 */}
            <div className="ab-content">
                <div className="ab-text">
                    <h1 className="ab-title">{title}</h1>
                    <p className="ab-subtitle">{subtitle}</p>
                </div>
                <div className="ab-tags">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            className={`ab-tag ${tag === activeTag ? "ab-tag--active" : ""}`}
                            onClick={() => onTagClick?.(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}