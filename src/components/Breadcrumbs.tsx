import React from "react";

interface BreadcrumbPath {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  paths: BreadcrumbPath[];
}

function Breadcrumbs({ paths }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb">
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
        {paths.map((path: BreadcrumbPath, idx: number) => (
          <li key={path.href} style={{ marginRight: 8 }}>
            <a href={path.href}>{path.label}</a>
            {idx < paths.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs; 