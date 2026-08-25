import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { resolveAssetUrl } from '../../../shared/utils/assetUrl';
import { getWorkSlug } from '../../portfolio/content/workSlug';
import { SiteFooter } from './SiteFooter';

export function WorkList() {
  const { content } = usePortfolioContent();
  const { aboutPage, works } = content;

  return (
    <section className="mx-auto flex h-full w-full max-w-7xl flex-col px-8 py-6 md:px-12 lg:px-20">
      <header className="mb-12 flex items-end justify-between">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
            {aboutPage.eyebrow}
          </span>
          <h2 className="text-4xl font-extralight tracking-tighter md:text-6xl">
            {aboutPage.title}
            <span className="font-bold text-blue-600">.</span>
          </h2>
        </div>
        <div className="hidden text-right md:block">
          <span className="block text-[10px] font-mono text-gray-300">{aboutPage.metaCode}</span>
          <span className="block text-[10px] font-mono uppercase text-gray-300">{aboutPage.metaLabel}</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col border-t border-black">
        {works.map((work) => (
          <Link to={`/work/${getWorkSlug(work)}`} key={work.id} className="group block">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="-mx-4 flex cursor-pointer flex-col gap-6 border-b border-gray-100 px-4 py-8 transition-all group-hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="w-24 shrink-0 text-[10px] font-mono text-gray-400 md:w-32">{work.year}</span>
                <h3 className="flex-1 text-2xl font-light tracking-tight transition-colors group-hover:text-blue-600">
                  {work.title}
                </h3>
                <div className="hidden items-center space-x-4 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                  <span className="bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    View Case
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-6 md:flex-row md:pl-20">
                <div className="aspect-[16/9] w-full overflow-hidden shadow-lg md:w-2/3">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    src={resolveAssetUrl(work.imageUrl)}
                    alt={work.title}
                    className="h-full w-full object-cover opacity-90 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </div>
                <div className="flex w-full flex-col justify-end space-y-4 pb-2 md:w-1/3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <span>{work.category}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-gray-500">{work.description}</p>
                </div>
              </div>
            </motion.article>
          </Link>
        ))}
      </div>

      <SiteFooter className="mt-12 flex flex-col gap-6 pt-8 md:flex-row md:items-center md:justify-between md:gap-0" />
    </section>
  );
}
