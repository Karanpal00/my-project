import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';
import WavePrism from './components/WavePrism';
import HeroModel from './components/HeroModel';
import { 
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs, SiWordpress, 
  SiPython, SiCplusplus, SiPandas, SiScikitlearn, SiNumpy, SiGnubash 
} from 'react-icons/si';
import { FaDatabase } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const Navbar = ({ onHover }) => (
  <nav className="fixed top-0 left-0 right-0 p-8 md:px-12 flex justify-between items-center z-[100] mix-blend-difference">
    <div className="font-syncopate font-bold text-2xl tracking-widest">KP</div>
    <div className="flex gap-8 font-inter text-sm uppercase tracking-wider">
      {['work', 'expertise', 'projects', 'contact'].map(id => (
        <a 
          key={id} 
          href={`#${id}`} 
          className="hover:text-accent transition-colors" 
          onMouseEnter={() => onHover(true)} 
          onMouseLeave={() => onHover(false)}
        >
          {id}
        </a>
      ))}
    </div>
  </nav>
);

const SkillBadge = ({ Icon, label, color }) => (
  <span className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 font-inter text-sm group-hover:border-white/20 transition-colors">
    <Icon style={{ color }} className="text-xl" /> {label}
  </span>
);

export default function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);

    const headings = gsap.utils.toArray('.section-heading');
    headings.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => el.classList.add('active-heading'),
        onLeaveBack: () => el.classList.remove('active-heading'),
      });
    });

    if (textRef.current) {
      const content = textRef.current.innerText;
      textRef.current.innerHTML = content.split('').map(c => 
        `<span class="hero-char inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
      ).join('');

      animate('.hero-char', {
        y: [40, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: stagger(25, { start: 800 }),
        ease: 'outExpo'
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const hoverHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  };

  return (
    <div className="font-outfit text-white selection:bg-accent selection:text-black overflow-x-hidden min-h-screen">
      <motion.div 
        className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference rounded-full bg-accent transition-all duration-300 ease-out ${isHovered ? 'w-20 h-20 bg-white' : 'w-4 h-4'}`}
        animate={{ x: mouse.x, y: mouse.y }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      
      <WavePrism 
        speed={0.15} beamThickness={0.3} distortion={0.4} 
        xScale={0.4} yScale={0.4} glow={1.2} backgroundColor="#030303" 
      />

      <Navbar onHover={setIsHovered} />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12">
        <section className="min-h-screen flex flex-col justify-center items-start relative z-10 py-32">
          <HeroModel />
          {['KARAN', 'PAL'].map((word, i) => (
            <motion.div 
              key={word}
              className="overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className={`font-syncopate font-black text-6xl md:text-[11vw] leading-[0.85] tracking-tighter uppercase ${i === 1 ? 'text-accent' : ''}`}>
                {word}
              </h1>
            </motion.div>
          ))}
          <p ref={textRef} className="font-inter text-text-dim text-lg md:text-xl max-w-lg font-light leading-relaxed mt-8">
            Full Stack Web Developer & Machine Learning Enthusiast. Crafting scalable architectures and immersive digital experiences.
          </p>
        </section>

        <section id="work" className="min-h-screen flex flex-col justify-center relative z-10 py-32">
          <h2 className="section-heading font-syncopate font-bold text-4xl md:text-7xl mb-16 text-transparent transition-all duration-500 uppercase" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
            Experience
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 py-16 border-t border-white/10 border-b group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            {...hoverHandlers}
          >
            <div>
              <span className="font-inter text-text-dim text-sm mb-6 inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10 tracking-wider">Feb 2026 — Present</span>
              <div className="font-outfit font-bold text-4xl mb-3">Full Stack Intern</div>
              <div className="font-syncopate text-accent text-xl tracking-widest">ADNET</div>
            </div>
            <ul className="space-y-6 font-inter text-text-dim text-lg leading-relaxed">
              {[
                "Spearheaded UI/UX architecture enhancements and optimized backend APIs, markedly improving overall system performance.",
                "Achieved a massive reduction in First Contentful Paint (FCP) from 7.2s to 1.6s via frontend performance optimizations and asset restructuring.",
                "Engineered a modular architecture design that reduced code redundancy by 40%, boosting maintainability and deployment efficiency.",
                "Developed highly scalable frontend components and backend integrations aligned with modern industry standards.",
                "Architected and built the adnet.co.in corporate site and custom headless CMS system on WordPress."
              ].map((item, i) => (
                <li key={i} className="pl-8 relative before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-accent before:rounded-full before:shadow-[0_0_15px_rgba(79,172,254,0.8)]">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        <section id="expertise" className="min-h-screen flex flex-col justify-center relative z-10 py-32">
          <h2 className="section-heading font-syncopate font-bold text-4xl md:text-7xl mb-16 text-transparent transition-all duration-500 uppercase" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
            Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(250px,auto)]">
            <motion.div 
              className="md:col-span-8 bg-white/5 border border-white/5 rounded-[2rem] p-12 backdrop-blur-xl flex flex-col justify-between group hover:bg-white/10 hover:border-white/15 transition-all duration-500"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              {...hoverHandlers}
            >
              <div>
                <h3 className="font-syncopate text-2xl text-accent mb-6 uppercase tracking-wider">Full Stack Web Dev</h3>
                <p className="font-inter text-text-dim text-lg leading-relaxed max-w-2xl">
                  Architecting high-performance, scalable web applications and seamless backend integrations. Specialized in React ecosystem and headless CMS architecture.
                </p>
              </div>
              <div className="flex flex-wrap gap-5 mt-10">
                <SkillBadge Icon={SiReact} label="React" color="#61DAFB" />
                <SkillBadge Icon={SiNextdotjs} label="Next.js" color="#FFFFFF" />
                <SkillBadge Icon={SiTypescript} label="TypeScript" color="#3178C6" />
                <SkillBadge Icon={SiTailwindcss} label="Tailwind" color="#06B6D4" />
                <SkillBadge Icon={SiNodedotjs} label="Node.js" color="#339933" />
                <SkillBadge Icon={SiWordpress} label="Headless WP" color="#21759B" />
              </div>
            </motion.div>

            <motion.div 
              className="md:col-span-4 md:row-span-2 bg-accent/5 border border-accent/20 rounded-[2rem] p-12 backdrop-blur-xl flex flex-col justify-between group hover:bg-accent/10 transition-all duration-500"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              {...hoverHandlers}
            >
              <div>
                <h3 className="font-syncopate text-2xl text-accent mb-8 uppercase tracking-wider">Publications</h3>
                <p className="font-inter text-white text-xl leading-relaxed mb-6 italic font-medium">"A Pragmatic Approach of Heart and Liver Disease Prediction using Machine Learning Classifiers"</p>
                <p className="font-inter text-text-dim text-base leading-relaxed">Published in 2024 International Conference on Emerging Systems and Intelligent Computing (ESIC).</p>
              </div>
              <a href="https://doi.org/10.1109/ESIC60604.2024.10481536" target="_blank" rel="noreferrer" className="mt-12 inline-flex items-center justify-center w-full px-8 py-4 rounded-full bg-accent text-black font-inter font-bold hover:bg-white transition-all transform hover:scale-[1.02]">
                View DOI ↗
              </a>
            </motion.div>

            <motion.div 
              className="md:col-span-4 bg-white/5 border border-white/5 rounded-[2rem] p-10 backdrop-blur-xl flex flex-col justify-between group hover:bg-white/10 transition-all duration-500"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              {...hoverHandlers}
            >
              <h3 className="font-syncopate text-xl text-accent mb-6 uppercase">Data Science</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge Icon={SiPython} label="ML" color="#3776AB" />
                <SkillBadge Icon={SiPandas} label="Pandas" color="#150458" />
                <SkillBadge Icon={SiScikitlearn} label="scikit-learn" color="#F7931E" />
                <SkillBadge Icon={SiNumpy} label="NumPy" color="#013243" />
              </div>
            </motion.div>

            <motion.div 
              className="md:col-span-4 bg-white/5 border border-white/5 rounded-[2rem] p-10 backdrop-blur-xl flex flex-col justify-between group hover:bg-white/10 transition-all duration-500"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              {...hoverHandlers}
            >
              <h3 className="font-syncopate text-xl text-accent mb-6 uppercase">Core & Systems</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge Icon={SiCplusplus} label="C++" color="#00599C" />
                <SkillBadge Icon={SiPython} label="Python" color="#3776AB" />
                <SkillBadge Icon={FaDatabase} label="RDBMS" color="#336791" />
                <SkillBadge Icon={SiGnubash} label="Bash" color="#FFFFFF" />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="projects" className="min-h-screen flex flex-col justify-center relative z-10 py-32">
          <h2 className="section-heading font-syncopate font-bold text-4xl md:text-7xl mb-16 text-transparent transition-all duration-500 uppercase" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
            Selected Works
          </h2>
          <div className="flex flex-col">
            {[
              { title: 'ADNET Web & CMS', desc: 'Architected the corporate site and headless CMS leveraging WordPress, optimizing performance and establishing a robust content management pipeline.', tech: 'React / Vite / WP', link: 'https://adnet.co.in' },
              { title: 'Admin Dashboard', desc: 'Responsive admin dashboard interface developed utilizing advanced CSS Grid architectures and semantic HTML, ensuring fluid layout adaptivity.', tech: 'HTML / CSS', link: 'https://github.com/Karanpal00/Admin-dashboard' },
              { title: 'Restaurant Page', desc: 'Dynamic single-page restaurant application built with vanilla JavaScript, featuring modular component architecture and dynamic DOM generation.', tech: 'JavaScript', link: 'https://github.com/Karanpal00/restaurant-page' },
              { title: 'Tic-Tac-Toe Engine', desc: 'Interactive Tic-Tac-Toe game leveraging vanilla JavaScript for game state management, logic handling, and DOM rendering.', tech: 'JavaScript', link: 'https://github.com/Karanpal00/tic-tac-toe' }
            ].map((proj) => (
              <motion.div 
                key={proj.title}
                className="flex flex-col md:flex-row justify-between items-start md:items-center py-16 border-b border-white/10 cursor-pointer relative group transition-all duration-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                {...hoverHandlers}
                onClick={() => window.open(proj.link, '_blank')}
              >
                <div className="absolute inset-0 bg-white/[0.02] scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 z-0" />
                <div className="relative z-10 max-w-2xl pointer-events-none">
                  <h3 className="font-syncopate text-3xl md:text-5xl mb-6 group-hover:text-accent group-hover:translate-x-6 transition-all duration-500 uppercase tracking-tight">{proj.title}</h3>
                  <p className="font-inter text-text-dim text-lg leading-relaxed group-hover:text-white transition-colors duration-500">{proj.desc}</p>
                </div>
                <div className="relative z-10 font-inter text-accent font-bold mt-6 md:mt-0 px-6 py-2 border border-accent/20 rounded-full group-hover:bg-accent group-hover:text-black transition-all duration-500 uppercase tracking-widest text-sm">{proj.tech}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="min-h-screen flex flex-col justify-center items-center text-center relative z-10 py-32 overflow-hidden">
          <motion.h2 
            className="font-syncopate font-black text-6xl md:text-[15vw] leading-none text-transparent mb-16 cursor-pointer hover:text-white transition-all duration-500"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease: "easeOut" }}
            {...hoverHandlers}
          >
            LET'S TALK
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-10 font-syncopate text-xl uppercase tracking-widest">
            {['EMAIL', 'GITHUB', 'PHONE'].map((label) => (
              <a 
                key={label} 
                href={label === 'EMAIL' ? 'mailto:karanpal9901@gmail.com' : label === 'GITHUB' ? 'https://github.com/Karanpal00' : 'tel:+919110363198'} 
                target={label !== 'PHONE' ? "_blank" : undefined} 
                rel="noreferrer" 
                className="relative group p-4 overflow-hidden" 
                {...hoverHandlers}
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </a>
            ))}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.active-heading { color: white !important; -webkit-text-stroke: 0px !important; }` }} />
    </div>
  );
}
