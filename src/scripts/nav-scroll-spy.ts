/**
 * Highlights the nav link matching the section currently in view on the homepage.
 */
export function initNavScrollSpy(sectionIds: string[]) {
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-nav-section]");
  if (links.length === 0) return;

  const setActive = (key: string) => {
    links.forEach((link) => {
      link.classList.toggle("w--current", link.dataset.navSection === key);
    });
  };

  const observed = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (observed.length === 0) return;

  let activeKey = sectionIds[0];
  const ratios = new Map<string, number>();

  sectionIds.forEach((id) => ratios.set(id, 0));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let bestKey = activeKey;
      let bestRatio = -1;

      for (const id of sectionIds) {
        const ratio = ratios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestKey = id;
        }
      }

      if (bestRatio > 0 && bestKey !== activeKey) {
        activeKey = bestKey;
        setActive(activeKey);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    },
  );

  observed.forEach((el) => observer.observe(el));
  setActive(activeKey);
}
