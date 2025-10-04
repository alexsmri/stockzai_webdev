import { Fragment, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getBreadcrumbContent } from '../utils/functions';

function COM_Breadcrumbs() {
  const location = useLocation();

  const crumbs = useMemo(
    () => getBreadcrumbContent(location.pathname, location.search),
    [location.pathname, location.search]
  );

  if (!crumbs.length) {
    return null;
  }

  return (
    <div className="area-breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((label, index) => {
        const isLast = index === crumbs.length - 1;
        const textClass = isLast
          ? 'look-text-x1 look-text-normal'
          : 'look-text-x1 look-text-subtle';

        return (
          <Fragment key={`${label}-${index}`}>
            <span className={textClass}>{label}</span>
            {!isLast && <span className="look-text-subtle">/</span>}
          </Fragment>
        );
      })}
    </div>
  );
}

export default COM_Breadcrumbs;
