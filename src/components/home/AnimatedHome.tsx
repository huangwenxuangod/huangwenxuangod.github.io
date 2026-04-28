import type { ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Brain,
  CircleDot,
  FolderKanban,
  Route,
  Trophy,
} from "lucide-react";

export type HomeItem = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

type TimelineItem = HomeItem & {
  type: string;
  href: string;
};

type Props = {
  essays: HomeItem[];
  diaries: HomeItem[];
  projects: HomeItem[];
  achievements: HomeItem[];
  timeline: TimelineItem[];
};

function formatDateDot(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${y}.${m}.${d}`;
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const shell = "w-full px-[clamp(20px,4vw,72px)]";
const sectionPad = "py-[clamp(76px,11vw,148px)]";
const label = "font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]";
const iconClass = "h-5 w-5 shrink-0 text-[var(--accent)]";

const workMap = [
  { title: "AI 产品化", text: "把模型能力变成真实可用的工具、流程和产品原型。", icon: Brain },
  { title: "内容系统", text: "从问题、选题、写作、发布到复盘，沉淀可重复的表达链路。", icon: BookOpen },
  { title: "自动化工作流", text: "把重复动作交给系统，把注意力留给判断和创造。", icon: Route },
  { title: "个人商业模式", text: "围绕自由、现金流、长期能力和真实需求持续实验。", icon: CircleDot },
];

function StorySection({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      className={`${shell} ${sectionPad} border-b border-[var(--border)] ${className}`}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="mb-[clamp(36px,6vw,84px)] max-w-[980px]">
        <span className={label}>{eyebrow}</span>
        <h2 className="mt-3 text-[clamp(42px,7vw,96px)] font-black leading-[1] tracking-normal text-[var(--text)]">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function AnimatedHome({
  essays,
  diaries,
  projects,
  achievements,
  timeline,
}: Props) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <div className="w-full pb-24">
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-[var(--accent)]"
        style={{ scaleX }}
      />

      <section
        id="top"
        className={`${shell} relative flex min-h-[calc(100vh-96px)] flex-col justify-center border-b border-[var(--border)] py-[clamp(76px,12vw,156px)]`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_58%,rgba(110,247,231,0.12),transparent_22rem),linear-gradient(90deg,rgba(110,247,231,0.06),transparent_30%)]" />

        <motion.div
          className="max-w-[1040px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className={label}>Wenxuan road / building in public</span>
          <h1 className="mt-5 text-[clamp(54px,10vw,136px)] font-black leading-[0.96] tracking-normal text-[var(--text)]">
            文轩的自由之路
          </h1>
          <p className="mt-8 max-w-[820px] text-[clamp(17px,1.35vw,23px)] leading-[1.85] text-[var(--muted)]">
            我在用 AI、内容和产品实验，搭建自己的自由之路。这里记录我正在做什么，做出了什么，以及一路走来的思考。
          </p>
          <blockquote className="mt-9 max-w-[680px] border-l-2 border-[var(--accent)] pl-5 text-sm leading-[1.9] text-[var(--text)]">
            世上本没有路，走的人多了，也便成了路。我的自由之路也是这样：先走，再记录。
          </blockquote>
        </motion.div>

        <motion.a
          className="absolute bottom-8 right-[clamp(20px,4vw,72px)] inline-flex items-center gap-2 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"
          href="#now"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          aria-label="继续向下阅读"
        >
          <span>Scroll</span>
          <ArrowDown aria-hidden="true" className={iconClass} />
        </motion.a>
      </section>

      <StorySection id="now" eyebrow="01 / Now" title="我正在做什么">
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {workMap.map((item) => {
            const Icon = item.icon;
            return (
              <article
                className="grid min-h-[144px] grid-cols-1 items-center gap-5 py-[clamp(30px,4vw,54px)] md:grid-cols-[48px_minmax(240px,0.72fr)_minmax(320px,1fr)] md:gap-[clamp(28px,5vw,84px)]"
                key={item.title}
              >
                <Icon aria-hidden="true" className={iconClass} />
                <h3 className="text-[clamp(28px,3.2vw,48px)] font-black leading-[1.12] text-[var(--text)]">
                  {item.title}
                </h3>
                <p className="max-w-[660px] text-base leading-[1.85] text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </StorySection>

      <StorySection id="proof" eyebrow="02 / Proof" title="做过什么成果">
        <div className="space-y-5">
          <a className="group grid min-h-[280px] grid-cols-1 gap-8 border border-[var(--border)] p-[clamp(26px,4vw,56px)] transition-colors hover:bg-[rgba(110,247,231,0.075)] md:grid-cols-[42px_minmax(280px,0.9fr)_minmax(320px,1fr)] md:items-end" href="/achievements">
            <Trophy aria-hidden="true" className={iconClass} />
            <div>
              <span className={label}>Achievement</span>
              <strong className="mt-5 block text-[clamp(32px,5vw,74px)] font-black leading-[1] text-[var(--text)]">
                {achievements.length > 0 ? achievements[0].title : "成果档案待补全"}
              </strong>
            </div>
            <p className="max-w-[560px] text-base leading-[1.85] text-[var(--muted)]">
              {achievements.length > 0 ? achievements[0].description : "这里会放可验证的数据、截图、证明链接和阶段性结果。"}
            </p>
          </a>

          <a className="group grid min-h-[220px] grid-cols-1 gap-8 border border-[var(--border)] p-[clamp(26px,4vw,56px)] transition-colors hover:bg-[rgba(110,247,231,0.075)] md:grid-cols-[42px_minmax(280px,0.9fr)_minmax(320px,1fr)] md:items-end" href="/projects">
            <FolderKanban aria-hidden="true" className={iconClass} />
            <div>
              <span className={label}>Project</span>
              <strong className="mt-5 block text-[clamp(30px,4.4vw,64px)] font-black leading-[1] text-[var(--text)]">
                {projects.length > 0 ? projects[0].title : "项目档案待补全"}
              </strong>
            </div>
            <p className="max-w-[560px] text-base leading-[1.85] text-[var(--muted)]">
              {projects.length > 0 ? projects[0].description : "这里会放正在推进的系统、产品原型、流程图和复盘。"}
            </p>
          </a>
        </div>
      </StorySection>

      <StorySection id="timeline" eyebrow="03 / Timeline" title="最近留下的路标">
        <div className="ml-1 max-w-[1080px] border-l border-[var(--border-h)] py-5 pl-[clamp(24px,4vw,48px)]">
          {timeline.map((item) => (
            <a
              className="relative grid min-h-[132px] grid-cols-1 gap-3 pb-10 md:grid-cols-[140px_minmax(0,1fr)_90px] md:gap-8"
              href={item.href}
              key={`${item.type}-${item.slug}`}
            >
              <span className="absolute -left-[calc(clamp(24px,4vw,48px)+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              <time className={label}>{formatDateDot(item.date)}</time>
              <strong className="text-[clamp(20px,2.2vw,32px)] font-black leading-[1.25] text-[var(--text)]">
                {item.title}
              </strong>
              <span className={label}>{item.type}</span>
            </a>
          ))}
        </div>
      </StorySection>

      <StorySection id="essays" eyebrow="04 / Essays" title="最新思考">
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {essays.map((post) => (
            <a
              className="grid min-h-[88px] grid-cols-[1fr_24px] items-center gap-3 py-5 transition-colors hover:bg-[rgba(110,247,231,0.075)] md:grid-cols-[150px_minmax(0,1fr)_24px] md:gap-6"
              href={`/essays/${post.slug}/`}
              key={post.slug}
            >
              <time className={`${label} col-span-2 md:col-span-1`}>{formatDateDot(post.date)}</time>
              <strong className="text-[clamp(17px,2vw,25px)] font-extrabold leading-[1.45] text-[var(--text)]">
                {post.title}
              </strong>
              <ArrowUpRight aria-hidden="true" className={iconClass} />
            </a>
          ))}
        </div>
      </StorySection>

      <StorySection id="logs" eyebrow="05 / Logs" title="过程记录">
        <div className="max-w-[980px]">
          <p className="text-[clamp(24px,4vw,52px)] font-black leading-[1.18] text-[var(--text)]">
            日记像路上的灰尘，不一定漂亮，但能证明自己真的走过。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {diaries.map((post) => (
              <a className="inline-flex min-h-10 items-center border border-[var(--border)] px-4 text-xs font-extrabold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]" href={`/diaries/${post.slug}/`} key={post.slug}>{formatDateDot(post.date)}</a>
            ))}
            <a className="inline-flex min-h-10 items-center border border-[var(--border)] px-4 text-xs font-extrabold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]" href="/diaries">进入日记</a>
          </div>
        </div>
      </StorySection>
    </div>
  );
}
